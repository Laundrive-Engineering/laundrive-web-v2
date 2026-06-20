import fs from 'fs';
import path from 'path';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  status: 'Active' | 'Inactive';
  password?: string;
}

const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
const fileName = isTest ? 'customers.test.json' : 'customers.json';
const filePath = path.join(process.cwd(), 'src/data', fileName);

function ensureDb() {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([
      { id: "CUST-001", name: "Alice Green", email: "alice@example.com", phone: "09123456780", address: "IT Park, Cebu", joinDate: "2024-01-15", status: "Active", password: "password123" },
      { id: "CUST-002", name: "Bob White", email: "bob@example.com", phone: "09987654320", address: "Banilad, Mandaue", joinDate: "2024-03-22", status: "Active", password: "password123" }
    ], null, 2));
  }
}

export function getCustomers(): Customer[] {
  ensureDb();
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

export function saveCustomers(customers: Customer[]) {
  ensureDb();
  fs.writeFileSync(filePath, JSON.stringify(customers, null, 2));
}

export function addCustomer(data: Omit<Customer, 'id' | 'joinDate' | 'status'>): Customer {
  const customers = getCustomers();
  const maxId = customers.reduce((max, c) => {
    const num = parseInt(c.id.replace('CUST-', ''), 10);
    return num > max ? num : max;
  }, 0);
  const newCustomer: Customer = {
    id: `CUST-${String(maxId + 1).padStart(3, '0')}`,
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    ...data,
    password: data.password || 'password123',
  };
  customers.push(newCustomer);
  saveCustomers(customers);
  return newCustomer;
}

export function updateCustomer(id: string, updates: Partial<Customer>): boolean {
  const customers = getCustomers();
  const idx = customers.findIndex(c => c.id === id);
  if (idx === -1) return false;
  customers[idx] = { ...customers[idx], ...updates };
  saveCustomers(customers);
  return true;
}

export function deleteCustomer(id: string): boolean {
  return updateCustomer(id, { status: 'Inactive' });
}
