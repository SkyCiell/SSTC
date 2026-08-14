import express from 'express';
import { handleExportZip } from '../controllers/exportController.js';

const router = express.Router();

router.post('/', handleExportZip);

export default router;
