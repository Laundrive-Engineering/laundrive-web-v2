import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { POST as postHandler, GET as getHandler } from './route';
import { GET as streamHandler } from './stream/route';
import { saveBookings } from '../../../../utils/bookingsDb';


const testDbPath = path.join(process.cwd(), 'src/data/bookings.test.json');

describe('Booking Mobile API TDD Test Suite', () => {
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

  describe('Create Booking Mobile API (POST)', () => {
    it('should create a booking successfully with valid inputs', async () => {
      const req = new Request('http://localhost/api/mobile/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'CUST-001',
          partnerCode: 'QC-001',
          branchName: 'IT Park Branch',
          service: 'Wash & Fold',
          total: 350.00
        }),
      });

      const response = await postHandler(req);
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBeDefined();
      expect(json.data.id).toMatch(/^[0-9a-f]{16}$/);
      expect(json.data.customerId).toBe('CUST-001');
      expect(json.data.partnerCode).toBe('QC-001');
      expect(json.data.branchName).toBe('IT Park Branch');
      expect(json.data.service).toBe('Wash & Fold');
      expect(json.data.total).toBe(350.00);
      expect(json.data.status).toBe('Pending');
      expect(json.data.bookingDate).toBeDefined();
    });

    it('should return 400 validation error for missing fields', async () => {
      const req = new Request('http://localhost/api/mobile/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'CUST-001',
          service: 'Wash & Fold'
          // missing partnerCode and total
        }),
      });

      const response = await postHandler(req);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Missing required fields');
    });

    it('should return 400 for invalid request body', async () => {
      const req = new Request('http://localhost/api/mobile/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json',
      });

      const response = await postHandler(req);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid request body');
    });
  });

  describe('Get Bookings Mobile API (GET)', () => {
    it('should retrieve customer bookings filtered by customerId', async () => {
      // First, create a mock booking using postHandler
      const createReq = new Request('http://localhost/api/mobile/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'CUST-003',
          partnerCode: 'QC-001',
          service: 'Wash & Fold',
          total: 350.00
        }),
      });
      await postHandler(createReq);

      const getReq = new Request('http://localhost/api/mobile/bookings?customerId=CUST-003', {
        method: 'GET',
      });

      const response = await getHandler(getReq);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.length).toBe(1);
      expect(json.data[0].customerId).toBe('CUST-003');
    });

    it('should return empty array if no bookings exist for the customer', async () => {
      const getReq = new Request('http://localhost/api/mobile/bookings?customerId=CUST-999', {
        method: 'GET',
      });

      const response = await getHandler(getReq);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toEqual([]);
    });

    it('should return 400 if customerId parameter is missing', async () => {
      const getReq = new Request('http://localhost/api/mobile/bookings', {
        method: 'GET',
      });

      const response = await getHandler(getReq);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Customer ID is required');
    });
  });

  describe('Get Bookings Stream Mobile API (GET /api/mobile/bookings/stream)', () => {
    it('should return 400 if customerId parameter is missing for stream', async () => {
      const getReq = new Request('http://localhost/api/mobile/bookings/stream');
      const response = await streamHandler(getReq);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Customer ID is required');
    });

    it('should stream customer bookings and push updates on database change', async () => {
      saveBookings([
        { id: 'B-01', customerId: 'CUST-003', partnerCode: 'QC-001', service: 'Wash', status: 'Pending', total: 100, bookingDate: '2026-06-20' },
      ]);

      const req = new Request('http://localhost/api/mobile/bookings/stream?customerId=CUST-003');
      const response = await streamHandler(req);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');

      const reader = response.body!.getReader();
      
      // 1st chunk is the initial data
      const firstResult = await reader.read();
      const firstText = new TextDecoder().decode(firstResult.value);
      expect(firstText).toContain('data:');
      expect(firstText).toContain('B-01');

      // Trigger a change in bookings
      setTimeout(() => {
        saveBookings([
          { id: 'B-01', customerId: 'CUST-003', partnerCode: 'QC-001', service: 'Wash', status: 'Picked Up', total: 100, bookingDate: '2026-06-20' },
        ]);
      }, 50);

      // 2nd chunk should be the updated data
      const secondResult = await reader.read();
      const secondText = new TextDecoder().decode(secondResult.value);
      expect(secondText).toContain('data:');
      expect(secondText).toContain('Picked Up');

      await reader.cancel();
    });
  });
});
