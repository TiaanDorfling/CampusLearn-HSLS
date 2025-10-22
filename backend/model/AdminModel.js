import mongoose from 'mongoose';

const AdminProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    moderationLog: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, collection: 'adminprofiles' }
);

export default mongoose.model('AdminProfile', AdminProfileSchema);
