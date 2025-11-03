// media.controller.ts
import path from 'path';
import { promises as fs } from 'fs';
import { Request, Response } from 'express';
import { formatResponse } from '../../utils/helpers';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from './media.messages';
import CustomError from '../../utils/custom-error';

const PUBLIC_DIR = path.resolve(__dirname, '../../../uploads/public');
const PRIVATE_DIR = path.resolve(__dirname, '../../../uploads/private');

export const singleUpload = (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File | undefined;
    if (!file) {
        throw new CustomError(ERROR_MESSAGES.NO_FILE_UPLOADED, 400);
    }
    // Use isPrivate from query param
    const isPrivate = req.query.isPrivate === 'true';
    const urlBase = isPrivate ? '/uploads/private' : '/uploads/public';

    res.status(201).json(
        formatResponse(true, SUCCESS_MESSAGES.FILE_UPLOADED, {
            fileUrl: `${urlBase}/${file.filename}`,
            originalName: file.originalname,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype
        })
    );
};

export const multipleUpload = (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
        throw new CustomError(ERROR_MESSAGES.NO_FILES_UPLOADED, 400);
    }

    const isPrivate = req.query.isPrivate === 'true';
    const urlBase = isPrivate ? '/uploads/private' : '/uploads/public';

    const uploaded = files.map((file) => ({
        fileUrl: `${urlBase}/${file.filename}`,
        originalName: file.originalname,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype
    }));

    res.status(201).json(formatResponse(true, SUCCESS_MESSAGES.FILES_UPLOADED, uploaded));
};

export const deleteFile = async (req: Request, res: Response) => {
    const { filename } = req.params;

    const isPrivate = req.query.isPrivate === 'true';
    const baseDir = isPrivate ? PRIVATE_DIR : PUBLIC_DIR;
    const filePath = path.join(baseDir, filename);
    try {
        await fs.unlink(filePath);
        res.status(200).json(formatResponse(true, SUCCESS_MESSAGES.FILE_DELETED));
    } catch {
        throw new CustomError(ERROR_MESSAGES.FILE_DELETE_FAILURE, 404);
    }
};
