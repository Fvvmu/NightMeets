import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');  // Upewnij się, że token jest w formacie Bearer

  if (!token) {
    return res.status(401).json({ message: 'Dostęp zabroniony. Nie znaleziono tokena.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(401).json({ message: 'Nieprawidłowy token. Proszę się zalogować ponownie.' });
  }
};