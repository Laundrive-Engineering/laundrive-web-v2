import { NextResponse } from 'next/server';
import { getCustomers, addCustomer } from '../../../../../utils/customersDb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.phone || !body.address || !body.password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, phone, address, and password are required' },
        { status: 400 }
      );
    }

    const customers = getCustomers();
    const existing = customers.find(
      (c) => c.email.toLowerCase() === body.email.toLowerCase()
    );
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }

    const newCustomer = addCustomer({
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      password: body.password,
    });

    return NextResponse.json({ success: true, data: newCustomer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
