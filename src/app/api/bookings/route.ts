import { NextResponse } from 'next/server';

export async function GET() {
  const mockBookings = [
    { id: 'BKG-001', customerId: 'CUST-001', partnerCode: 'QC-001', service: 'Wash & Fold', status: 'In Laundry', total: 350.00 },
    { id: 'BKG-002', customerId: 'CUST-002', partnerCode: 'LD-002', service: 'Dry Cleaning', status: 'Pending', total: 600.00 },
  ];
  return NextResponse.json({ success: true, data: mockBookings });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Basic validation mock
    if (!body.customerId || !body.partnerCode || !body.service) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    const newBooking = {
      id: `BKG-00${Math.floor(100 + Math.random() * 900)}`,
      ...body,
      status: 'Pending',
    };
    
    return NextResponse.json({ success: true, data: newBooking }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
