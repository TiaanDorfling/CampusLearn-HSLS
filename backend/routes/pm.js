import express from "express";
import mongoose from "mongoose";
import { Conversation, Message } from "../model/privateMessage.js";
import { auth } from "../middleware/auth.js";
import User from "../model/UserModel.js";
import Notification from "../model/Notification.js";

const router = express.Router();

function normalize(m, meId) {
  const senderUser = m.sender?.user && (m.sender.user._id ? m.sender.user : null);
  return {
    ...m,
    body: m.text,
    from: senderUser
      ? { _id: senderUser._id, name: senderUser.name, email: senderUser.email }
      : null,
    fromEmail: senderUser?.email || null,
    meId,
  };
}

async function findOrCreateDM(currentUser, toUserId) {
  const aid = new mongoose.Types.ObjectId(currentUser._id);
  const bid = new mongoose.Types.ObjectId(toUserId);

  let convo = await Conversation.findOne({
    "participants.user": { $all: [aid, bid] },
    $expr: { $eq: [{ $size: "$participants" }, 2] },
  });

  if (!convo) {
    console.log("[PM] Creating conversation", { from: aid.toString(), to: bid.toString() });
    convo = await Conversation.create({
      participants: [
        { user: aid, role: currentUser.role },
        { user: bid, role: "student" },
      ],
    });
  }
  return convo;
}

router.get("/", auth(true), async (req, res) => {
  try {
    const userId = req.user._id;
    const onlyUnread = String(req.query.onlyUnread) === "true";

    const convos = await Conversation.find({ "participants.user": userId })
      .select("_id")
      .lean();
    const convoIds = convos.map((c) => c._id);

    const q = { conversation: { $in: convoIds } };
    if (onlyUnread) q.isReadBy = { $ne: userId };

    let items = await Message.find(q)
      .populate("sender.user", "name email")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    items = items.map((m) => normalize(m, userId));
    res.json({ items });
  } catch (err) {
    console.error("[PM] GET error:", err);
    res.status(500).json({ error: "Failed to fetch private messages" });
  }
});

router.post("/", auth(true), async (req, res) => {
  try {
    const { toUserId, subject, body } = req.body || {};
    if (!toUserId || !body?.trim()) {
      return res.status(400).json({ error: "toUserId and body are required" });
    }

    const recipient = await User.findById(toUserId).select("_id name email").lean();
    if (!recipient) {
      return res.status(404).json({ error: "Recipient user not found" });
    }

    const me = await User.findById(req.user._id).select("name email").lean();

    const convo = await findOrCreateDM(req.user, toUserId);

    const created = await Message.create({
      conversation: convo._id,
      sender: { user: req.user._id, role: req.user.role },
      subject: subject || "",
      text: body,
      isReadBy: [req.user._id],
    });

    await Conversation.updateOne(
      { _id: convo._id },
      { $set: { updatedAt: new Date() } }
    );

    try {
      const preview = body.trim().replace(/\s+/g, " ").slice(0, 120);
      await Notification.create({
        userId: recipient._id,
        type: "pm:new",
        message:
          `${me?.name || me?.email || "Someone"} sent you a message` +
          (preview ? `: "${preview}"` : ""),
        link: `/app/messages?c=${convo._id}`,
        meta: {
          conversationId: convo._id,
          messageId: created._id,
          fromUserId: req.user._id,
          subject: subject || "",
        },
      });
    } catch (nerr) {
      console.error("[PM] Notification create failed:", nerr);
    }

    const doc = await Message.findById(created._id)
      .populate("sender.user", "name email")
      .lean();

    res.status(201).json({ message: normalize(doc, req.user._id) });
  } catch (err) {
    console.error("[PM] POST error:", err);
    res.status(500).json({ error: "Failed to send private message" });
  }
});

router.patch("/:id/read", auth(true), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Message.updateOne(
      { _id: id },
      { $addToSet: { isReadBy: req.user._id } }
    );
    if (!result.matchedCount) return res.status(404).json({ error: "Message not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error("[PM] PATCH error:", err);
    res.status(500).json({ error: "Failed to mark PM as read" });
  }
});

export default router;
