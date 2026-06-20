import fs from 'fs';
import path from 'path';

export interface Partner {
  id: number;
  partnerCode: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  password?: string;
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
      { id: 1, partnerCode: "QC-001", name: "Quick Clean", contactPerson: "John Doe", email: "contact@quickclean.com", phone: "09123456789", location: "Cebu City", password: "password123" },
      { id: 2, partnerCode: "LD-002", name: "Laundry Day", contactPerson: "Jane Smith", email: "info@laundryday.ph", phone: "09987654321", location: "Mandaue City", password: "password123" }
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
