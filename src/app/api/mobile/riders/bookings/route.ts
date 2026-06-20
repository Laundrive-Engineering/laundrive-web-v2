import { NextResponse } from 'next/server';
import { getBookings, updateBooking } from '../../../../../utils/bookingsDb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const riderCodeParam = searchParams.get('riderCode');

    const bookings = getBookings();

    if (statusParam === 'available') {
      const availableBookings = bookings.filter(
        (b) => (b.status === 'Pending' || b.status === 'Delivering') && !b.riderCode
      );
      return NextResponse.json({ success: true, data: availableBookings });
    }

    if (riderCodeParam) {
      const assignedBookings = bookings.filter((b) => b.riderCode === riderCodeParam);
      return NextResponse.json({ success: true, data: assignedBookings });
    }

    return NextResponse.json(
      { success: false, error: 'Query parameters status=available or riderCode are required' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, riderCode, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};
    if (riderCode !== undefined) {
      updates.riderCode = riderCode;
    }
    if (status !== undefined) {
      updates.status = status;
    }

    const success = updateBooking(id, updates);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
