import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Konfiguracja GridFS
let gfsBucket;
const conn = mongoose.connection;

conn.once('open', () => {
  gfsBucket = new GridFSBucket(conn.db, {
    bucketName: 'uploads',
  });
  console.log('GridFS Bucket initialized');
});

// Konfiguracja multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware do weryfikacji tokena
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; 
    req.role = decoded.role; 
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Middleware sprawdzający rolę
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({ message: 'Access denied. You do not have the required role.' });
    }
    next();
  };
};

// Wysyłanie zdjęć (tylko dla admin i moderator)
router.post('/upload', verifyToken, checkRole(['admin', 'moderator']), upload.single('file'), (req, res) => {
  const { file } = req;

  if (!file) {
    return res.status(400).json({ message: 'Nie przesłano pliku.' });
  }

  try {
    const uploadStream = gfsBucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
    });

    uploadStream.end(file.buffer);

    uploadStream.on('finish', (storedFile) => {
      res.status(201).json({ filename: storedFile.filename, id: storedFile._id });
    });

    uploadStream.on('error', (err) => {
      res.status(500).json({ message: 'Błąd podczas przesyłania pliku.' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Wystąpił błąd podczas przetwarzania pliku.' });
  }
});

// Pobieranie wszystkich obrazów
router.get('/', async (req, res) => {
  try {
    const files = await gfsBucket.find().toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'Nie znaleziono plików.' });
    }
    res.json(files.map((file) => ({
      id: file._id,
      filename: file.filename,
      uploadDate: file.uploadDate,
    })));
  } catch (error) {
    res.status(500).json({ message: 'Wystąpił błąd podczas pobierania zdjęć.' });
  }
});

// Pobieranie szczegółów zdjęcia
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const file = await gfsBucket.find({ _id: new mongoose.Types.ObjectId(id) }).toArray();
    if (!file || file.length === 0) {
      return res.status(404).json({ message: 'Nie znaleziono pliku.' });
    }

    const likes = await Like.find({ post: id });
    const comments = await Comment.find({ post: id }).populate('user', 'nickname');

    res.status(200).json({
      id: file[0]._id,
      filename: file[0].filename,
      uploadDate: file[0].uploadDate,
    });
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania szczegółów zdjęcia.' });
  }
});

export default router;