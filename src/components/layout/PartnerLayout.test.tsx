// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import PartnerLayout from './PartnerLayout';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

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

describe('PartnerLayout Component TDD Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders fallback header text when no partner name is set in localStorage', () => {
    render(<PartnerLayout><div>Test Content</div></PartnerLayout>);
    expect(screen.getByText('Laundrive Partner')).toBeDefined();
  });

  it('renders partner name from localStorage when present', () => {
    localStorage.setItem('partner-name', 'Quick Clean');
    render(<PartnerLayout><div>Test Content</div></PartnerLayout>);
    expect(screen.getByText('Quick Clean')).toBeDefined();
  });
});
