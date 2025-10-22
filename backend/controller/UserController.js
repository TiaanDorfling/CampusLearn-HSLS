import UserModel from '../model/UserModel.js';
import bcrypt from 'bcryptjs';

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, password } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: `User not found` });

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (password) user.passwordHash = await bcrypt.hash(password, 10);

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (password) {
      const bcrypt = await import('bcryptjs');
      user.passwordHash = await bcrypt.hash(password, 10);
    }
    if (role && ['admin', 'tutor', 'student'].includes(role)) {
      user.role = role;
    }

    await user.save();

    res.status(200).json({
      message: 'User updated successfully by admin',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating user' });
  }
};