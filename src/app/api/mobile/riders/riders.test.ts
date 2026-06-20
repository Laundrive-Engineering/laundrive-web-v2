import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { POST as loginHandler } from './login/route';
import { GET as bookingsGetHandler, PATCH as bookingsPatchHandler } from './bookings/route';
import { GET as bookingsStreamHandler } from './bookings/stream/route';
import { saveBookings } from '../../../../utils/bookingsDb';
import { saveRiders } from '../../../../utils/ridersDb';

const testBookingsDbPath = path.join(process.cwd(), 'src/data/bookings.test.json');
const testRidersDbPath = path.join(process.cwd(), 'src/data/riders.test.json');

describe('Mobile Riders API TDD Test Suite', () => {
  beforeEach(() => {
    if (fs.existsSync(testBookingsDbPath)) fs.unlinkSync(testBookingsDbPath);
    if (fs.existsSync(testRidersDbPath)) fs.unlinkSync(testRidersDbPath);

    saveRiders([
      {
        id: 1,
        riderCode: 'RDR-1024',
        name: 'Mike Johnson',
        licenseNumber: 'D01',
        email: 'mike@example.com',
        phone: '123',
        vehicle: 'Motorcycle',
        status: 'Active',
        password: 'password123'
      }
    ]);
  });

  afterEach(() => {
    if (fs.existsSync(testBookingsDbPath)) fs.unlinkSync(testBookingsDbPath);
    if (fs.existsSync(testRidersDbPath)) fs.unlinkSync(testRidersDbPath);
  });

  describe('Rider Login (POST /api/mobile/riders/login)', () => {
    it('should login successfully with correct credentials', async () => {
      const req = new Request('http://localhost/api/mobile/riders/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderCode: 'RDR-1024', password: 'password123' }),
      });

      const response = await loginHandler(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.rider.name).toBe('Mike Johnson');
    });

    it('should fail login with wrong credentials', async () => {
      const req = new Request('http://localhost/api/mobile/riders/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderCode: 'RDR-1024', password: 'wrong_password' }),
      });

      const response = await loginHandler(req);
      expect(response.status).toBe(401);

      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid rider credentials');
    });
  });

  describe('Rider Bookings Query (GET /api/mobile/riders/bookings)', () => {
    beforeEach(() => {
      saveBookings([
        { id: 'B-01', customerId: 'C-01', partnerCode: 'P-01', service: 'Wash', status: 'Pending', total: 100, bookingDate: '2026-06-20' }, // Available
        { id: 'B-02', customerId: 'C-01', partnerCode: 'P-01', service: 'Dry', status: 'Pending', total: 50, bookingDate: '2026-06-20', riderCode: 'RDR-1024' }, // Assigned to Mike
        { id: 'B-03', customerId: 'C-01', partnerCode: 'P-01', service: 'Wash', status: 'Completed', total: 120, bookingDate: '2026-06-20' }, // Completed (not available)
      ]);
    });

    it('should return available bookings when filtering by status=available', async () => {
      const req = new Request('http://localhost/api/mobile/riders/bookings?status=available');
      const response = await bookingsGetHandler(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.length).toBe(1);
      expect(json.data[0].id).toBe('B-01');
    });

    it('should return assigned bookings when filtering by riderCode', async () => {
      const req = new Request('http://localhost/api/mobile/riders/bookings?riderCode=RDR-1024');
      const response = await bookingsGetHandler(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.length).toBe(1);
      expect(json.data[0].id).toBe('B-02');
    });
  });

  describe('Claim and Update Bookings (PATCH /api/mobile/riders/bookings)', () => {
    beforeEach(() => {
      saveBookings([
        { id: 'B-01', customerId: 'C-01', partnerCode: 'P-01', service: 'Wash', status: 'Pending', total: 100, bookingDate: '2026-06-20' },
      ]);
    });

    it('should claim/assign a booking to a rider', async () => {
      const req = new Request('http://localhost/api/mobile/riders/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'B-01', riderCode: 'RDR-1024', status: 'Picked Up' }),
      });

      const response = await bookingsPatchHandler(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);

      const bookings = JSON.parse(fs.readFileSync(testBookingsDbPath, 'utf-8'));
      expect(bookings[0].riderCode).toBe('RDR-1024');
      expect(bookings[0].status).toBe('Picked Up');
    });
  });

  describe('Rider Bookings Stream (GET /api/mobile/riders/bookings/stream)', () => {
    it('should return 400 when both status and riderCode are missing', async () => {
      const req = new Request('http://localhost/api/mobile/riders/bookings/stream');
      const response = await bookingsStreamHandler(req);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Query parameters status=available or riderCode are required');
    });

    it('should stream available bookings and update on database changes', async () => {
      saveBookings([
        { id: 'B-01', customerId: 'C-01', partnerCode: 'P-01', service: 'Wash', status: 'Pending', total: 100, bookingDate: '2026-06-20' },
      ]);

      const req = new Request('http://localhost/api/mobile/riders/bookings/stream?status=available');
      const response = await bookingsStreamHandler(req);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');

      const reader = response.body!.getReader();

      // Read initial available bookings
      const firstResult = await reader.read();
      const firstText = new TextDecoder().decode(firstResult.value);
      expect(firstText).toContain('data:');
      expect(firstText).toContain('B-01');

      // Add a new booking, triggering update
      setTimeout(() => {
        saveBookings([
          { id: 'B-01', customerId: 'C-01', partnerCode: 'P-01', service: 'Wash', status: 'Pending', total: 100, bookingDate: '2026-06-20' },
          { id: 'B-02', customerId: 'C-01', partnerCode: 'P-01', service: 'Dry', status: 'Pending', total: 50, bookingDate: '2026-06-20' },
        ]);
      }, 50);

      const secondResult = await reader.read();
      const secondText = new TextDecoder().decode(secondResult.value);
      expect(secondText).toContain('data:');
      expect(secondText).toContain('B-02');

      await reader.cancel();
    });

    it('should stream assigned bookings and update on database changes', async () => {
      saveBookings([
        { id: 'B-01', customerId: 'C-01', partnerCode: 'P-01', service: 'Wash', status: 'Pending', total: 100, bookingDate: '2026-06-20', riderCode: 'RDR-1024' },
      ]);

      const req = new Request('http://localhost/api/mobile/riders/bookings/stream?riderCode=RDR-1024');
      const response = await bookingsStreamHandler(req);
      expect(response.status).toBe(200);

      const reader = response.body!.getReader();

      // Read initial assigned bookings
      const firstResult = await reader.read();
      const firstText = new TextDecoder().decode(firstResult.value);
      expect(firstText).toContain('data:');
      expect(firstText).toContain('B-01');

      // Update booking status
      setTimeout(() => {
        saveBookings([
          { id: 'B-01', customerId: 'C-01', partnerCode: 'P-01', service: 'Wash', status: 'Delivering', total: 100, bookingDate: '2026-06-20', riderCode: 'RDR-1024' },
        ]);
      }, 50);

      const secondResult = await reader.read();
      const secondText = new TextDecoder().decode(secondResult.value);
      expect(secondText).toContain('data:');
      expect(secondText).toContain('Delivering');

      await reader.cancel();
    });
  });
});
