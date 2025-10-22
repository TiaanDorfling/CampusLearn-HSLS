// Plain admin profile linked 1:1 to a User (no discriminators needed)
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
