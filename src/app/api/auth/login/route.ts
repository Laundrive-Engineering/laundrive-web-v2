import { NextResponse } from 'next/server';
import { getPartners } from '../../../../utils/partnersDb';

const ADMIN_ACCOUNTS = [
  { email: 'superadmin@laundrive.com', password: 'Laundrive@Super2026!Admin', role: 'super-admin', type: 0 },
  { email: 'admin@laundrive.com', password: 'Laundrive#Admin2026%Secure', role: 'admin', type: 0 },
];

export async function POST(request: Request) {
  try {
    const { identifier, password, type } = await request.json();
    if (type === undefined || identifier === undefined || password === undefined) {
      return NextResponse.json({ success: false, error: 'Identifier, password, and type are required' }, { status: 400 });
    }

    if (type === 0) {
      // Admin login
      const admin = ADMIN_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === identifier.toLowerCase() && acc.password === password
      );
      if (admin) {
        return NextResponse.json({ success: true, role: admin.role, type: 0 });
      }
    } else if (type === 1) {
      // Partner login
      const partners = getPartners();
      const partner = partners.find(
        (p) => p.partnerCode.toUpperCase() === identifier.toUpperCase() && p.password === password
      );
      if (partner) {
        return NextResponse.json({
          success: true,
          role: 'partner',
          type: 1,
          name: partner.name,
          partnerCode: partner.partnerCode
        });
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
