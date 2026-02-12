import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB total
const UPLOAD_DIR = path.join(process.cwd(), 'src', 'uploads');

/**
 * Ensure upload directory exists
 */
export function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Validate file type by MIME type
 */
export function validateMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase());
}

/**
 * Validate file extension
 */
export function validateExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Validate file size
 */
export function validateFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

/**
 * Validate total size of multiple files
 */
export function validateTotalSize(sizes: number[]): boolean {
  const total = sizes.reduce((sum, size) => sum + size, 0);
  return total <= MAX_TOTAL_SIZE;
}

/**
 * Generate safe filename with UUID
 */
export function generateSafeFilename(originalFilename: string): string {
  const ext = path.extname(originalFilename).toLowerCase();
  const uuid = uuidv4();
  return `${uuid}${ext}`;
}

/**
 * Save file to disk
 */
export function saveFile(buffer: Buffer, filename: string): string {
  ensureUploadDir();
  const filepath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  return filename;
}

/**
 * Get file path
 */
export function getFilePath(filename: string): string {
  return path.join(UPLOAD_DIR, filename);
}

/**
 * Check if file exists
 */
export function fileExists(filename: string): boolean {
  const filepath = getFilePath(filename);
  return fs.existsSync(filepath);
}

/**
 * Read file
 */
export function readFile(filename: string): Buffer {
  const filepath = getFilePath(filename);
  return fs.readFileSync(filepath);
}

/**
 * Delete file
 */
export function deleteFile(filename: string): void {
  const filepath = getFilePath(filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}

/**
 * Validate and process uploaded file
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  filename?: string;
}

export function validateAndProcessFile(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): FileValidationResult {
  // Validate MIME type
  if (!validateMimeType(mimeType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
    };
  }

  // Validate extension
  if (!validateExtension(originalFilename)) {
    return {
      valid: false,
      error: `Invalid file extension. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`
    };
  }

  // Validate file size
  if (!validateFileSize(buffer.length)) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  // Generate safe filename and save
  const safeFilename = generateSafeFilename(originalFilename);
  saveFile(buffer, safeFilename);

  return {
    valid: true,
    filename: safeFilename
  };
}

/**
 * Validate multiple files
 */
export function validateMultipleFiles(
  files: Array<{ buffer: Buffer; originalFilename: string; mimeType: string }>
): FileValidationResult[] {
  // Check total size first
  const sizes = files.map(f => f.buffer.length);
  if (!validateTotalSize(sizes)) {
    return files.map(() => ({
      valid: false,
      error: `Total file size exceeds maximum allowed size of ${MAX_TOTAL_SIZE / 1024 / 1024}MB`
    }));
  }

  // Validate each file
  return files.map(file =>
    validateAndProcessFile(file.buffer, file.originalFilename, file.mimeType)
  );
}


/**
 * Send file as response
 */
export function sendFile(req: any, res: any): void {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid filename',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }

    // Check if file exists
    if (!fileExists(filename)) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'File not found',
        statusCode: 404,
        timestamp: new Date().toISOString()
      });
    }

    // Read and send file
    const buffer = readFile(filename);
    const ext = path.extname(filename).toLowerCase();
    
    // Set appropriate content type
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    res.send(buffer);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to serve file',
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
}
