import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Import handlers for all involved applications/actors
import { POST as customerCreateBookingHandler, GET as customerGetBookingsHandler } from './mobile/bookings/route';
import { GET as customerStreamHandler } from './mobile/bookings/stream/route';
import { POST as riderLoginHandler } from './mobile/riders/login/route';
import { GET as riderBookingsHandler, PATCH as riderPatchBookingHandler } from './mobile/riders/bookings/route';
import { GET as partnerGetBookingsHandler, PATCH as partnerPatchBookingHandler } from './partner/bookings/route';

import { saveBookings } from '../../utils/bookingsDb';
import { saveRiders } from '../../utils/ridersDb';
import { saveCustomers } from '../../utils/customersDb';

const testBookingsDbPath = path.join(process.cwd(), 'src/data/bookings.test.json');
const testRidersDbPath = path.join(process.cwd(), 'src/data/riders.test.json');
const testCustomersDbPath = path.join(process.cwd(), 'src/data/customers.test.json');

describe('End-to-End Integration Flow (Customer, Dashboard & Courier)', () => {
  beforeEach(() => {
    if (fs.existsSync(testBookingsDbPath)) fs.unlinkSync(testBookingsDbPath);
    if (fs.existsSync(testRidersDbPath)) fs.unlinkSync(testRidersDbPath);
    if (fs.existsSync(testCustomersDbPath)) fs.unlinkSync(testCustomersDbPath);

    // Setup mock driver
    saveRiders([
      {
        id: 1,
        riderCode: 'RDR-1024',
        name: 'Mike Johnson',
        licenseNumber: 'D01-23-456789',
        email: 'mike@example.com',
        phone: '09171234567',
        vehicle: 'Motorcycle',
        status: 'Active',
        password: 'password123',
      },
    ]);

    // Setup mock customer
    saveCustomers([
      {
        id: 'CUST-001',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '09187654321',
        address: 'Cebu City',
        status: 'Active',
        joinDate: '2026-06-20',
      },
    ]);
  });

  afterEach(() => {
    if (fs.existsSync(testBookingsDbPath)) fs.unlinkSync(testBookingsDbPath);
    if (fs.existsSync(testRidersDbPath)) fs.unlinkSync(testRidersDbPath);
    if (fs.existsSync(testCustomersDbPath)) fs.unlinkSync(testCustomersDbPath);
  });

  it('should process booking lifecycle across customer, courier, and partner dashboard apps', async () => {
    // -------------------------------------------------------------
    // Step 1: Customer App (Create Booking)
    // -------------------------------------------------------------
    const createBookingReq = new Request('http://localhost/api/mobile/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'CUST-001',
        partnerCode: 'QC-001',
        branchName: 'IT Park Branch',
        service: 'Wash & Fold',
        total: 350.0,
      }),
    });

    const createResponse = await customerCreateBookingHandler(createBookingReq);
    expect(createResponse.status).toBe(201);

    const createJson = await createResponse.json();
    expect(createJson.success).toBe(true);
    const bookingId = createJson.data.id;
    expect(bookingId).toBeDefined();
    expect(createJson.data.status).toBe('Pending');
    expect(createJson.data.riderCode).toBeUndefined();

    // -------------------------------------------------------------
    // Step 2: Courier App (Rider Login)
    // -------------------------------------------------------------
    const riderLoginReq = new Request('http://localhost/api/mobile/riders/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        riderCode: 'RDR-1024',
        password: 'password123',
      }),
    });

    const loginResponse = await riderLoginHandler(riderLoginReq);
    expect(loginResponse.status).toBe(200);
    const loginJson = await loginResponse.json();
    expect(loginJson.success).toBe(true);
    expect(loginJson.rider.riderCode).toBe('RDR-1024');

    // -------------------------------------------------------------
    // Step 3: Courier App (Get Available Bookings & Claim Job)
    // -------------------------------------------------------------
    // Courier checks available delivery orders
    const getAvailableReq = new Request('http://localhost/api/mobile/riders/bookings?status=available');
    const availableResponse = await riderBookingsHandler(getAvailableReq);
    expect(availableResponse.status).toBe(200);

    const availableJson = await availableResponse.json();
    expect(availableJson.success).toBe(true);
    const foundBooking = availableJson.data.find((b: any) => b.id === bookingId);
    expect(foundBooking).toBeDefined();

    // Courier claims the booking and marks it as Picked Up
    const claimReq = new Request('http://localhost/api/mobile/riders/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: bookingId,
        riderCode: 'RDR-1024',
        status: 'Picked Up',
      }),
    });

    const claimResponse = await riderPatchBookingHandler(claimReq);
    expect(claimResponse.status).toBe(200);
    const claimJson = await claimResponse.json();
    expect(claimJson.success).toBe(true);

    // -------------------------------------------------------------
    // Step 4: Partner Dashboard (Get Booking & process laundry)
    // -------------------------------------------------------------
    // Partner checks dashboard bookings list
    const partnerGetReq = new Request(`http://localhost/api/partner/bookings?partnerCode=QC-001`);
    const partnerGetResponse = await partnerGetBookingsHandler(partnerGetReq);
    expect(partnerGetResponse.status).toBe(200);
    const partnerGetJson = await partnerGetResponse.json();
    expect(partnerGetJson.success).toBe(true);

    const partnerBooking = partnerGetJson.data.find((b: any) => b.id === bookingId);
    expect(partnerBooking).toBeDefined();
    expect(partnerBooking.customerName).toBe('John Doe'); // Customer details populated

    // Partner dashboard updates booking status to "In Laundry"
    const partnerUpdateReq = new Request('http://localhost/api/partner/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: bookingId,
        status: 'In Laundry',
      }),
    });

    const partnerUpdateResponse = await partnerPatchBookingHandler(partnerUpdateReq);
    expect(partnerUpdateResponse.status).toBe(200);
    const partnerUpdateJson = await partnerUpdateResponse.json();
    expect(partnerUpdateJson.success).toBe(true);

    // -------------------------------------------------------------
    // Step 5: Courier App (Start Delivery & Complete Order)
    // -------------------------------------------------------------
    // Driver picks up from laundry, changes status to "Delivering"
    const deliverReq = new Request('http://localhost/api/mobile/riders/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: bookingId,
        status: 'Delivering',
      }),
    });
    const deliverResponse = await riderPatchBookingHandler(deliverReq);
    expect(deliverResponse.status).toBe(200);

    // Driver completes the dropoff, changes status to "Completed"
    const completeReq = new Request('http://localhost/api/mobile/riders/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: bookingId,
        status: 'Completed',
      }),
    });
    const completeResponse = await riderPatchBookingHandler(completeReq);
    expect(completeResponse.status).toBe(200);

    // -------------------------------------------------------------
    // Step 6: Verify Final State in Customer & Partner apps
    // -------------------------------------------------------------
    // Customer app verification
    const customerVerifyReq = new Request(`http://localhost/api/mobile/bookings?customerId=CUST-001`);
    const customerVerifyResponse = await customerGetBookingsHandler(customerVerifyReq);
    expect(customerVerifyResponse.status).toBe(200);
    const customerVerifyJson = await customerVerifyResponse.json();
    expect(customerVerifyJson.success).toBe(true);

    const finalBooking = customerVerifyJson.data.find((b: any) => b.id === bookingId);
    expect(finalBooking.status).toBe('Completed');
    expect(finalBooking.riderCode).toBe('RDR-1024');
  });

  it('should stream booking status updates to the customer app in real-time', async () => {
    // 1. Create a booking
    const createBookingReq = new Request('http://localhost/api/mobile/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'CUST-001',
        partnerCode: 'QC-001',
        branchName: 'IT Park Branch',
        service: 'Wash & Fold',
        total: 350.0,
      }),
    });
    const createResponse = await customerCreateBookingHandler(createBookingReq);
    const createJson = await createResponse.json();
    const bookingId = createJson.data.id;

    // 2. Open the customer stream
    const streamReq = new Request(`http://localhost/api/mobile/bookings/stream?customerId=CUST-001`);
    const streamResponse = await customerStreamHandler(streamReq);
    expect(streamResponse.status).toBe(200);
    expect(streamResponse.headers.get('Content-Type')).toBe('text/event-stream');

    const reader = streamResponse.body!.getReader();
    
    // Read initial list
    let chunk = await reader.read();
    let text = new TextDecoder().decode(chunk.value);
    expect(text).toContain('data:');
    let dataList = JSON.parse(text.split('data:')[1].trim());
    let initialBooking = dataList.find((b: any) => b.id === bookingId);
    expect(initialBooking.status).toBe('Pending');

    // 3. Courier claims booking (updates status to 'Picked Up')
    const claimReq = new Request('http://localhost/api/mobile/riders/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: bookingId,
        riderCode: 'RDR-1024',
        status: 'Picked Up',
      }),
    });
    await riderPatchBookingHandler(claimReq);

    // Read updated list (Picked Up)
    chunk = await reader.read();
    text = new TextDecoder().decode(chunk.value);
    expect(text).toContain('data:');
    dataList = JSON.parse(text.split('data:')[1].trim());
    let pickedUpBooking = dataList.find((b: any) => b.id === bookingId);
    expect(pickedUpBooking.status).toBe('Picked Up');

    // 4. Courier drops off at laundry (updates status to 'In Laundry')
    const dropoffReq = new Request('http://localhost/api/mobile/riders/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: bookingId,
        status: 'In Laundry',
      }),
    });
    await riderPatchBookingHandler(dropoffReq);

    // Read updated list (In Laundry)
    chunk = await reader.read();
    text = new TextDecoder().decode(chunk.value);
    expect(text).toContain('data:');
    dataList = JSON.parse(text.split('data:')[1].trim());
    let laundryBooking = dataList.find((b: any) => b.id === bookingId);
    expect(laundryBooking.status).toBe('In Laundry');

    // Clean up
    await reader.cancel();
  });
});
