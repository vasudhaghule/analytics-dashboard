import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

// Mock the fetch function
global.fetch = jest.fn();

describe('LanguageSwitcher', () => {
  const mockT = jest.fn((key) => key);
  const mockI18n = {
    changeLanguage: jest.fn(),
    language: 'en',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT, i18n: mockI18n });
  });

  it('renders language switcher with current language', () => {
    render(<LanguageSwitcher />);
    
    expect(screen.getByText('settings.language')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('en');
  });

  it('changes language when a new option is selected', async () => {
    render(<LanguageSwitcher />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'es' } });

    await waitFor(() => {
      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('es');
    });
  });

  it('updates user preferences when language changes', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    render(<LanguageSwitcher />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'es' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: 'es' }),
      });
    });
  });

  it('handles API error when updating preferences', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<LanguageSwitcher />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'es' } });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating language preference:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('displays correct language options', () => {
    render(<LanguageSwitcher />);
    
    const select = screen.getByRole('combobox');
    const options = Array.from(select.children);

    expect(options).toHaveLength(2);
    expect(options[0]).toHaveValue('en');
    expect(options[1]).toHaveValue('es');
  });

  it('maintains current language selection after re-render', () => {
    mockI18n.language = 'es';
    render(<LanguageSwitcher />);
    
    expect(screen.getByRole('combobox')).toHaveValue('es');
  });
}); 