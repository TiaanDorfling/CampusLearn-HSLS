// backend/model/CalendarEvent.js
import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

/** Attendee subdoc (with RSVP + notify timestamp) */
const attendeeSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["invited", "accepted", "declined"], default: "invited" },
    notifiedAt: { type: Date },
  },
  { _id: false }
);

const calendarEventSchema = new Schema(
  {
    owner: { type: Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, required: true },
    location: { type: String, default: "" },
    notes: { type: String, default: "" },
    attendees: [attendeeSchema],
  },
  { timestamps: true }
);

calendarEventSchema.index({ owner: 1, startsAt: 1 });

calendarEventSchema.pre("validate", function (next) {
  if (this.startsAt && this.endsAt && this.endsAt <= this.startsAt) {
    return next(new Error("endsAt must be after startsAt"));
  }
  next();
});

const CalendarEvent =
  mongoose.models.CalendarEvent || model("CalendarEvent", calendarEventSchema);

export default CalendarEvent;
