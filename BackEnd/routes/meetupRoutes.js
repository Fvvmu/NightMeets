import express from 'express';
import { verifyToken, verifyVerifiedUser } from '../middlewares/auth.js';
import Meetup from '../models/Meetup.js';
import ForumPost from '../models/ForumPost.js';

const router = express.Router();

// Trasa do dodania nowego wydarzenia
router.post('/add', verifyToken, verifyVerifiedUser, async (req, res) => {
  try {
    const { eventName, location, date, time, coordinates } = req.body;
    const createdBy = req.user.id;

// Utworzenie nowego wydarzenia
    const newMeetup = new Meetup({
      eventName,
      location,
      date,
      time,
      coordinates,
      createdBy,
    });

    const savedMeetup = await newMeetup.save();

// Automatyczne utworzenie posta na forum po dodaniu wydarzenia
    const forumPost = new ForumPost({
      meetupId: savedMeetup._id,
      content: `Spotkanie ${eventName} zostało utworzone. Dołącz do wydarzenia i weź udział!`,
      createdBy,
    });

    await forumPost.save();

    res.status(201).json({ message: 'Wydarzenie zostało utworzone.', meetup: savedMeetup });
  } catch (error) {
    console.error('Błąd podczas dodawania wydarzenia:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas dodawania wydarzenia.' });
  }
});

export default router;