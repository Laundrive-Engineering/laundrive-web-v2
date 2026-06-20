import { NextResponse } from 'next/server';
import { getCustomers, addCustomer, updateCustomer } from '../../../utils/customersDb';

export async function GET() {
  const customers = getCustomers();
  return NextResponse.json({ success: true, data: customers });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.phone || !body.address) {
      return NextResponse.json({ success: false, error: 'Name, email, phone, and address are required' }, { status: 400 });
    }

    const newCustomer = addCustomer({
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      password: body.password || 'password123',
    });
    return NextResponse.json({ success: true, data: newCustomer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const { id, ...updates } = body;
    const success = updateCustomer(id, updates);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
