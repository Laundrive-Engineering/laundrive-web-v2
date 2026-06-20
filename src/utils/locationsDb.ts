import fs from 'fs';
import path from 'path';

export interface OperationLocation {
  id: string;
  name: string;
  active: boolean;
}

const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
const fileName = isTest ? 'locations.test.json' : 'locations.json';
const filePath = path.join(process.cwd(), 'src/data', fileName);

function ensureDb() {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([
      { id: "LOC-001", name: "Cebu City", active: true },
      { id: "LOC-002", name: "Mandaue City", active: true }
    ], null, 2));
  }
}

export function getLocations(): OperationLocation[] {
  ensureDb();
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

export function saveLocations(locations: OperationLocation[]) {
  ensureDb();
  fs.writeFileSync(filePath, JSON.stringify(locations, null, 2));
}

export function addLocation(name: string): OperationLocation {
  const locations = getLocations();
  const maxId = locations.reduce((max, loc) => {
    const num = parseInt(loc.id.replace('LOC-', ''), 10);
    return num > max ? num : max;
  }, 0);
  const newLocation: OperationLocation = {
    id: `LOC-${String(maxId + 1).padStart(3, '0')}`,
    name,
    active: true
  };
  locations.push(newLocation);
  saveLocations(locations);
  return newLocation;
}

export function deleteLocation(id: string): boolean {
  const locations = getLocations();
  const filtered = locations.filter(loc => loc.id !== id);
  if (filtered.length === locations.length) return false;
  saveLocations(filtered);
  return true;
}

export function updateLocation(id: string, updates: Partial<OperationLocation>): boolean {
  const locations = getLocations();
  const idx = locations.findIndex(loc => loc.id === id);
  if (idx === -1) return false;
  locations[idx] = { ...locations[idx], ...updates };
  saveLocations(locations);
  return true;
}
