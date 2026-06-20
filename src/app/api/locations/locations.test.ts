import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as db from '../../../utils/locationsDb';
import { GET, POST, PATCH, DELETE } from './route';

const testDbPath = path.join(process.cwd(), 'src/data/locations.test.json');

describe('Operation Locations TDD Test Suite', () => {
  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('Database Unit Tests', () => {
    it('should read the default locations list', () => {
      const locations = db.getLocations();
      expect(locations).toHaveLength(2);
      expect(locations[0].name).toBe('Cebu City');
      expect(locations[1].name).toBe('Mandaue City');
    });

    it('should add a new location with incremental ID', () => {
      const newLoc = db.addLocation('Lapu-Lapu City');
      expect(newLoc.id).toBe('LOC-003');
      expect(newLoc.name).toBe('Lapu-Lapu City');
      expect(newLoc.active).toBe(true);

      const locations = db.getLocations();
      expect(locations).toHaveLength(3);
      expect(locations[2].name).toBe('Lapu-Lapu City');
    });

    it('should update an existing location active state and name', () => {
      const success = db.updateLocation('LOC-001', { active: false, name: 'Cebu City Updated' });
      expect(success).toBe(true);

      const locations = db.getLocations();
      const updated = locations.find(loc => loc.id === 'LOC-001');
      expect(updated?.active).toBe(false);
      expect(updated?.name).toBe('Cebu City Updated');
    });

    it('should delete a location', () => {
      const success = db.deleteLocation('LOC-001');
      expect(success).toBe(true);

      const locations = db.getLocations();
      expect(locations).toHaveLength(1);
      expect(locations[0].id).toBe('LOC-002');
    });
  });

  describe('API Route Handler Integration Tests', () => {
    it('GET should return operation locations list', async () => {
      const response = await GET();
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(2);
    });

    it('POST should add new location', async () => {
      const req = new Request('http://localhost/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Talamban' }),
      });
      const response = await POST(req);
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBe('LOC-003');
      expect(json.data.name).toBe('Talamban');
    });

    it('POST should return 400 validation error for missing name', async () => {
      const req = new Request('http://localhost/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const response = await POST(req);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Name is required');
    });

    it('PATCH should update target location', async () => {
      const req = new Request('http://localhost/api/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'LOC-001', active: false }),
      });
      const response = await PATCH(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);

      const locations = db.getLocations();
      expect(locations[0].active).toBe(false);
    });

    it('DELETE should delete location', async () => {
      const req = new Request('http://localhost/api/locations?id=LOC-001', {
        method: 'DELETE',
      });
      const response = await DELETE(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);

      const locations = db.getLocations();
      expect(locations).toHaveLength(1);
    });
  });
});
