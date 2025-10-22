import mongoose from 'mongoose';

const allowedStudent = /^[a-z0-9._%+-]+@student\.belgiumcampus\.ac\.za$/i;
// Allow staff on primary domains or subdomains (e.g. tutor., admin.)
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
          // Role-aware email policy:
          // - students MUST use @student.belgiumcampus.ac.za
          // - tutors/admins may use @belgiumcampus.ac.za or @campuslearn.ac.za (incl. subdomains)
          if (this.role === 'student') return allowedStudent.test(v);
          if (this.role === 'tutor' || this.role === 'admin') return allowedStaff.test(v);
          // If role is missing (shouldn’t be), fall back to strict student policy
          return allowedStudent.test(v);
        },
        message: 'Email domain is not permitted for the selected role.',
      },
      index: true, // unique + index; avoid re-declaring the same index elsewhere
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
    discriminatorKey: 'role', // keep for Admin discriminator (non-breaking)
    collection: 'users',
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export default UserModel;
