#!/usr/bin/env bash
#
# Start (or restart) the LeadFlow product app on port 3000 in production mode.
#
#   ./start-app.sh            # install deps if missing, build if needed, (re)start
#   ./start-app.sh --build    # force a fresh production build, then restart
#   ./start-app.sh --force    # restart without rebuilding
#
# This is the one command needed to recover the live site after a machine
# rebuild. Everything it touches lives under /home, which is the only
# persistent path — runtime dependencies must never be bind-mounted from /tmp.
#
# The app itself is kept alive by ./watchdog.sh, which this script starts
# detached. `start` in /home/team/shared/site/package.json runs this script, so
# the machine's boot supervisor (which starts that directory when
# site/dist/server/server.js exists) brings the product app back on its own.
set -euo pipefail

APP_DIR=/home/team/shared/leadflow
PORT=3000
LOG_DIR="$APP_DIR/.run"
LOG="$LOG_DIR/app.log"
WATCHDOG=/home/team/shared/watchdog.sh
WD_LOG="$LOG_DIR/watchdog.log"
WD_PID_FILE="$LOG_DIR/watchdog.pid"

FORCE=0
case "${1:-}" in
  --force | --build) FORCE=1 ;;
esac

cd "$APP_DIR"
mkdir -p "$LOG_DIR"

# 0. If the app is already healthy and supervised, do nothing. Keeps repeated
#    invocations (e.g. a boot supervisor that re-runs its start command) from
#    restarting the app in a loop.
if [ "$FORCE" -eq 0 ] && [ -f "$WD_PID_FILE" ] && kill -0 "$(cat "$WD_PID_FILE")" 2>/dev/null; then
  if curl -sf -o /dev/null "http://127.0.0.1:$PORT/"; then
    echo "LeadFlow app already up on port $PORT and supervised. Use --force to restart."
    exit 0
  fi
fi

# 1. Dependencies (node_modules must be a real directory under /home).
if [ ! -d node_modules/next ]; then
  echo "Installing dependencies into $APP_DIR/node_modules ..."
  npm install --no-audit --no-fund
fi

# 2. Production build.
if [ "${1:-}" = "--build" ] || [ ! -f .next/BUILD_ID ]; then
  echo "Building production bundle ..."
  npm run build
fi

# 3. Stop the previous watchdog, then any leftover app instance.
if [ -f "$WD_PID_FILE" ]; then
  old_wd=$(cat "$WD_PID_FILE" 2>/dev/null || true)
  if [ -n "${old_wd:-}" ] && kill -0 "$old_wd" 2>/dev/null; then
    kill "$old_wd" 2>/dev/null || true
    sleep 1
  fi
fi
# `lsof` cannot map port 3000 back to a pid in this container, so match the
# app's command line instead of the socket.
pkill -f 'next-server' 2>/dev/null || true
pkill -f "npm run start -- -H 0.0.0.0 -p $PORT" 2>/dev/null || true
pkill -f "npm run start -H 0.0.0.0 -p $PORT" 2>/dev/null || true
for _ in $(seq 1 25); do
  pgrep -f 'next-server' >/dev/null 2>&1 || break
  sleep 0.2
done
sleep 1

# 4. Start the watchdog detached; it runs the app and restarts it on exit.
#    `next start` loads $APP_DIR/.env.local itself (Supabase + OpenAI values).
setsid nohup bash "$WATCHDOG" >>"$WD_LOG" 2>&1 </dev/null &
echo $! >"$WD_PID_FILE"

# 5. Wait for it to answer, and fail loudly if the watchdog is not there to
#    keep it up (a silent success here is how the URL ended up on a stale page).
for _ in $(seq 1 45); do
  if ! kill -0 "$(cat "$WD_PID_FILE")" 2>/dev/null; then
    echo "Watchdog exited instead of supervising the app. Log: $WD_LOG" >&2
    tail -20 "$WD_LOG" >&2
    exit 1
  fi
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/" || true)
  if [ "$code" = "200" ]; then
    echo "LeadFlow app is up on port $PORT (HTTP 200), supervised by watchdog (pid $(cat "$WD_PID_FILE")). Logs: $LOG, $WD_LOG"
    exit 0
  fi
  sleep 1
done

echo "App did not answer on port $PORT. Last log lines:" >&2
tail -30 "$LOG" >&2
exit 1
