import { NextResponse } from 'next/server';
import { authenticateRider } from '../../../../../utils/ridersDb';

export async function POST(request: Request) {
  try {
    const { riderCode, password } = await request.json();
    if (!riderCode || !password) {
      return NextResponse.json(
        { success: false, error: 'Rider code and password are required' },
        { status: 400 }
      );
    }

    const rider = authenticateRider(riderCode, password);
    if (!rider) {
      return NextResponse.json(
        { success: false, error: 'Invalid rider credentials' },
        { status: 401 }
      );
    }

    // Omit password from response
    const { password: _, ...riderData } = rider;

    return NextResponse.json({
      success: true,
      rider: riderData,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
