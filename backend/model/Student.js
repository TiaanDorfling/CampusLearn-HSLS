import mongoose from "mongoose";

const { Schema, model } = mongoose;

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

export default model("Student", StudentSchema);
