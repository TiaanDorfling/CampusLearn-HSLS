import express from "express";
import { body, query, param } from "express-validator";
import { auth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import CalendarEvent from "../model/CalendarEvent.js";
import Notification from "../model/Notification.js";

const router = express.Router();

/* -------------------------------- Helpers -------------------------------- */

function parseISO(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

async function notifyUsers(users, payloadBuilder) {
  if (!Array.isArray(users) || !users.length) return;
  const docs = users
    .map((u) => payloadBuilder(u))
    .filter(Boolean);
  if (docs.length) {
    try {
      await Notification.insertMany(docs, { ordered: false });
    } catch (e) {
      console.warn("[calendar] notify error:", e.message);
    }
  }
}

/* ------------------------------ List events ------------------------------ */
router.get(
  "/",
  auth(true),
  [
    query("from").optional().isISO8601().toDate(),
    query("to").optional().isISO8601().toDate(),
  ],
  validate,
  async (req, res) => {
    try {
      const me = req.user._id || req.user.id;
      const { from, to } = req.query;

      const range = {};
      if (from) range.$gte = parseISO(from);
      if (to) range.$lte = parseISO(to);

      const timeFilter =
        range.$gte || range.$lte ? { startsAt: range } : {};

      const items = await CalendarEvent.find({
        $and: [
          timeFilter,
          {
            $or: [
              { owner: me },
              { "attendees.user": me },
            ],
          },
        ],
      })
        .populate("owner", "name email role")
        .populate("attendees.user", "name email role")
        .sort({ startsAt: 1 })
        .lean();

      return res.json({ items });
    } catch (err) {
      console.error("[calendar] GET error:", err);
      return res.status(500).json({ error: "Failed to list calendar events" });
    }
  }
);

/* ------------------------------ Create event ----------------------------- */
router.post(
  "/",
  auth(true),
  requireRole("tutor", "admin"),
  [
    body("title").isString().trim().isLength({ min: 3 }),
    body("startsAt").isISO8601(),
    body("endsAt").isISO8601(),
    body("location").optional().isString(),
    body("notes").optional().isString(),
    body("attendees").optional().isArray(),
    body("attendees.*").optional().isString().isLength({ min: 1 }), 
  ],
  validate,
  async (req, res) => {
    try {
      const me = req.user._id || req.user.id;
      const {
        title,
        startsAt,
        endsAt,
        location = "",
        notes = "",
        attendees = [],
      } = req.body;

      const event = await CalendarEvent.create({
        owner: me,
        title,
        startsAt: parseISO(startsAt),
        endsAt: parseISO(endsAt),
        location,
        notes,
        attendees: attendees.map((id) => ({
          user: id,
          status: "invited",
          notifiedAt: new Date(),
        })),
      });

      // Notify attendees
      const recipients = attendees
        .map((id) => id)
        .filter((id) => String(id) !== String(me));

      await notifyUsers(recipients, (userId) => ({
        userId,
        type: "CAL_EVENT_CREATED",
        title: `New event: ${title}`,
        message: `Starts ${new Date(startsAt).toLocaleString()} @ ${location || "TBA"}`,
        meta: {
          eventId: event._id,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          location,
          owner: me,
        },
      }));

      const populated = await CalendarEvent.findById(event._id)
        .populate("owner", "name email role")
        .populate("attendees.user", "name email role")
        .lean();

      return res.status(201).json({ event: populated });
    } catch (err) {
      console.error("[calendar] POST error:", err);
      return res.status(500).json({ error: "Failed to create calendar event" });
    }
  }
);

/* ------------------------------ Update event ----------------------------- */
router.patch(
  "/:id",
  auth(true),
  [
    param("id").isMongoId(),
    body("title").optional().isString().trim().isLength({ min: 3 }),
    body("startsAt").optional().isISO8601(),
    body("endsAt").optional().isISO8601(),
    body("location").optional().isString(),
    body("notes").optional().isString(),
    body("attendees").optional().isArray(),
    body("attendees.*").optional().isString().isLength({ min: 1 }),
  ],
  validate,
  async (req, res) => {
    try {
      const me = req.user._id || req.user.id;
      const isAdmin = req.user.role === "admin";
      const { id } = req.params;

      const existing = await CalendarEvent.findById(id);
      if (!existing) return res.status(404).json({ error: "Event not found" });
      if (!isAdmin && String(existing.owner) !== String(me)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const beforeAttendees = new Set(
        (existing.attendees || []).map((a) => String(a.user))
      );

      const patch = {};
      const map = (k, conv = (x) => x) => {
        if (k in req.body && req.body[k] !== undefined) patch[k] = conv(req.body[k]);
      };
      map("title");
      map("startsAt", parseISO);
      map("endsAt", parseISO);
      map("location");
      map("notes");
      map("attendees", (arr) =>
        arr.map((id) => ({ user: id, status: "invited", notifiedAt: new Date() }))
      );

      Object.assign(existing, patch);
      await existing.save();

      // Diff attendees for notifications
      if (patch.attendees) {
        const afterAttendees = new Set(patch.attendees.map((a) => String(a.user)));
        const added = [...afterAttendees].filter((id) => !beforeAttendees.has(id));
        const removed = [...beforeAttendees].filter((id) => !afterAttendees.has(id));

        await notifyUsers(added, (userId) => ({
          userId,
          type: "CAL_EVENT_UPDATED",
          title: `You've been added to: ${existing.title}`,
          message: `Starts ${existing.startsAt.toLocaleString()} @ ${existing.location || "TBA"}`,
          meta: { eventId: existing._id, action: "added" },
        }));

        await notifyUsers(removed, (userId) => ({
          userId,
          type: "CAL_EVENT_UPDATED",
          title: `You were removed from: ${existing.title}`,
          message: `This event no longer includes you.`,
          meta: { eventId: existing._id, action: "removed" },
        }));
      }

      const populated = await CalendarEvent.findById(existing._id)
        .populate("owner", "name email role")
        .populate("attendees.user", "name email role")
        .lean();

      return res.json({ event: populated });
    } catch (err) {
      console.error("[calendar] PATCH error:", err);
      return res.status(500).json({ error: "Failed to update calendar event" });
    }
  }
);

/* ------------------------------ Delete event ----------------------------- */
router.delete(
  "/:id",
  auth(true),
  [param("id").isMongoId()],
  validate,
  async (req, res) => {
    try {
      const me = req.user._id || req.user.id;
      const isAdmin = req.user.role === "admin";
      const { id } = req.params;

      const existing = await CalendarEvent.findById(id);
      if (!existing) return res.status(404).json({ error: "Event not found" });
      if (!isAdmin && String(existing.owner) !== String(me)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const recipientIds = (existing.attendees || [])
        .map((a) => String(a.user))
        .filter((uid) => uid !== String(me));

      await existing.deleteOne();

      await notifyUsers(recipientIds, (userId) => ({
        userId,
        type: "CAL_EVENT_CANCELLED",
        title: `Event cancelled: ${existing.title}`,
        message: `Scheduled for ${existing.startsAt.toLocaleString()} has been cancelled.`,
        meta: { eventId: id },
      }));

      return res.json({ ok: true });
    } catch (err) {
      console.error("[calendar] DELETE error:", err);
      return res.status(500).json({ error: "Failed to delete calendar event" });
    }
  }
);

export default router;
