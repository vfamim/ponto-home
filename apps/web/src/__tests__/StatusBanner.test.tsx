import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { StatusBanner } from '@/components/StatusBanner';

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('StatusBanner', () => {
  it('renders success message with green styling', () => {
    renderWithRouter(<StatusBanner message="Sucesso!" type="success" />);
    const el = screen.getByText('Sucesso!');
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('bg-green-100');
  });

  it('renders error message with red styling', () => {
    renderWithRouter(<StatusBanner message="Erro!" type="error" />);
    const el = screen.getByText('Erro!');
    expect(el.className).toContain('bg-red-100');
  });

  it('renders warning message with yellow styling', () => {
    renderWithRouter(<StatusBanner message="Atencao!" type="warning" />);
    const el = screen.getByText('Atencao!');
    expect(el.className).toContain('bg-yellow-100');
  });
});
