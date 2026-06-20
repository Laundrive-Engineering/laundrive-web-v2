// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PartnerDashboard from './page';

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

describe('PartnerDashboard Component TDD Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders loading indicator initially and then statistics from API', async () => {
    localStorage.setItem('partner-code', 'QC-001');

    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        data: { pendingCount: 3, completedTodayCount: 7 }
      })
    });
    global.fetch = fetchMock;

    render(<PartnerDashboard />);

    // Renders header
    expect(screen.getByText('Partner Dashboard')).toBeDefined();

    // Renders the stats after load
    await waitFor(() => {
      expect(screen.getByText('3')).toBeDefined(); // Pending Orders count
      expect(screen.getByText('7')).toBeDefined(); // Completed Today count
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/partner/stats?partnerCode=QC-001');
  });
});
