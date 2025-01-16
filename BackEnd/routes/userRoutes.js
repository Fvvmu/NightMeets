import express from 'express';
import { updateUser, getUserData } from '../controllers/userController.js';
import { verifyToken, verifyAdmin, verifyModerator } from '../middlewares/auth.js';
import multer from 'multer';
import User from '../models/User.js';

const router = express.Router();

// Konfiguracja multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Trasa do aktualizacji danych użytkownika z możliwością dodania zdjęcia profilowego
router.put('/update', verifyToken, upload.single('profilePicture'), updateUser);

// Trasa do pobierania danych użytkownika
router.get('/profile', verifyToken, getUserData);

// trasa dostępna dla moderatorów do dodawania zdjęć
router.post('/addPhoto', verifyToken, verifyModerator, (req, res) => {
  res.status(200).json({ message: 'Dodawanie zdjęcia (tylko dla moderatora)' });
});

// Trasa dostępna tylko dla administratorów do usunięcia użytkownika
router.delete('/deleteUser/:id', verifyToken, verifyAdmin, (req, res) => {
  res.status(200).json({ message: `Użytkownik o id ${req.params.id} usunięty (tylko dla admina)` });
});

// Trasa do pobierania roli użytkownika
router.get('/role', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony.' });
    }
    res.status(200).json({ role: user.role });
  } catch (error) {
    console.error('Błąd podczas pobierania roli użytkownika:', error);
  }
});

export default router;