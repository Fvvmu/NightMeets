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

// Funkcja weryfikująca, czy użytkownik jest zweryfikowany (verifiedUser, moderator, admin)
export const verifyVerifiedUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user && (user.role === 'verifiedUser' || user.role === 'moderator' || user.role === 'admin')) {
      next();
    } else {
      return res.status(403).json({ message: 'Brak dostępu, musisz być zweryfikowanym użytkownikiem.' });
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

// Funkcja weryfikująca, czy użytkownik jest zwykłym użytkownikiem
export const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user && user.role === 'user') {
      next();
    } else {
      return res.status(403).json({ message: 'Brak dostępu, użytkownik nie jest zwykłym użytkownikiem.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Wystąpił błąd podczas weryfikacji użytkownika.' });
  }
};

// Funkcja weryfikująca, czy użytkownik jest zalogowany i ma dostęp do określonych tras
export const checkRole = (roles) => async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user && roles.includes(user.role)) {
      next();
    } else {
      return res.status(403).json({ message: 'Brak dostępu, niewystarczające uprawnienia.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Wystąpił błąd podczas weryfikacji użytkownika.' });
  }
};