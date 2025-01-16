import express from 'express';
import ForumPost from '../models/ForumPost.js';
import Comment from '../models/Comment.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// Pobieranie wszystkich postów
router.get('/posts', async (req, res) => {
  try {
    const posts = await ForumPost.find().populate('user', 'username').sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania postów.' });
  }
});

// Pobieranie pojedynczego posta wraz z komentarzami
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id).populate('user', 'username');
    if (!post) {
      return res.status(404).json({ message: 'Post nie został znaleziony.' });
    }

    const comments = await Comment.find({ post: req.params.id }).populate('user', 'username').sort({ createdAt: -1 });
    res.status(200).json({ post, comments });
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania posta i komentarzy.' });
  }
});

// Dodawanie komentarza do posta
router.post('/posts/:id/comments', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Treść komentarza jest wymagana.' });
  }

  try {
    const post = await ForumPost.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post nie został znaleziony.' });
    }

    const newComment = new Comment({
      post: id,
      user: req.user.id,
      text: content,
    });

    await newComment.save();
    res.status(201).json({ message: 'Komentarz został dodany.', comment: newComment });
  } catch (error) {
    console.error('Błąd podczas dodawania komentarza:', error);
    res.status(500).json({ message: 'Błąd podczas dodawania komentarza.' });
  }
});

// Pobieranie komentarzy dla posta
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id }).populate('user', 'username').sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    console.error('Błąd podczas pobierania komentarzy:', error);
    res.status(500).json({ message: 'Błąd podczas pobierania komentarzy.' });
  }
});


export default router;
