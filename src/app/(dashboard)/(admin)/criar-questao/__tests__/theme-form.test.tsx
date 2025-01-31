import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMutation } from 'convex/react';
import { describe, expect, test, vi } from 'vitest';

import { ThemeForm } from '../theme-form';

vi.mock('convex/react', () => ({
  useQuery: vi.fn(query => {
    if (query === 'api.themes.list') {
      return [
        { _id: '1', name: 'Theme 1', subthemeCount: 2 },
        { _id: '2', name: 'Theme 2', subthemeCount: 3 },
      ];
    }
    if (query === 'api.themes.getWithSubthemes') {
      return {
        theme: { _id: '1', name: 'Theme 1', subthemeCount: 2 },
        subthemes: [
          { _id: 'sub1', name: 'Subtheme 1' },
          { _id: 'sub2', name: 'Subtheme 2' },
        ],
      };
    }
    return;
  }),
  useMutation: vi.fn(() => vi.fn()),
}));

describe('ThemeForm', () => {
  test('renders theme creation form', () => {
    render(<ThemeForm />);
    expect(screen.getByLabelText('Nome do Tema')).toBeInTheDocument();
    expect(screen.getByText('Criar Tema')).toBeInTheDocument();
  });

  test('shows subthemes when showSubthemes prop is true', () => {
    render(<ThemeForm showSubthemes />);
    expect(screen.getByText('Theme 1')).toBeInTheDocument();
    expect(screen.getByText('Theme 2')).toBeInTheDocument();
  });

  test('displays subthemes when theme is selected', async () => {
    render(<ThemeForm showSubthemes />);
    await userEvent.click(screen.getByText('Theme 1'));
    expect(screen.getByText('Subtemas de Theme 1')).toBeInTheDocument();
    expect(screen.getByText('Subtheme 1')).toBeInTheDocument();
    expect(screen.getByText('Subtheme 2')).toBeInTheDocument();
  });

  test('validates theme name input', async () => {
    render(<ThemeForm />);
    const input = screen.getByLabelText('Nome do Tema');
    await userEvent.type(input, 'ab');
    await userEvent.tab();
    expect(screen.getByText('Mínimo de 3 caracteres')).toBeInTheDocument();
  });

  test('handles theme creation submission', async () => {
    const createTheme = vi.fn();
    vi.mocked(useMutation).mockReturnValue(createTheme as any);
    render(<ThemeForm />);
    const input = screen.getByLabelText('Nome do Tema');
    await userEvent.type(input, 'New Theme');
    await userEvent.click(screen.getByText('Criar Tema'));
    expect(createTheme).toHaveBeenCalledWith({ name: 'New Theme' });
  });
});
