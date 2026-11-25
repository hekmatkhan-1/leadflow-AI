#!/usr/bin/env bash
#
# Watchdog for the LeadFlow product app on port 3000.
#
# Runs the Next.js production server in the foreground and restarts it whenever
# it exits, with exponential backoff so a crash loop cannot spin (2s -> 60s cap,
# reset to 2s once an instance has stayed up for 60s). Restarts are logged to
# /home/team/shared/leadflow/.run/watchdog.log.
#
# Normally started detached by /home/team/shared/start-app.sh — do not run it in
# a shell you care about; it loops until it is killed. A flock keeps it to a
# single instance, so re-running start-app.sh can never stack watchdogs.
set -uo pipefail

APP_DIR=/home/team/shared/leadflow
PORT=3000
LOG_DIR="$APP_DIR/.run"
LOG="$LOG_DIR/app.log"
WD_LOG="$LOG_DIR/watchdog.log"
LOCK="$LOG_DIR/watchdog.lock"
PID_FILE="$LOG_DIR/app.pid"

mkdir -p "$LOG_DIR"

# One watchdog at a time. The lock is released when this script exits.
exec 9>"$LOCK"
if ! flock -n 9; then
  echo "$(date -Is) watchdog already running; nothing to do" >>"$WD_LOG"
  exit 0
fi

cd "$APP_DIR" || exit 1

log() { echo "$(date -Is) $*" >>"$WD_LOG"; }

# Stop any leftover instance of the app before starting a new one. `lsof` cannot
# map port 3000 back to a pid in this container (it lists nothing while the
# socket is clearly bound), so this matches on the process command lines instead.
stop_app() {
  pkill -f 'next-server' 2>/dev/null
  pkill -f 'npm run start -- -H 0.0.0.0 -p 3000' 2>/dev/null
  pkill -f 'npm run start -H 0.0.0.0 -p 3000' 2>/dev/null
  for _ in $(seq 1 25); do
    pgrep -f 'next-server' >/dev/null 2>&1 || return 0
    sleep 0.2
  done
  pkill -9 -f 'next-server' 2>/dev/null
  return 0
}

backoff=2
log "watchdog started (pid $$)"

while true; do
  stop_app
  log "starting app: npm run start -- -H 0.0.0.0 -p $PORT"
  # fd 9 is closed for the child so the app never holds the watchdog lock.
  npm run start -- -H 0.0.0.0 -p "$PORT" >>"$LOG" 2>&1 9>&- &
  child=$!
  echo "$child" >"$PID_FILE"
  started=$(date +%s)

  wait "$child"
  code=$?
  ran=$(( $(date +%s) - started ))

  # A long-lived instance that died starts over at the short delay; a crash
  # loop backs off instead of hammering the CPU.
  if [ "$ran" -ge 60 ]; then
    backoff=2
  fi
  log "app exited (status $code) after ${ran}s; restarting in ${backoff}s"
  sleep "$backoff"

  backoff=$(( backoff * 2 ))
  [ "$backoff" -gt 60 ] && backoff=60
done
