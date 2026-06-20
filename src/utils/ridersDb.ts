import fs from 'fs';
import path from 'path';

export interface Rider {
  id: number;
  riderCode: string;
  name: string;
  licenseNumber: string;
  email: string;
  phone: string;
  vehicle: string;
  status: 'Active' | 'Inactive';
  password?: string;
}

const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
const fileName = isTest ? 'riders.test.json' : 'riders.json';
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
        riderCode: 'RDR-1024',
        name: 'Mike Johnson',
        licenseNumber: 'D01-23-456789',
        email: 'mike@example.com',
        phone: '09171234567',
        vehicle: 'Motorcycle',
        status: 'Active',
        password: 'password123'
      }
    ], null, 2));
  }
}

export function getRiders(): Rider[] {
  ensureDb();
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

export function saveRiders(riders: Rider[]) {
  ensureDb();
  fs.writeFileSync(filePath, JSON.stringify(riders, null, 2));
}

export function addRider(data: Omit<Rider, 'id'>): Rider {
  const riders = getRiders();
  const maxId = riders.reduce((max, r) => r.id > max ? r.id : max, 0);
  const newRider: Rider = {
    id: maxId + 1,
    ...data,
    password: data.password || 'password123',
  };
  riders.push(newRider);
  saveRiders(riders);
  return newRider;
}

export function authenticateRider(riderCode: string, password: string): Rider | null {
  const riders = getRiders();
  const rider = riders.find((r) => r.riderCode === riderCode);
  if (rider && rider.password === password && rider.status === 'Active') {
    return rider;
  }
  return null;
}
