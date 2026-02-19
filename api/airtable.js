module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    return res.status(200).json({
      ok: true,
      message: "API работает",
      records: []
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unknown error"
    });
  }
};
