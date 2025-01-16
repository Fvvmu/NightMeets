import multer from 'multer';

// Konfiguracja multer do przechowywania plików w pamięci
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;