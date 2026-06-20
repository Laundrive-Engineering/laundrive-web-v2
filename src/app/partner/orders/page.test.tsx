// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import OrdersPage from './page';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

describe('OrdersPage Component TDD Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('loads bookings from API and updates status when clicked', async () => {
    localStorage.setItem('partner-code', 'QC-001');

    const bookings = [
      {
        id: 'BKG-555',
        customerId: 'CUST-01',
        customerName: 'Alice Green',
        partnerCode: 'QC-001',
        service: 'Wash & Fold',
        status: 'Pending',
        total: 250.00,
        bookingDate: '2026-06-20'
      }
    ];

    const fetchMock = vi.fn().mockImplementation((url, options) => {
      if (options?.method === 'PATCH') {
        return Promise.resolve({
          json: () => Promise.resolve({ success: true })
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, data: bookings })
      });
    });
    global.fetch = fetchMock;

    render(<OrdersPage />);

    // Renders header
    expect(screen.getByText('Order Management')).toBeDefined();

    // Renders the loaded order details
    await waitFor(() => {
      expect(screen.getByText('BKG-555')).toBeDefined();
      expect(screen.getByText('Alice Green')).toBeDefined();
      expect(screen.getByText('Wash & Fold')).toBeDefined();
      expect(screen.getByText('₱250.00')).toBeDefined();
      expect(screen.getByText('Pending')).toBeDefined();
    });

    // Click "Update" button
    const updateBtn = screen.getByRole('button', { name: 'Update' });
    fireEvent.click(updateBtn);

    // Should display Menu Items for status updates
    expect(screen.getByText('Mark In Laundry')).toBeDefined();

    // Click "Mark In Laundry" menu option
    const inLaundryOption = screen.getByText('Mark In Laundry');
    fireEvent.click(inLaundryOption);

    // Verify PATCH request is sent to update status
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/partner/bookings', expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ id: 'BKG-555', status: 'In Laundry' })
      }));
    });
  });
});
