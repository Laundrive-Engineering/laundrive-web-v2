import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { GET as getStatsHandler } from './route';
import { saveBookings } from '../../../../utils/bookingsDb';

const testDbPath = path.join(process.cwd(), 'src/data/bookings.test.json');

describe('Partner Stats API TDD Test Suite', () => {
  const today = new Date().toISOString().split('T')[0];

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

  it('should return 400 when partnerCode is missing', async () => {
    const req = new Request('http://localhost/api/partner/stats');
    const response = await getStatsHandler(req);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('Partner code is required');
  });

  it('should calculate pending and completed today counts correctly for a partner', async () => {
    // Write test bookings
    saveBookings([
      // QC-001 bookings
      { id: 'B-01', customerId: 'C-01', partnerCode: 'QC-001', service: 'Wash', status: 'Pending', total: 100, bookingDate: today },
      { id: 'B-02', customerId: 'C-01', partnerCode: 'QC-001', service: 'Dry', status: 'Completed', total: 50, bookingDate: today },
      { id: 'B-03', customerId: 'C-01', partnerCode: 'QC-001', service: 'Fold', status: 'Completed', total: 30, bookingDate: '2020-01-01' }, // Completed another day
      { id: 'B-04', customerId: 'C-01', partnerCode: 'QC-001', service: 'Iron', status: 'In Laundry', total: 80, bookingDate: today }, // Active, not pending/completed
      
      // QC-002 bookings (different partner)
      { id: 'B-05', customerId: 'C-02', partnerCode: 'QC-002', service: 'Wash', status: 'Pending', total: 100, bookingDate: today },
      { id: 'B-06', customerId: 'C-02', partnerCode: 'QC-002', service: 'Dry', status: 'Completed', total: 50, bookingDate: today },
    ]);

    const req = new Request('http://localhost/api/partner/stats?partnerCode=QC-001');
    const response = await getStatsHandler(req);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.pendingCount).toBe(1); // Only B-01 is 'Pending' for QC-001
    expect(json.data.completedTodayCount).toBe(1); // Only B-02 is 'Completed' today for QC-001
  });
});
