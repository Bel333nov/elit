export default async function handler(req, res) {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    const token = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const table = process.env.AIRTABLE_TABLE_ID; // <-- используем твою переменную

    if (!token || !baseId || !table) {
      return res.status(500).json({
        ok: false,
        error: "Missing env vars",
        got: {
          AIRTABLE_TOKEN: !!token,
          AIRTABLE_BASE_ID: !!baseId,
          AIRTABLE_TABLE_ID: !!table
        }
      });
    }

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: data
      });
    }

    const records = data.records.map(r => r.fields);

    return res.status(200).json({
      ok: true,
      records
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
