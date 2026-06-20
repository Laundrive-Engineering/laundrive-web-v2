import fs from 'fs';
import path from 'path';

export interface Service {
  id: string;
  name: string;
  price: number;
  unit: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  operatingHours: string;
  offeredServices: string[];
}

export interface Partner {
  id: number;
  partnerCode: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  password?: string;
  thumbnail?: string;
  logo?: string;
  banner?: string;
  services?: Service[];
  branches?: Branch[];
}

const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
const fileName = isTest ? 'partners.test.json' : 'partners.json';
const filePath = path.join(process.cwd(), 'src/data', fileName);

function ensureDb() {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([
      {
        id: 1,
        partnerCode: "QC-001",
        name: "Quick Clean",
        contactPerson: "John Doe",
        email: "contact@quickclean.com",
        phone: "09123456789",
        location: "Cebu City",
        password: "password123",
        thumbnail: "/images/partners/quick_clean_thumbnail.png",
        logo: "/images/partners/quick_clean_thumbnail.png",
        banner: "/images/partners/quick_clean_banner.png",
        services: [
          { id: "SRV-001", name: "Wash, Dry & Fold", price: 150.00, unit: "per kg" },
          { id: "SRV-002", name: "Premium Detergent", price: 25.00, unit: "per sachet" },
          { id: "SRV-003", name: "Fabric Conditioner", price: 20.00, unit: "per sachet" }
        ],
        branches: [
          { id: "BR-001", name: "IT Park Branch", address: "IT Park, Cebu City", phone: "09123456789", operatingHours: "8:00 AM - 5:00 PM", offeredServices: ["SRV-001", "SRV-002", "SRV-003"] },
          { id: "BR-002", name: "Banilad Branch", address: "Banilad, Cebu City", phone: "09123456780", operatingHours: "9:00 AM - 6:00 PM", offeredServices: ["SRV-001"] }
        ]
      },
      {
        id: 2,
        partnerCode: "LD-002",
        name: "Laundry Day",
        contactPerson: "Jane Smith",
        email: "info@laundryday.ph",
        phone: "09987654321",
        location: "Mandaue City",
        password: "password123",
        thumbnail: "/images/partners/laundry_day_thumbnail.png",
        logo: "/images/partners/laundry_day_thumbnail.png",
        banner: "/images/partners/laundry_day_banner.png",
        services: [
          { id: "SRV-004", name: "Dry Cleaning (Suit)", price: 450.00, unit: "per set" },
          { id: "SRV-005", name: "Ironing Only", price: 80.00, unit: "per kg" }
        ],
        branches: [
          { id: "BR-003", name: "Mandaue Branch", address: "Mandaue City, Cebu", phone: "09987654321", operatingHours: "8:00 AM - 8:00 PM", offeredServices: ["SRV-004", "SRV-005"] }
        ]
      }
    ], null, 2));
  }
}

export function getPartners(): Partner[] {
  ensureDb();
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

export function savePartners(partners: Partner[]) {
  ensureDb();
  fs.writeFileSync(filePath, JSON.stringify(partners, null, 2));
}

export function addPartner(data: Omit<Partner, 'id'>): Partner {
  const partners = getPartners();
  const maxId = partners.reduce((max, p) => p.id > max ? p.id : max, 0);
  const newPartner: Partner = {
    id: maxId + 1,
    ...data,
    password: data.password || 'password123',
  };
  partners.push(newPartner);
  savePartners(partners);
  return newPartner;
}

export function updatePartner(id: number, updates: Partial<Partner>): boolean {
  const partners = getPartners();
  const idx = partners.findIndex(p => p.id === id);
  if (idx === -1) return false;
  partners[idx] = { ...partners[idx], ...updates };
  savePartners(partners);
  return true;
}

export function deletePartner(id: number): boolean {
  const partners = getPartners();
  const filtered = partners.filter(p => p.id !== id);
  if (filtered.length === partners.length) return false;
  savePartners(filtered);
  return true;
}
