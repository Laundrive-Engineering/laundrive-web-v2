import { NextResponse } from 'next/server';
import { getCustomers } from '../../../../../utils/customersDb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const customers = getCustomers();
    const customer = customers.find(
      (c) =>
        c.email.toLowerCase() === body.email.toLowerCase() &&
        c.password === body.password
    );

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return user details without password
    const { password, ...safeData } = customer;

    return NextResponse.json({
      success: true,
      token: `mock-token-${customer.id}-${Date.now()}`,
      data: safeData,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
