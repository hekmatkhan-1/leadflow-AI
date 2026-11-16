import { createFileRoute } from "@tanstack/react-router";
import { sql } from "~/db";

/**
 * POST /api/waitlist — the only place the marketing site stores anything.
 *
 * Honesty contract: a 2xx response is returned only after the address is
 * actually in the database. If the database is not connected (DATABASE_URL
 * unset) or the insert fails, we return an error and the form shows an honest
 * "not live yet" state instead of a fake success.
 */

const EMAIL_MAX_LENGTH = 254;

/** Deliberately strict-ish: one @, no spaces, a dot in the domain, sane TLD. */
function isValidEmail(value: string): boolean {
  if (value.length === 0 || value.length > EMAIL_MAX_LENGTH) return false;
  if (/\s/.test(value)) return false;
  return /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(
    value,
  );
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

/** Create the table once per server process, not on every submission. */
let schemaReady: Promise<void> | null = null;
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = sql();
      await db`create table if not exists waitlist (
        email text primary key,
        created_at timestamptz not null default now()
      )`;
    })().catch((error: unknown) => {
      // Let the next request retry instead of caching a broken promise.
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

export const Route = createFileRoute("/api/waitlist")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return json(
            {
              ok: false,
              code: "invalid_json",
              message: "Send a JSON body like {\"email\":\"you@company.com\"}.",
            },
            400,
          );
        }

        const raw =
          typeof payload === "object" && payload !== null
            ? (payload as { email?: unknown }).email
            : undefined;
        const email =
          typeof raw === "string" ? raw.trim().toLowerCase() : "";

        if (!isValidEmail(email)) {
          return json(
            {
              ok: false,
              code: "invalid_email",
              message: "That doesn't look like a valid email address.",
            },
            400,
          );
        }

        // No database connected yet — say so instead of pretending it worked.
        if (!process.env.DATABASE_URL) {
          return json(
            {
              ok: false,
              code: "unavailable",
              message:
                "Early access signup isn't live yet — check back shortly.",
            },
            503,
          );
        }

        try {
          await ensureSchema();
          const db = sql();
          const inserted = await db`
            insert into waitlist (email)
            values (${email})
            on conflict (email) do nothing
            returning email
          `;

          if (inserted.length === 0) {
            // Already signed up — a success for the person, not a new row.
            return json(
              {
                ok: true,
                code: "duplicate",
                message: "You're already on the list.",
              },
              200,
            );
          }

          return json(
            {
              ok: true,
              code: "created",
              message: "You're on the list.",
            },
            201,
          );
        } catch (error) {
          console.error("[waitlist] insert failed", error);
          return json(
            {
              ok: false,
              code: "server_error",
              message:
                "Something went wrong on our side — nothing was saved. Please try again.",
            },
            500,
          );
        }
      },

      // Lets a waitlisted person delete their own row (linked from /privacy).
      DELETE: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return json(
            {
              ok: false,
              code: "invalid_json",
              message: "Send a JSON body like {\"email\":\"you@company.com\"}.",
            },
            400,
          );
        }

        const raw =
          typeof payload === "object" && payload !== null
            ? (payload as { email?: unknown }).email
            : undefined;
        const email =
          typeof raw === "string" ? raw.trim().toLowerCase() : "";

        if (!isValidEmail(email)) {
          return json(
            {
              ok: false,
              code: "invalid_email",
              message: "That doesn't look like a valid email address.",
            },
            400,
          );
        }

        if (!process.env.DATABASE_URL) {
          return json(
            {
              ok: false,
              code: "unavailable",
              message: "Waitlist removal isn't live yet — check back shortly.",
            },
            503,
          );
        }

        try {
          await ensureSchema();
          const db = sql();
          const deleted = await db`
            delete from waitlist where email = ${email} returning email
          `;
          return json(
            {
              ok: true,
              code: deleted.length === 0 ? "not_found" : "deleted",
              message:
                deleted.length === 0
                  ? "That address isn't on the list."
                  : "Removed from the list.",
            },
            200,
          );
        } catch (error) {
          console.error("[waitlist] delete failed", error);
          return json(
            {
              ok: false,
              code: "server_error",
              message:
                "Something went wrong on our side — nothing was removed. Please try again.",
            },
            500,
          );
        }
      },

      // Anything other than a POST/DELETE is a mistake; be explicit rather than 404.
      GET: async () =>
        json(
          {
            ok: false,
            code: "method_not_allowed",
            message: "POST an email address to join the waitlist.",
          },
          405,
        ),
    },
  },
});
