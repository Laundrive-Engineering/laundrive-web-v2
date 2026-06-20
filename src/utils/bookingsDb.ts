import fs from 'fs';
import path from 'path';

export interface Booking {
  id: string;
  customerId: string;
  partnerCode: string;
  branchName?: string;
  service: string;
  status: 'Pending' | 'Picked Up' | 'In Laundry' | 'Delivering' | 'Completed';
  total: number;
  bookingDate: string;
}

const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
const fileName = isTest ? 'bookings.test.json' : 'bookings.json';
const filePath = path.join(process.cwd(), 'src/data', fileName);

function ensureDb() {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([
      { id: 'BKG-001', customerId: 'CUST-001', partnerCode: 'QC-001', service: 'Wash & Fold', status: 'In Laundry', total: 350.00, bookingDate: '2024-06-20' },
      { id: 'BKG-002', customerId: 'CUST-002', partnerCode: 'LD-002', service: 'Dry Cleaning', status: 'Pending', total: 600.00, bookingDate: '2024-06-20' },
    ], null, 2));
  }
}

export function getBookings(): Booking[] {
  ensureDb();
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

export function saveBookings(bookings: Booking[]) {
  ensureDb();
  fs.writeFileSync(filePath, JSON.stringify(bookings, null, 2));
}

export function addBooking(data: Omit<Booking, 'id' | 'status' | 'bookingDate'>): Booking {
  const bookings = getBookings();
  const maxId = bookings.reduce((max, b) => {
    const parsed = parseInt(b.id.replace('BKG-', ''), 10);
    const num = isNaN(parsed) ? 0 : parsed;
    return num > max ? num : max;
  }, 0);

  const newBooking: Booking = {
    id: `BKG-${String(maxId + 1).padStart(3, '0')}`,
    status: 'Pending',
    bookingDate: new Date().toISOString().split('T')[0],
    ...data,
  };

  bookings.push(newBooking);
  saveBookings(bookings);
  return newBooking;
}

export function updateBookingStatus(id: string, status: Booking['status']): boolean {
  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return false;
  bookings[idx].status = status;
  saveBookings(bookings);
  return true;
}
