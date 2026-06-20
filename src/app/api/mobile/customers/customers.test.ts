import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as db from '../../../../utils/customersDb';
import { POST as registerHandler } from './register/route';
import { POST as loginHandler } from './login/route';
import { GET as meHandler } from './me/route';

const testDbPath = path.join(process.cwd(), 'src/data/customers.test.json');

describe('Customer Mobile API TDD Test Suite', () => {
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

  describe('Registration Mobile API', () => {
    it('should register a new customer successfully', async () => {
      const req = new Request('http://localhost/api/mobile/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Charlie Brown',
          email: 'charlie@example.com',
          phone: '09122334455',
          address: 'Talamban, Cebu City',
          password: 'securePassword123'
        }),
      });

      const response = await registerHandler(req);
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBe('CUST-003');
      expect(json.data.name).toBe('Charlie Brown');
      expect(json.data.email).toBe('charlie@example.com');
    });

    it('should return 400 for duplicate email', async () => {
      const req = new Request('http://localhost/api/mobile/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Alice Fake',
          email: 'alice@example.com', // Duplicate
          phone: '09111111111',
          address: 'Somewhere',
          password: 'password123'
        }),
      });

      const response = await registerHandler(req);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Email already registered');
    });

    it('should return 400 validation error for missing fields', async () => {
      const req = new Request('http://localhost/api/mobile/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Missing Fields Person',
          email: 'missing@example.com',
        }),
      });

      const response = await registerHandler(req);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Name, email, phone, address, and password are required');
    });
  });

  describe('Authentication (Login) Mobile API', () => {
    it('should login successfully with correct credentials', async () => {
      const req = new Request('http://localhost/api/mobile/customers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'alice@example.com',
          password: 'password123'
        }),
      });

      const response = await loginHandler(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.token).toBeDefined();
      expect(json.data.id).toBe('CUST-001');
    });

    it('should fail authentication with incorrect password', async () => {
      const req = new Request('http://localhost/api/mobile/customers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'alice@example.com',
          password: 'wrongpassword'
        }),
      });

      const response = await loginHandler(req);
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid email or password');
    });
  });

  describe('Details Retrieval Mobile API', () => {
    it('should return customer details by query id', async () => {
      const req = new Request('http://localhost/api/mobile/customers/me?id=CUST-001', {
        method: 'GET',
      });

      const response = await meHandler(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.name).toBe('Alice Green');
    });

    it('should return 404 for non-existent customer id', async () => {
      const req = new Request('http://localhost/api/mobile/customers/me?id=CUST-999', {
        method: 'GET',
      });

      const response = await meHandler(req);
      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Customer not found');
    });
  });
});
