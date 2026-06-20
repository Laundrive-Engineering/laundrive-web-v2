import { NextResponse } from 'next/server';
import { getPartners } from '../../../../../utils/partnersDb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code: partnerCode } = await params;
  
  const partners = getPartners();
  const partner = partners.find(
    (p) => p.partnerCode.toLowerCase() === partnerCode.toLowerCase()
  );

  if (!partner) {
    return NextResponse.json({ success: false, error: 'Partner or products not found' }, { status: 404 });
  }

  const products = (partner.services || []).map(s => ({
    id: s.id,
    name: s.name,
    price: s.price,
    unit: s.unit,
    category: s.name.toLowerCase().includes('detergent') || s.name.toLowerCase().includes('conditioner') ? 'Add-on' : 'Service'
  }));

  if (products.length === 0) {
    return NextResponse.json({ success: false, error: 'Partner or products not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, partnerCode, data: products });
}
