import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as db from '../../../utils/partnersDb';
import { POST as uploadHandler } from './upload/route';

const testDbPath = path.join(process.cwd(), 'src/data/partners.test.json');
const uploadsDir = path.join(process.cwd(), 'public/uploads');

describe('Partner Uploads TDD Test Suite', () => {
  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    // Clean up uploaded test files in uploadsDir
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        if (file.includes('test-') || file.includes('QC-001-')) {
          fs.unlinkSync(path.join(uploadsDir, file));
        }
      }
    }
  });

  describe('Database updates for logo and banner', () => {
    it('should support updating and retrieving logo and banner fields', () => {
      const partners = db.getPartners();
      const qc = partners.find(p => p.partnerCode === 'QC-001')!;

      const success = db.updatePartner(qc.id, {
        logo: '/uploads/test-logo.png',
        banner: '/uploads/test-banner.png'
      });

      expect(success).toBe(true);

      const refreshed = db.getPartners().find(p => p.partnerCode === 'QC-001')!;
      expect(refreshed.logo).toBe('/uploads/test-logo.png');
      expect(refreshed.banner).toBe('/uploads/test-banner.png');
    });
  });

  describe('POST /api/partners/upload API Route', () => {
    it('should write uploaded file to public/uploads and return public URL', async () => {
      const formData = new FormData();
      const file = new File(['mock-image-bytes'], 'test-logo.png', { type: 'image/png' });
      formData.append('file', file);
      formData.append('type', 'logo');
      formData.append('partnerCode', 'QC-001');

      const req = new Request('http://localhost/api/partners/upload', {
        method: 'POST',
      });
      req.formData = async () => formData;

      const response = await uploadHandler(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.url).toBeDefined();
      expect(json.url).toContain('/uploads/QC-001-logo-');

      // Verify file is physically created on disk
      const filePath = path.join(process.cwd(), 'public', json.url);
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath, 'utf-8')).toBe('mock-image-bytes');
    });

    it('should fail with 400 bad request status when parameters are missing', async () => {
      const formData = new FormData();
      formData.append('type', 'logo');
      // missing file and partnerCode

      const req = new Request('http://localhost/api/partners/upload', {
        method: 'POST',
      });
      req.formData = async () => formData;

      const response = await uploadHandler(req);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('File, type, and partnerCode are required');
    });
  });
});
