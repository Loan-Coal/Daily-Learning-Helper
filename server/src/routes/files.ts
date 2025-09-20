import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

// Type-safe import for pdf-parse
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{
  text: string;
  numpages: number;
  info: any;
  metadata: any;
  version: string;
}>;

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

import { createResponse } from '../utils/createResponse';

// POST /api/files - Upload PDF files
router.post('/files', upload.array('files'), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const tags = req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [];
    
    if (!files || files.length === 0) {
      return res.status(400).json(createResponse(false, null, {
        code: 'NO_FILES',
        message: 'No files uploaded'
      }));
    }

    const savedFiles = [];

    for (const file of files) {
      try {
        // Extract text from PDF
        const pdfBuffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(pdfBuffer);
        
        // Save file metadata to database
        const savedFile = await prisma.file.create({
          data: {
            originalName: file.originalname,
            storedPath: file.path,
            size: file.size,
            mimeType: file.mimetype,
            tags: JSON.stringify(tags),
          }
        });

        savedFiles.push({
          id: savedFile.id,
          originalName: savedFile.originalName,
          size: savedFile.size,
          tags: JSON.parse(savedFile.tags),
          uploadedAt: savedFile.uploadedAt,
          textLength: pdfData.text.length
        });
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        // Clean up the file if processing failed
        fs.unlinkSync(file.path);
      }
    }

    if (savedFiles.length === 0) {
      return res.status(400).json(createResponse(false, null, {
        code: 'PROCESSING_FAILED',
        message: 'No files could be processed successfully'
      }));
    }

    return res.json(createResponse(true, savedFiles));
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json(createResponse(false, null, {
      code: 'UPLOAD_ERROR',
      message: error instanceof Error ? error.message : 'Failed to upload files'
    }));
  }
});

// GET /api/files - List files with sorting and filtering
router.get('/files', async (req, res) => {
  try {
    const { sortBy = 'uploadedAt', order = 'desc', tag } = req.query;
    
    // Build where clause for tag filtering
    const whereClause: any = {};
    if (tag) {
      // Since we store tags as JSON string, we need to use a contains search
      whereClause.tags = {
        contains: `"${tag}"`
      };
    }

    // Build orderBy clause
    const orderByClause: any = {};
    const validSortFields = ['originalName', 'uploadedAt', 'size'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : 'uploadedAt';
    orderByClause[sortField] = order === 'asc' ? 'asc' : 'desc';

    const files = await prisma.file.findMany({
      where: whereClause,
      orderBy: orderByClause,
      select: {
        id: true,
        originalName: true,
        size: true,
        mimeType: true,
        tags: true,
        uploadedAt: true
      }
    });

    // Parse tags from JSON strings
    const formattedFiles = files.map((file: any) => ({
      ...file,
      tags: JSON.parse(file.tags)
    }));

    return res.json(createResponse(true, formattedFiles));
  } catch (error) {
    console.error('List files error:', error);
    return res.status(500).json(createResponse(false, null, {
      code: 'LIST_ERROR',
      message: 'Failed to retrieve files'
    }));
  }
});

export default router;