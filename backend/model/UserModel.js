import mongoose from 'mongoose';

const allowedStudent = /^[a-z0-9._%+-]+@student\.belgiumcampus\.ac\.za$/i;
const allowedStaff   = /@(?:[a-z0-9-]+\.)?(belgiumcampus\.ac\.za|campuslearn\.ac\.za)$/i;

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {

          if (this.role === 'student') return allowedStudent.test(v);
          if (this.role === 'tutor' || this.role === 'admin') return allowedStaff.test(v);

          return allowedStudent.test(v);
        },
        message: 'Email domain is not permitted for the selected role.',
      },
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required.'],
    },
    role: {
      type: String,
      enum: ['admin', 'tutor', 'student'],
      required: true,
    },
  },
  {
    discriminatorKey: 'role',
    collection: 'users',
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export default UserModel;
