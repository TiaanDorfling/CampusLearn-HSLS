// backend/model/NotificationService.js
// Canonical Mongoose model for notifications (guarded for nodemon/hot-reload)

import mongoose from 'mongoose';

const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, default: 'info' },          // info | warning | alert | forum | pm | etc.
    title: { type: String, default: '' },
    message: { type: String, required: true },
    data: { type: Object, default: {} },
    read: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'notifications' }
);

// Helpful index for listing latest first per user
NotificationSchema.index({ userId: 1, createdAt: -1 });

// ✅ Absolute guard against duplicate compilation
const Notification =
  mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

export default Notification;
