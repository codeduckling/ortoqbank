import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { CreateTestForm } from '../create-test-form';

// Mock Convex hooks
vi.mock('convex/react', () => ({
  useQuery: vi.fn(query => {
    if (query === 'api.themes.list') {
      return [
        { _id: '1', name: 'Theme 1', subthemeCount: 2 },
        { _id: '2', name: 'Theme 2', subthemeCount: 3 },
      ];
    }
    if (query === 'api.themes.listAllSubthemes') {
      return [
        { _id: 'sub1', name: 'Subtheme 1', themeId: '1', themeName: 'Theme 1' },
        { _id: 'sub2', name: 'Subtheme 2', themeId: '1', themeName: 'Theme 1' },
        { _id: 'sub3', name: 'Subtheme 3', themeId: '2', themeName: 'Theme 2' },
      ];
    }
    if (query === 'api.questions.getThemeCounts') {
      return { 'Theme 1': 5, 'Theme 2': 3 };
    }
    return [];
  }),
}));

describe('CreateTestForm', () => {
  it('renders form elements correctly', () => {
    render(<CreateTestForm />);

    expect(screen.getByText('Modo')).toBeInTheDocument();
    expect(screen.getByText('Simulado')).toBeInTheDocument();
    expect(screen.getByText('Tutor')).toBeInTheDocument();
    expect(screen.getByText('Temas')).toBeInTheDocument();
  });

  it('displays themes with correct counts', () => {
    render(<CreateTestForm />);

    expect(screen.getByText('Theme 1')).toBeInTheDocument();
    expect(screen.getByText('(5)')).toBeInTheDocument();
    expect(screen.getByText('Theme 2')).toBeInTheDocument();
    expect(screen.getByText('(3)')).toBeInTheDocument();
  });

  it('opens dialog when clicking theme', async () => {
    render(<CreateTestForm />);

    const themeButton = screen.getByText('Theme 1');
    await userEvent.click(themeButton);

    expect(screen.getByText('Subtemas de Theme 1')).toBeInTheDocument();
    expect(screen.getByText('Subtheme 1')).toBeInTheDocument();
    expect(screen.getByText('Subtheme 2')).toBeInTheDocument();
  });

  it('handles subtheme selection', async () => {
    render(<CreateTestForm />);

    // Open dialog
    await userEvent.click(screen.getByText('Theme 1'));

    // Select subtheme
    const checkbox = screen.getByLabelText('Subtheme 1');
    await userEvent.click(checkbox);

    // Check if selection is displayed
    expect(screen.getByText('1 selecionados')).toBeInTheDocument();
  });

  it('removes theme when no subthemes are selected', async () => {
    render(<CreateTestForm />);

    // Open dialog and close it without selecting
    await userEvent.click(screen.getByText('Theme 1'));
    await userEvent.click(screen.getByRole('button', { name: /close/i }));

    // Theme should not be selected
    const themeButton = screen.getByText('Theme 1');
    await expect(themeButton).not.toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles between Simulado and Tutor modes', async () => {
    render(<CreateTestForm />);

    const tutorTab = screen.getByRole('tab', { name: 'Tutor' });
    await userEvent.click(tutorTab);

    await expect(tutorTab).toHaveAttribute('aria-selected', 'true');
  });

  it('enables submit button only when selections are made', async () => {
    render(<CreateTestForm />);

    const submitButton = screen.getByText('Gerar Teste');
    await expect(submitButton).toBeDisabled();

    // Make selection
    await userEvent.click(screen.getByText('Theme 1'));
    await userEvent.click(screen.getByLabelText('Subtheme 1'));

    await expect(submitButton).toBeEnabled();
  });
});
