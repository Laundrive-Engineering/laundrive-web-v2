import { NextResponse } from 'next/server';
import { getBookings, addBooking } from '../../../../utils/bookingsDb';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const customerId = url.searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const bookings = getBookings();
    const customerBookings = bookings.filter((b) => b.customerId === customerId);

    return NextResponse.json({
      success: true,
      data: customerBookings,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.customerId || !body.partnerCode || !body.service || body.total === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newBooking = addBooking({
      customerId: body.customerId,
      partnerCode: body.partnerCode,
      service: body.service,
      total: Number(body.total),
    });

    return NextResponse.json(
      { success: true, data: newBooking },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
