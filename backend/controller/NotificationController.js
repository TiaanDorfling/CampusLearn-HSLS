import Notification from "../model/Notification.js";

export async function getAll(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const items = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ ok: true, count: items.length, items });
  } catch (err) {
    console.error("notifications.getAll error:", err);
    return res.status(500).json({ ok: false, error: "Failed to fetch notifications" });
  }
}

export async function markRead(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;
    const updated = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { read: true } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ ok: false, error: "Notification not found" });
    return res.json({ ok: true, notification: updated });
  } catch (err) {
    console.error("notifications.markRead error:", err);
    return res.status(500).json({ ok: false, error: "Failed to update notification" });
  }
}

export async function markAllRead(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const result = await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } }
    );
    return res.json({ ok: true, matched: result.matchedCount ?? result.n, modified: result.modifiedCount ?? result.nModified });
  } catch (err) {
    console.error("notifications.markAllRead error:", err);
    return res.status(500).json({ ok: false, error: "Failed to update notifications" });
  }
}

export async function deleteNotification(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;
    const deleted = await Notification.findOneAndDelete({ _id: id, user: userId });
    if (!deleted) return res.status(404).json({ ok: false, error: "Notification not found" });
    return res.json({ ok: true, message: "Notification deleted" });
  } catch (err) {
    console.error("notifications.delete error:", err);
    return res.status(500).json({ ok: false, error: "Failed to delete notification" });
  }
}
