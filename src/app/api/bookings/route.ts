import { NextResponse } from 'next/server';
import { getBookings, addBooking } from '../../../utils/bookingsDb';

export async function GET() {
  try {
    const bookings = getBookings();
    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to retrieve bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Basic validation mock
    if (!body.customerId || !body.partnerCode || !body.service || body.total === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    const newBooking = addBooking({
      customerId: body.customerId,
      partnerCode: body.partnerCode,
      service: body.service,
      total: Number(body.total),
    });
    
    return NextResponse.json({ success: true, data: newBooking }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
