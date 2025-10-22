import Student from "../models/Student.js";

// GET /students/me
export const getMyStudent = async (req, res) => {
  try {
    const userId = req.user.id;      // assuming you have auth middleware setting req.user
    const student = await Student.findOne({ user: userId });
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    return res.json({ student });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PATCH /students/me
export const updateMyStudent = async (req, res) => {
  try {
    const userId = req.user.id;
    const patch = req.body;
    const student = await Student.findOneAndUpdate(
      { user: userId },
      { $set: patch },
      { new: true }
    );
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    return res.json({ student });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
