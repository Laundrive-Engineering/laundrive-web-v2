import { NextResponse } from 'next/server';
import { getPartners, addPartner, updatePartner, deletePartner } from '../../../utils/partnersDb';
import { generatePartnerCode, generateSecurePassword } from '../../../utils/generators';

export async function GET() {
  const partners = getPartners();
  return NextResponse.json({ success: true, data: partners });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.contactPerson || !body.email || !body.phone || !body.location) {
      return NextResponse.json({ success: false, error: 'Name, contact person, email, phone, and location are required' }, { status: 400 });
    }

    const partnerCode = generatePartnerCode(body.name);
    const password = generateSecurePassword();

    const newPartner = addPartner({
      partnerCode,
      name: body.name,
      contactPerson: body.contactPerson,
      email: body.email,
      phone: body.phone,
      location: body.location,
      password: password,
    });

    return NextResponse.json({ success: true, data: newPartner }, { status: 201 });
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
    const success = updatePartner(id, updates);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const idStr = url.searchParams.get('id');
    if (!idStr) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const id = parseInt(idStr, 10);
    const success = deletePartner(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Partner not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
