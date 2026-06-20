import { NextResponse } from 'next/server';
import { getCustomers } from '../../../../../utils/customersDb';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const customers = getCustomers();
    const customer = customers.find((c) => c.id === id);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Return user details without password
    const { password, ...safeData } = customer;

    return NextResponse.json({
      success: true,
      data: safeData,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
