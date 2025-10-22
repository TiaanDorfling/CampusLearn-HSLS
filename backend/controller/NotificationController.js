// controller/NotificationController.js
import Notification from "../model/NotificationService.js";

/** List all notifications for logged-in user */
export async function getAll(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ ok: false, error: "Unauthorized" });

    const items = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ ok: true, count: items.length, items });
  } catch (err) {
    console.error("getAll notifications error:", err);
    return res.status(500).json({ ok: false, error: "Failed to fetch notifications" });
  }
}

/** Mark specific notification as read */
export async function markRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ ok: false, error: "Unauthorized" });

    const updated = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ ok: false, error: "Notification not found" });
    return res.json({ ok: true, message: "Marked as read", notification: updated });
  } catch (err) {
    console.error("markRead error:", err);
    return res.status(500).json({ ok: false, error: "Failed to update notification" });
  }
}

/** Delete notification */
export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ ok: false, error: "Unauthorized" });

    const deleted = await Notification.findOneAndDelete({ _id: id, userId });
    if (!deleted) return res.status(404).json({ ok: false, error: "Notification not found" });

    return res.json({ ok: true, message: "Notification deleted" });
  } catch (err) {
    console.error("deleteNotification error:", err);
    return res.status(500).json({ ok: false, error: "Failed to delete notification" });
  }
}
