import express from 'express';
import Pin from '../models/Pin.js';
import ForumPost from '../models/ForumPost.js'; // Import modelu ForumPost
import { verifyToken, verifyAdmin, verifyVerifiedUser } from '../middlewares/auth.js';

const router = express.Router();

// Dodawanie pinezki (tylko zweryfikowani użytkownicy)
router.post('/', verifyToken, verifyVerifiedUser, async (req, res) => {
  const { lat, lng, title, place, organizer, date, time } = req.body;

  if (!lat || !lng || !title || !place || !organizer || !date || !time) {
    return res.status(400).json({ message: 'Wszystkie pola są wymagane!' });
  }

  try {
// Tworzenie pinezki
    const newPin = new Pin({
      user: req.user.id,
      lat,
      lng,
      title,
      place,
      organizer,
      date,
      time,
    });

    await newPin.save();

// Tworzenie automatycznego postu na forum
    const newPost = new ForumPost({
      title: `Nowe spotkanie: ${title}`,
      content: `Dodano nowe spotkanie na mapie!\n\n**Miejsce:** ${place}\n**Organizator:** ${organizer}\n**Data:** ${date}\n**Godzina:** ${time}\n\nZapraszamy wszystkich zainteresowanych!`,
      user: req.user.id,
      pin: newPin._id, // Powiązanie postu z pinezką
    });

    await newPost.save();

    res.status(201).json({ pin: newPin, post: newPost });
  } catch (error) {
    console.error('Błąd podczas zapisywania pinezki:', error);
    res.status(500).json({ message: 'Błąd podczas zapisywania pinezki.' });
  }
});

// Pobieranie wszystkich pinezek (ogólnodostępne)
router.get('/', async (req, res) => {
  try {
    const pins = await Pin.find();
    res.status(200).json(pins);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania pinezek.' });
  }
});

// Usuwanie pinezki (tylko administratorzy)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pinId = req.params.id;

    // Usunięcie pinezki
    const deletedPin = await Pin.findByIdAndDelete(pinId);

    if (!deletedPin) {
      return res.status(404).json({ message: 'Pinezka nie została znaleziona.' });
    }

    // Usunięcie powiązanego postu na forum
    await ForumPost.findOneAndDelete({ pin: pinId });

    res.status(200).json({ message: 'Pinezka i powiązany post zostały usunięte.' });
  } catch (error) {
    console.error('Błąd podczas usuwania pinezki:', error);
    res.status(500).json({ message: 'Błąd podczas usuwania pinezki.' });
  }
});

export default router;
