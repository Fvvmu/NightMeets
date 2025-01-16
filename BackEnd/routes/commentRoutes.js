import express from 'express';
import Comment from '../models/Comment.js';

const router = express.Router();

// Zapisz komentarz
router.post('/', async (req, res) => {
  try {
    const comment = new Comment(req.body);
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się zapisać komentarza.' });
  }
});

// Pobierz komentarze dla zdjęcia
router.get('/:imageId', async (req, res) => {
  try {
    const comments = await Comment.find({ imageId: req.params.imageId });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się pobrać komentarzy.' });
  }
});

export default router;
