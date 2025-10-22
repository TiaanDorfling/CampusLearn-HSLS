export async function healthz(req, res) {
  try {
    return res.json({
      ok: true,
      status: "operational",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("healthz error:", err);
    return res.status(500).json({ ok: false, error: "Health check failed" });
  }
}
