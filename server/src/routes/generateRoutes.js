import express from 'express';
import { handleGenerate } from '../controllers/generateController.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', uploadSingleImage, handleGenerate);

export default router;
