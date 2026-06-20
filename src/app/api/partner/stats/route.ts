import { NextResponse } from 'next/server';
import { getBookings } from '../../../../utils/bookingsDb';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const partnerCode = url.searchParams.get('partnerCode');

    if (!partnerCode) {
      return NextResponse.json(
        { success: false, error: 'Partner code is required' },
        { status: 400 }
      );
    }

    const bookings = getBookings();
    const today = new Date().toISOString().split('T')[0];

    const partnerBookings = bookings.filter((b) => b.partnerCode === partnerCode);

    const pendingCount = partnerBookings.filter((b) => b.status === 'Pending').length;
    const completedTodayCount = partnerBookings.filter(
      (b) => b.status === 'Completed' && b.bookingDate === today
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        pendingCount,
        completedTodayCount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve stats' },
      { status: 500 }
    );
  }
}
