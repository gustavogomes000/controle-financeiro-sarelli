import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ---- mocks ----------------------------------------------------------------
vi.mock('@/components/AppLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() }, Toaster: () => null }));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'u1' } as any,
    usuario: { id: 'usr-1', auth_user_id: 'u1', nome: 'João', tipo: 'lancador' },
    loading: false,
    isAdmin: false,
    signInByNome: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock('@/components/UserSelect', () => ({
  default: () => <div data-testid="user-select" />,
}));

const mockFrom = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: (...args: any[]) => mockFrom(...args) },
}));
// ---------------------------------------------------------------------------

import NovaContaPage from '@/pages/NovaContaPage';
import { toast } from 'sonner';

const renderPage = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <NovaContaPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

const setupSupabaseSuccess = () => {
  const contaChain: any = {
    insert: vi.fn(() => contaChain),
    select: vi.fn(() => contaChain),
    single: vi.fn(() => Promise.resolve({ data: { id: 'new-id' }, error: null })),
  };
  const logChain: any = {
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
  };
  mockFrom.mockImplementation((table: string) => {
    if (table === 'contas_pagar') return contaChain;
    return logChain;
  });
  return { contaChain };
};

describe('NovaContaPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renderiza o título "Nova conta"', () => {
    renderPage();
    expect(screen.getByText('Nova conta')).toBeInTheDocument();
  });

  it('renderiza passo 1 com label correto', () => {
    renderPage();
    expect(screen.getByText(/Passo 1 de 2/)).toBeInTheDocument();
  });

  it('renderiza campo de descrição', () => {
    renderPage();
    expect(screen.getByPlaceholderText(/aluguel, material de escritório/i)).toBeInTheDocument();
  });

  it('renderiza campo Valor', () => {
    renderPage();
    expect(screen.getByPlaceholderText('0,00')).toBeInTheDocument();
  });

  it('renderiza campo de Vencimento', () => {
    renderPage();
    expect(document.querySelector('input[type="date"]')).toBeInTheDocument();
  });

  it('renderiza campo Chave PIX opcional', () => {
    renderPage();
    expect(screen.getByPlaceholderText(/CPF, e-mail, telefone ou chave aleatória/i)).toBeInTheDocument();
  });

  it('renderiza botão "Continuar"', () => {
    renderPage();
    expect(screen.getByText(/Continuar/)).toBeInTheDocument();
  });

  it('exibe erro quando descrição está vazia ao continuar', async () => {
    renderPage();
    fireEvent.click(screen.getByText(/Continuar/));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalled(),
    );
  });

  it('avança para passo 2 com dados válidos', async () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/aluguel, material de escritório/i), {
      target: { value: 'Energia elétrica' },
    });
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '200,00' } });
    const dateInput = document.querySelector('input[type="date"]')!;
    fireEvent.change(dateInput, { target: { value: '2026-05-01' } });
    fireEvent.click(screen.getByText(/Continuar/));

    await waitFor(() => expect(screen.getByText(/Passo 2 de 2/)).toBeInTheDocument());
  });

  it('passo 2 renderiza campo de motivo', async () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/aluguel, material de escritório/i), {
      target: { value: 'Energia' },
    });
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '100,00' } });
    const dateInput = document.querySelector('input[type="date"]')!;
    fireEvent.change(dateInput, { target: { value: '2026-05-01' } });
    fireEvent.click(screen.getByText(/Continuar/));

    await waitFor(() => expect(screen.getByPlaceholderText(/Aluguel do mês/i)).toBeInTheDocument());
  });

  it('passo 2 renderiza resumo com valor', async () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/aluguel, material de escritório/i), {
      target: { value: 'Combustível' },
    });
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '350,00' } });
    const dateInput = document.querySelector('input[type="date"]')!;
    fireEvent.change(dateInput, { target: { value: '2026-05-01' } });
    fireEvent.click(screen.getByText(/Continuar/));

    await waitFor(() => expect(screen.getByText('Resumo')).toBeInTheDocument());
  });

  it('submit válido chama supabase.insert e navega para /', async () => {
    const { contaChain } = setupSupabaseSuccess();
    renderPage();

    // Step 1
    fireEvent.change(screen.getByPlaceholderText(/aluguel, material de escritório/i), {
      target: { value: 'Combustível equipe' },
    });
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '350,00' } });
    const dateInput = document.querySelector('input[type="date"]')!;
    fireEvent.change(dateInput, { target: { value: '2026-05-01' } });
    fireEvent.click(screen.getByText(/Continuar/));

    // Step 2
    await waitFor(() => expect(screen.getByPlaceholderText(/Aluguel do mês/i)).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText(/Aluguel do mês/i), {
      target: { value: 'Deslocamento da equipe' },
    });
    fireEvent.click(screen.getByText(/Registrar conta/));

    await waitFor(() => expect(contaChain.insert).toHaveBeenCalled());
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('botão de voltar (seta) no passo 1 navega de volta', () => {
    renderPage();
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
