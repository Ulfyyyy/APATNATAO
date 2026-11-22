import { sql, init, who, body, send, check, hash, idOf } from "../lib/db.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return send(res, { err: "Use POST." }, 405);
    await init();
    const u = await who(req);
    if (!u) return send(res, { err: "Please log in again." }, 401);
    const b = body(req), staff = u.role === "staff";

    if (b.op === "scan") {
      const raw = String(b.id || "").toUpperCase(), n = idOf(raw);
      if (!staff && n !== u.id) return send(res, { err: "You can only check yourself in." }, 403);
      const [m] = n ? await sql`SELECT id, name, suspended, expires IS NULL AS none, expires < CURRENT_DATE AS expired FROM users WHERE id = ${n} AND role = 'member'` : [];
      if (!m) {
        await sql`INSERT INTO visits(tried, ok) VALUES(${raw.slice(0, 40)}, false)`;
        return send(res, { k: "no", why: "unknown" });
      }
      const [open] = await sql`SELECT id FROM visits WHERE user_id = ${m.id} AND ok AND out_at IS NULL AND in_at > now() - interval '14 hours' LIMIT 1`;
      if (open) {
        const [r] = await sql`UPDATE visits SET out_at = now() WHERE id = ${open.id} RETURNING (extract(epoch FROM out_at - in_at) / 60)::float AS mins`;
        return send(res, { k: "out", name: m.name, mins: Math.max(1, Math.round(r.mins)) });
      }
      const why = m.suspended ? "suspended" : m.none ? "none" : m.expired ? "expired" : null;
      await sql`INSERT INTO visits(user_id, ok) VALUES(${m.id}, ${!why})`;
      return send(res, why ? { k: "no", why, name: m.name } : { k: "ok", name: m.name });
    }

    if (!staff) return send(res, { err: "Staff only." }, 403);

    if (b.op === "manage") {
      const n = idOf(String(b.id || "").toUpperCase());
      if (!n) return send(res, { err: "Unknown member." }, 400);
      if (b.act === "toggle") {
        await sql`UPDATE users SET suspended = NOT suspended WHERE id = ${n} AND role = 'member'`;
      } else if (b.act === "add30" || b.act === "add365") {
        const d = b.act === "add30" ? 30 : 365;
        // Extends from the current expiry if still valid, otherwise from today.
        await sql`UPDATE users SET plan = ${d === 30 ? "Monthly" : "Annual"}, expires = GREATEST(COALESCE(expires, CURRENT_DATE), CURRENT_DATE) + ${d}::int WHERE id = ${n} AND role = 'member'`;
      } else return send(res, { err: "Unknown action." }, 400);
      return send(res, { ok: 1 });
    }

    if (b.op === "register") {
      const bad = check(b);
      if (bad) return send(res, { err: bad });
      const email = b.email.trim().toLowerCase();
      if ((await sql`SELECT 1 FROM users WHERE email = ${email}`).length) return send(res, { err: "That email already has an account." });
      await sql`INSERT INTO users(name, email, mobile, pass_hash) VALUES(${b.name.trim()}, ${email}, ${b.mobile.trim()}, ${hash("welcome123")})`;
      return send(res, { ok: 1 });
    }

    send(res, { err: "Unknown request." }, 400);
  } catch (e) {
    console.error(e);
    send(res, { err: "Server error. Try again." }, 500);
  }
}
