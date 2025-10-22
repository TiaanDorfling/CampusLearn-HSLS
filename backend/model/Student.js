//backend/model/Student.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const EmergencyContactSchema = new Schema({
  phone: { type: String },
  name: { type: String }
}, { _id: false });

const StudentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  about: { type: String },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  emergencyContact: EmergencyContactSchema,
  phone: { type: String },
  studentNumber: { type: String },
  year: { type: String },
}, {
  timestamps: true
});

const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);

export default Student;
