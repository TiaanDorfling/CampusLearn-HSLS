import mongoose from 'mongoose';

const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, default: 'info' },          
    title: { type: String, default: '' },
    message: { type: String, required: true },
    data: { type: Object, default: {} },
    read: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'notifications' }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

const Notification =
  mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

export default Notification;
