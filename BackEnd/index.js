import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import authRoutes from './routes/authRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import userRoutes from './routes/userRoutes.js';
import meetupRoutes from './routes/meetupRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import pinRoutes from './routes/pinRoutes.js';
import multer from 'multer';
import path from 'path';
import cron from 'node-cron';
import ForumPost from './models/ForumPost.js';
import Meetup from './models/Meetup.js';
import Comment from './models/Comment.js';
import Like from './models/Like.js';
import jwt from 'jsonwebtoken';
import { GridFSBucket } from 'mongodb';
import { fileURLToPath } from "url";

dotenv.config();

// Konfiguracja dirname dla ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
let gfsBucket;
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected');
    const conn = mongoose.connection;
    gfsBucket = new GridFSBucket(conn.db, {
      bucketName: 'uploads',
    });
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

// Pamięc masowa multer'a
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Obsługa obrazów MongoDB GridFS
app.get('/uploads/:filename', async (req, res) => {
  try {
    const file = await gfsBucket.find({ filename: req.params.filename }).toArray();
    if (!file || file.length === 0) {
      return res.status(404).json({ message: 'Nie znaleziono pliku.' });
    }

    const downloadStream = gfsBucket.openDownloadStreamByName(req.params.filename);
    downloadStream.pipe(res).on('error', (err) => {
      res.status(500).json({ message: 'Błąd podczas przesyłania pliku.' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas wyszukiwania pliku.' });
  }
});

// Routes
app.use('/api/pins', pinRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api', emailRoutes);
app.use('/api/user', userRoutes);
app.use('/api/meetup', meetupRoutes);
app.use('/api/gallery', galleryRoutes);

// Punkt końcowy do przesyłania zdjęcia profilowego za pomocą GridFS
app.post('/api/upload', upload.single('file'), (req, res) => {
  const uploadStream = gfsBucket.openUploadStream(req.file.originalname, {
    contentType: req.file.mimetype,
  });

  uploadStream.end(req.file.buffer);

  uploadStream.on('finish', (storedFile) => {
    res.status(201).json({ file: storedFile });
  });

  uploadStream.on('error', (err) => {
    console.error('Błąd podczas zapisu pliku:', err);
    res.status(500).json({ message: 'Wystąpił błąd podczas przesyłania pliku.' });
  });
});

// Harmonogram automatycznego usuwania postów po 24 godzinach od zakończenia wydarzenia
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const expiredMeetups = await Meetup.find({ date: { $lt: now } });

    for (let meetup of expiredMeetups) {
      await ForumPost.findOneAndDelete({ meetupId: meetup._id });
    }

    console.log(`Posty z zakończonych wydarzeń zostały usunięte`);
  } catch (error) {
    console.error('Błąd podczas usuwania postów:', error);
  }
});

// Kontakt - formularz
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: email,
    to: process.env.RECEIVER_EMAIL,
    subject: `Wiadomość od ${name}`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Wiadomość została wysłana!' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd przy wysyłaniu wiadomości.' });
  }
});

// Funkcja zapisywania komentarzy
app.post('/api/comments', async (req, res) => {
  const { postId, userId, content } = req.body;

  try {
    const comment = new Comment({ postId, userId, content });
    await comment.save();
    res.status(201).json({ message: 'Komentarz zapisany', comment });
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas zapisywania komentarza', error });
  }
});

// Funkcja zapisywania polubień
app.post('/api/likes', async (req, res) => {
  const { postId, userId } = req.body;

  try {
    const existingLike = await Like.findOne({ postId, userId });
    if (existingLike) {
      await existingLike.delete();
      res.status(200).json({ message: 'Polubienie usunięte' });
    } else {
      const like = new Like({ postId, userId });
      await like.save();
      res.status(201).json({ message: 'Post polubiony', like });
    }
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas zapisywania polubienia', error });
  }
});

// Socket.IO for Chat
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Brak tokenu'));
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    next();
  } catch (error) {
    return next(new Error('Nieprawidłowy token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

// Ustawienie folderu public jako katalog z plikami statycznymi
app.use(express.static(path.join(__dirname, 'public')));

// Obsługa strony głównej
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});