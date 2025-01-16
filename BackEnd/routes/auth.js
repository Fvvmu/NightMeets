import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Weryfikacja tokenu JWT
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ message: 'Brak tokenu, brak dostępu' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Nieprawidłowy token, brak dostępu' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Nieprawidłowy token, brak dostępu' });
  }
};

// Funkcja weryfikująca, czy użytkownik jest zweryfikowany
export const verifyVerifiedUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user && (user.role === 'verifiedUser' || user.role === 'moderator' || user.role === 'admin')) {
      next();
    } else {
      return res.status(403).json({ message: 'Brak dostępu do tej trasy.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Wystąpił błąd podczas weryfikacji użytkownika.' });
  }
};

// Funkcja weryfikująca, czy użytkownik jest administratorem
export const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user && user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Brak dostępu, użytkownik nie jest administratorem.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Wystąpił błąd podczas weryfikacji użytkownika.' });
  }
};

// Funkcja weryfikująca, czy użytkownik jest moderatorem
export const verifyModerator = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user && (user.role === 'moderator' || user.role === 'admin')) {
      next();
    } else {
      return res.status(403).json({ message: 'Brak dostępu, użytkownik nie jest moderatorem.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Wystąpił błąd podczas weryfikacji użytkownika.' });
  }
};

// Funkcja do odświeżania tokenu
export const refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(403).json({ message: 'Brak tokenu, brak dostępu.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony.' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePictureUrl: user.profilePictureUrl,
    };

    const newToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ token: newToken });
  } catch (error) {
    return res.status(401).json({ message: 'Token nie jest już ważny.' });
  }
};