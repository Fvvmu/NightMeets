import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Rejestracja użytkownika
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    console.log('Próba rejestracji użytkownika:', username, email);

// Haszowanie hasła
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

// Tworzenie nowego użytkownika
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    console.log('Rejestracja zakończona pomyślnie');
    res.status(201).json({ message: 'Rejestracja zakończona pomyślnie' });
  } catch (err) {
    console.error('Błąd podczas rejestracji:', err);
    res.status(500).json({ message: 'Wystąpił błąd serwera' });
  }
};

// Logowanie użytkownika
export const loginUser = async (req, res) => {
  try {
    const { loginIdentifier, password } = req.body;

    console.log('Próba logowania dla:', loginIdentifier);

// Czy użytkownik istnieje (sprawdzenie zarówno po e-mailu, jak i nazwie użytkownika)
    const user = await User.findOne({
      $or: [{ email: loginIdentifier }, { username: loginIdentifier }],
    });
    if (!user) {
      console.log('Nie znaleziono użytkownika');
      return res.status(404).json({ message: 'Nie znaleziono użytkownika' });
    }

// Sprawdź poprawność hasła
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      console.log('Niepoprawne hasło');
      return res.status(400).json({ message: 'Niepoprawne hasło' });
    }

// Tworzenie tokenu JWT
    if (!process.env.JWT_SECRET) {
      console.error('Brak JWT_SECRET w konfiguracji');
      return res.status(500).json({ message: 'Wystąpił błąd konfiguracji serwera' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Logowanie zakończone pomyślnie');
    res.status(200).json({ token, userId: user._id, username: user.username, role: user.role });
  } catch (err) {
    console.error('Błąd podczas logowania:', err);
    res.status(500).json({ message: 'Wystąpił błąd serwera' });
  }
};