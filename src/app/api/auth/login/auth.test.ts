import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { POST as loginHandler } from './route';

const testDbPath = path.join(process.cwd(), 'src/data/partners.test.json');

describe('Unified Authentication API TDD Test Suite', () => {
  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('Admin Login', () => {
    it('should login admin successfully with email and password', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'admin@laundrive.com',
          password: 'Laundrive#Admin2026%Secure',
          type: 0
        }),
      });

      const response = await loginHandler(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.role).toBe('admin');
      expect(json.type).toBe(0);
    });

    it('should fail admin login with wrong password', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'admin@laundrive.com',
          password: 'wrongpassword',
          type: 0
        }),
      });

      const response = await loginHandler(req);
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid credentials');
    });
  });

  describe('Partner Login', () => {
    it('should login partner successfully with partnerCode (username) and password', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'QC-001',
          password: 'password123',
          type: 1
        }),
      });

      const response = await loginHandler(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.role).toBe('partner');
      expect(json.type).toBe(1);
      expect(json.partnerCode).toBe('QC-001');
    });

    it('should fail partner login with wrong password', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'QC-001',
          password: 'wrongpassword',
          type: 1
        }),
      });

      const response = await loginHandler(req);
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid credentials');
    });
  });
});
