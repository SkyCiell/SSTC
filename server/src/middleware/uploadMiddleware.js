import multer from 'multer';

// Use memory storage for direct buffer passing to AI models and easy conversion
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (PNG, JPEG, WEBP, GIF) are allowed.'), false);
  }
};

export const uploadSingleImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max limit
  },
}).single('image');
