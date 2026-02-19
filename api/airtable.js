export default async function handler(req, res) {
  try {
    const token = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableId = process.env.AIRTABLE_TABLE_ID;
    const viewId = process.env.AIRTABLE_VIEW_ID; // optional

    if (!token || !baseId || !tableId) {
      return res.status(500).json({ error: "Missing Airtable env vars" });
    }

    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`);
    if (viewId) url.searchParams.set("view", viewId);

    const r = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({ error: "Airtable error", details: data });
    }

    // отдаём на фронт только fields, чтобы было удобнее
    const records = (data.records || []).map((rec) => ({
      id: rec.id,
      ...rec.fields,
    }));

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=300");
    return res.status(200).json({ records });
  } catch (e) {
    return res.status(500).json({ error: "Server error", details: String(e) });
  }
}
