import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Aktualizowanie danych użytkownika
export const updateUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'Nieprawidłowy token, brak dostępu' });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      const encodedImage = req.file.buffer.toString('base64');
      updateData.profilePictureUrl = `data:${req.file.mimetype};base64,${encodedImage}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony.' });
    }

    const payload = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePictureUrl: updatedUser.profilePictureUrl,
    };

    const newToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Dane użytkownika zostały zaktualizowane',
      token: newToken,
      user: {
        username: updatedUser.username,
        email: updatedUser.email,
        profilePictureUrl: updatedUser.profilePictureUrl,
      },
    });
  } catch (error) {
    console.error('Błąd podczas aktualizacji danych użytkownika:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas aktualizacji danych użytkownika.' });
  }
};

// Pobieranie danych użytkownika
export const getUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'Nieprawidłowy token, brak dostępu' });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony.' });
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
      profilePictureUrl: user.profilePictureUrl,
      likedPhotos: user.likedPhotos || [],
    });
  } catch (error) {
    console.error('Błąd podczas pobierania danych użytkownika:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas pobierania danych użytkownika.' });
  }
};

export default {
  updateUser,
  getUserData,
};