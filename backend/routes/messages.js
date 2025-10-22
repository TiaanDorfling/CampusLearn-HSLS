// backend/routes/messages.js
import express from "express";
import { auth } from "../middleware/auth.js";
import { Conversation, Message } from "../model/privateMessage.js";
import Notification from "../model/Notification.js";

const router = express.Router();

/**
 * POST /api/messages/conversations
 * Create a new conversation between participants
 */
router.post("/conversations", auth(true), async (req, res) => {
  try {
    const { participants } = req.body;

    if (!participants || participants.length < 2)
      return res.status(400).json({ error: "At least two participants required" });

    // naive uniqueness: same participants (order-agnostic) and same size
    const existing = await Conversation.findOne({
      "participants.user": { $all: participants.map((p) => p.user) },
      $expr: { $eq: [{ $size: "$participants" }, participants.length] },
    });

    if (existing) return res.status(200).json({ conversation: existing });

    const convo = await Conversation.create({ participants });
    return res.status(201).json({ conversation: convo });
  } catch (err) {
    console.error("Create conversation error:", err);
    return res.status(500).json({ error: "Failed to create conversation" });
  }
});

/**
 * GET /api/messages/conversations
 */
router.get("/conversations", auth(true), async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      "participants.user": userId,
    })
      .populate("participants.user", "name email role")
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({ items: conversations });
  } catch (err) {
    console.error("Get conversations error:", err);
    return res.status(500).json({ error: "Failed to get conversations" });
  }
});

/**
 * POST /api/messages/:conversationId
 * Send a message in a conversation
 */
router.post("/:conversationId", auth(true), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, subject = "" } = req.body;
    const user = req.user;

    if (!text?.trim()) return res.status(400).json({ error: "Message text required" });

    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ error: "Conversation not found" });

    // Create message (sender is read by default)
    const msg = await Message.create({
      conversation: convo._id,
      sender: { user: user._id, role: user.role },
      subject,
      text,
      isReadBy: [user._id],
    });

    convo.updatedAt = new Date();
    await convo.save();

    // Notify all OTHER participants
    const recipientIds = (convo.participants || [])
      .map((p) => String(p.user))
      .filter((id) => id !== String(user._id));

    const notifs = recipientIds.map((uid) => ({
      user: uid,
      type: "message",
      title: subject || "New message",
      text: text.slice(0, 140),
      data: { conversationId: String(convo._id), messageId: String(msg._id) },
      read: false,
    }));
    if (notifs.length) await Notification.insertMany(notifs);

    // return populated sender info for UI
    const doc = await Message.findById(msg._id)
      .populate("sender.user", "name email role")
      .lean();

    return res.status(201).json({ message: doc });
  } catch (err) {
    console.error("Send message error:", err);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

/**
 * GET /api/messages/:conversationId
 */
router.get("/:conversationId", auth(true), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversation: conversationId })
      .populate("sender.user", "name email role")
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({ items: messages });
  } catch (err) {
    console.error("Get messages error:", err);
    return res.status(500).json({ error: "Failed to get messages" });
  }
});

/**
 * PUT /api/messages/read
 * Mark a single message as read
 * body: { messageId }
 */
router.put("/read", auth(true), async (req, res) => {
  try {
    const { messageId } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (!message.isReadBy.map(String).includes(String(userId))) {
      message.isReadBy.push(userId);
      await message.save();
    }

    // also flip any message notifications for this message/user
    await Notification.updateMany(
      { user: userId, type: "message", "data.messageId": String(messageId) },
      { $set: { read: true } }
    );

    return res.status(200).json({ message });
  } catch (err) {
    console.error("Mark read error:", err);
    return res.status(500).json({ error: "Failed to mark message as read" });
  }
});

/**
 * PUT /api/messages/read-many
 * Mark multiple messages as read (bulk)
 * body: { messageIds: string[] }
 */
router.put("/read-many", auth(true), async (req, res) => {
  try {
    const { messageIds } = req.body || {};
    const userId = req.user._id;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ error: "messageIds (array) required" });
    }

    const ids = messageIds.map(String);

    const result = await Message.updateMany(
      { _id: { $in: ids }, isReadBy: { $ne: userId } },
      { $addToSet: { isReadBy: userId } }
    );

    // also flip related message notifications for this user
    await Notification.updateMany(
      { user: userId, type: "message", "data.messageId": { $in: ids } },
      { $set: { read: true } }
    );

    // optional: return the updated docs (handy for the UI to reconcile)
    const updated = await Message.find({ _id: { $in: ids } }).lean();

    return res.status(200).json({ ok: true, modifiedCount: result.modifiedCount, items: updated });
  } catch (err) {
    console.error("Mark read-many error:", err);
    return res.status(500).json({ error: "Failed to bulk mark messages as read" });
  }
});

/**
 * PUT /api/messages/:conversationId/read-all
 * Mark ALL messages in a conversation as read for the current user
 */
router.put("/:conversationId/read-all", auth(true), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // mark all messages in the conversation as read for this user
    const result = await Message.updateMany(
      { conversation: conversationId, isReadBy: { $ne: userId } },
      { $addToSet: { isReadBy: userId } }
    );

    // mark any message notifications in this conversation as read for this user
    const ids = await Message.find({ conversation: conversationId }, { _id: 1 }).lean();
    const msgIds = ids.map((m) => String(m._id));
    if (msgIds.length) {
      await Notification.updateMany(
        { user: userId, type: "message", "data.messageId": { $in: msgIds } },
        { $set: { read: true } }
      );
    }

    return res.status(200).json({ ok: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("Mark conversation read-all error:", err);
    return res.status(500).json({ error: "Failed to mark conversation as read" });
  }
});

export default router;
