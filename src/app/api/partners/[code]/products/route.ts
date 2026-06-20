import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code: partnerCode } = await params;
  
  // Mock data mapping based on partner code
  const productCatalog: Record<string, any[]> = {
    'QC-001': [
      { id: 'PRD-1', name: 'Wash, Dry & Fold', price: 150.00, unit: 'per kg', category: 'Service' },
      { id: 'PRD-2', name: 'Premium Detergent', price: 25.00, unit: 'per sachet', category: 'Add-on' },
      { id: 'PRD-3', name: 'Fabric Conditioner', price: 20.00, unit: 'per sachet', category: 'Add-on' },
    ],
    'LD-002': [
      { id: 'PRD-4', name: 'Dry Cleaning (Suit)', price: 450.00, unit: 'per set', category: 'Service' },
      { id: 'PRD-5', name: 'Ironing Only', price: 80.00, unit: 'per kg', category: 'Service' },
    ]
  };

  const products = productCatalog[partnerCode] || [];

  if (products.length === 0) {
    return NextResponse.json({ success: false, error: 'Partner or products not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, partnerCode, data: products });
}
