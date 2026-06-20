import { NextResponse } from 'next/server';
import { getBookings, updateBookingStatus } from '../../../../utils/bookingsDb';
import { getCustomers } from '../../../../utils/customersDb';

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
    const customers = getCustomers();

    // Filter bookings by partner
    const partnerBookings = bookings.filter((b) => b.partnerCode === partnerCode);

    // Populate customer names
    const populated = partnerBookings.map((booking) => {
      const customer = customers.find((c) => c.id === booking.customerId);
      return {
        ...booking,
        customerName: customer ? customer.name : 'Unknown Customer',
      };
    });

    return NextResponse.json({
      success: true,
      data: populated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve bookings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Booking ID and status are required' },
        { status: 400 }
      );
    }

    const success = updateBookingStatus(id, status);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update booking status' },
      { status: 500 }
    );
  }
}
