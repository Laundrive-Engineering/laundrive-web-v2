import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as db from '../../../utils/partnersDb';
import { GET as getProducts } from './[code]/products/route';

const testDbPath = path.join(process.cwd(), 'src/data/partners.test.json');

describe('Partners TDD Test Suite', () => {
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

  describe('Database and Model Operations', () => {
    it('should retrieve partners with thumbnail, services, and branches', () => {
      const partners = db.getPartners();
      expect(partners.length).toBeGreaterThan(0);
      
      const qc = partners.find(p => p.partnerCode === 'QC-001');
      expect(qc).toBeDefined();
      expect(qc?.thumbnail).toBeDefined();
      expect(qc?.services).toBeDefined();
      expect(qc?.services?.length).toBeGreaterThan(0);
      expect(qc?.branches).toBeDefined();
      expect(qc?.branches?.length).toBeGreaterThan(0);
    });

    it('should update partner thumbnail, services, and branches', () => {
      const partners = db.getPartners();
      const qc = partners.find(p => p.partnerCode === 'QC-001')!;

      const updatedServices = [
        ...qc.services || [],
        { id: 'SRV-TEST', name: 'Test Extra Service', price: 99.00, unit: 'per pc' }
      ];

      const success = db.updatePartner(qc.id, {
        thumbnail: 'http://new-thumbnail.png',
        services: updatedServices
      });

      expect(success).toBe(true);

      const refreshed = db.getPartners().find(p => p.partnerCode === 'QC-001')!;
      expect(refreshed.thumbnail).toBe('http://new-thumbnail.png');
      expect(refreshed.services?.find(s => s.id === 'SRV-TEST')).toBeDefined();
    });

    it('should allow toggling offered services in a branch', () => {
      const partners = db.getPartners();
      const qc = partners.find(p => p.partnerCode === 'QC-001')!;
      const branches = qc.branches || [];
      expect(branches.length).toBeGreaterThan(0);

      // Disable 'SRV-002' for the first branch
      const firstBranch = branches[0];
      const updatedOfferedServices = firstBranch.offeredServices.filter(id => id !== 'SRV-002');

      const updatedBranches = branches.map(b => 
        b.id === firstBranch.id ? { ...b, offeredServices: updatedOfferedServices } : b
      );

      const success = db.updatePartner(qc.id, { branches: updatedBranches });
      expect(success).toBe(true);

      const refreshed = db.getPartners().find(p => p.partnerCode === 'QC-001')!;
      expect(refreshed.branches![0].offeredServices).not.toContain('SRV-002');
    });
  });

  describe('Dynamic Products API Endpoint GET /[code]/products', () => {
    it('should dynamically fetch products (services) from database', async () => {
      // Fetch dynamic products for QC-001
      const req = new Request('http://localhost/api/partners/QC-001/products');
      const response = await getProducts(req, {
        params: Promise.resolve({ code: 'QC-001' })
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);

      // Verify the structure of returned product matches database services
      const firstProduct = json.data[0];
      expect(firstProduct.id).toBeDefined();
      expect(firstProduct.name).toBeDefined();
      expect(firstProduct.price).toBeDefined();
    });

    it('should return 404 if partner has no services or not found', async () => {
      const req = new Request('http://localhost/api/partners/NONEXISTENT/products');
      const response = await getProducts(req, {
        params: Promise.resolve({ code: 'NONEXISTENT' })
      });

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Partner or products not found');
    });
  });
});
