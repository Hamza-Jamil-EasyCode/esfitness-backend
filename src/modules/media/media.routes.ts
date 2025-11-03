import { Router, Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import asyncHandler from '../../utils/async-handler';
import { singleUpload, multipleUpload, deleteFile } from './media.controller';
import { deleteFileSchema } from './media.validation';
import validateRequest from '../../middlewares/validate-request';
import CustomError from '../../utils/custom-error';

const router = Router();

// point at your two directories
const PUBLIC_DIR = path.resolve(__dirname, '../../../uploads/public');
const PRIVATE_DIR = path.resolve(__dirname, '../../../uploads/private');

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE ?? '5000000', 10); // default 5 MB
const ALLOWED_MIMETYPES = (process.env.ALLOWED_FILE_TYPES ?? 'image/jpeg,image/png').split(',').map((type) => type.trim());

const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        // Read isPrivate from query params (e.g., /upload?isPrivate=true)
        const isPrivate = req.query.isPrivate === 'true';
        cb(null, isPrivate ? PRIVATE_DIR : PUBLIC_DIR);
    },
    filename: (_req, file, cb) => {
        const timestamp = Date.now();
        const sanitized = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        cb(null, `${timestamp}-${sanitized}`);
    }
});

// configure upload with types & limits from .env
const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
            return cb(new CustomError(`Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_MIMETYPES.join(', ')}`, 400));
        }
        cb(null, true);
    }
});

// single
router.post('/upload', upload.single('file'), asyncHandler(singleUpload));

// multiple (all will go to the same folder, based on isPrivate flag)
router.post('/upload/multiple', upload.array('files', 10), asyncHandler(multipleUpload));

router.delete('/delete/:filename', validateRequest(deleteFileSchema), asyncHandler(deleteFile));

export default router;
