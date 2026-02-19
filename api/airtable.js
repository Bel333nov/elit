export default async function handler(req, res) {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    const token = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const table = process.env.AIRTABLE_TABLE; // имя таблицы или tbl...

    if (!token || !baseId || !table) {
      return res.status(500).json({
        ok: false,
        error: "Missing env vars",
        need: ["AIRTABLE_TOKEN", "AIRTABLE_BASE_ID", "AIRTABLE_TABLE"],
        got: {
          AIRTABLE_TOKEN: !!token,
          AIRTABLE_BASE_ID: !!baseId,
          AIRTABLE_TABLE: !!table,
        },
      });
    }

    const view = process.env.AIRTABLE_VIEW || ""; // можно не задавать
    const pageSize = 100;

    const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`);
    url.searchParams.set("pageSize", String(pageSize));
    if (view) url.searchParams.set("view", view);

    const r = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = null; }

    if (!r.ok) {
      return res.status(r.status).json({
        ok: false,
        error: "Airtable request failed",
        status: r.status,
        response: data || text,
      });
    }

    const records = Array.isArray(data?.records)
      ? data.records.map(x => x.fields)
      : [];

    return res.status(200).json({ ok: true, records });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
