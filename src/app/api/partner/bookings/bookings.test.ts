import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { GET as getBookingsHandler, PATCH as patchBookingHandler } from './route';
import { saveBookings } from '../../../../utils/bookingsDb';
import { saveCustomers } from '../../../../utils/customersDb';

const testBookingsDbPath = path.join(process.cwd(), 'src/data/bookings.test.json');
const testCustomersDbPath = path.join(process.cwd(), 'src/data/customers.test.json');

describe('Partner Bookings API TDD Test Suite', () => {
  beforeEach(() => {
    if (fs.existsSync(testBookingsDbPath)) fs.unlinkSync(testBookingsDbPath);
    if (fs.existsSync(testCustomersDbPath)) fs.unlinkSync(testCustomersDbPath);
  });

  afterEach(() => {
    if (fs.existsSync(testBookingsDbPath)) fs.unlinkSync(testBookingsDbPath);
    if (fs.existsSync(testCustomersDbPath)) fs.unlinkSync(testCustomersDbPath);
  });

  it('should return 400 when partnerCode is missing on GET', async () => {
    const req = new Request('http://localhost/api/partner/bookings');
    const response = await getBookingsHandler(req);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('Partner code is required');
  });

  it('should return bookings filtered by partner code with customerName populated on GET', async () => {
    // Save mock customers and bookings
    saveCustomers([
      { id: 'C-01', name: 'Alice Green', email: 'a@example.com', phone: '1', address: 'Cebu', joinDate: '2024', status: 'Active' },
    ]);

    saveBookings([
      { id: 'B-01', customerId: 'C-01', partnerCode: 'QC-001', service: 'Wash', status: 'Pending', total: 100, bookingDate: '2024-06-20' },
      { id: 'B-02', customerId: 'C-02', partnerCode: 'QC-002', service: 'Dry', status: 'Pending', total: 50, bookingDate: '2024-06-20' },
    ]);

    const req = new Request('http://localhost/api/partner/bookings?partnerCode=QC-001');
    const response = await getBookingsHandler(req);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(1);
    expect(json.data[0].id).toBe('B-01');
    expect(json.data[0].customerName).toBe('Alice Green'); // Populated name
  });

  it('should update booking status and return 200 on PATCH', async () => {
    saveBookings([
      { id: 'B-01', customerId: 'C-01', partnerCode: 'QC-001', service: 'Wash', status: 'Pending', total: 100, bookingDate: '2024-06-20' },
    ]);

    const req = new Request('http://localhost/api/partner/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'B-01',
        status: 'In Laundry',
      }),
    });

    const response = await patchBookingHandler(req);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);

    // Verify it updated in the DB
    const bookings = JSON.parse(fs.readFileSync(testBookingsDbPath, 'utf-8'));
    expect(bookings[0].status).toBe('In Laundry');
  });
});
