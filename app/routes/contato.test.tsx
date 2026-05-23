import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Contato from './contato'

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: "3rdParty", init: vi.fn() },
}));

const mockUseAuth = vi.fn()
vi.mock('../lib/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

const mockRegistrarEvento = vi.fn(() => Promise.resolve())
vi.mock('../lib/historico', () => ({
  registrarEvento: (...args: any[]) => mockRegistrarEvento(...args),
}))

// Mock firebase database ref/set (used in the component)
vi.mock('firebase/database', () => ({
  ref: vi.fn(() => ({})),
  set: vi.fn(() => Promise.resolve()),
}))

vi.mock('../lib/firebase', () => ({
  db: {},
}))

const mockNavigate = vi.fn()
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}))

describe('Contato', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: null })
  })

  it('deve renderizar o título do contato', () => {
    render(<Contato />)
    expect(screen.getByText('contato.title')).toBeInTheDocument()
  })

  it('deve mostrar erro ao tentar avançar sem selecionar um tipo', async () => {
    render(<Contato />)

    // Clicar em próximo sem selecionar tipo
    fireEvent.click(screen.getByText('next'))

    await waitFor(() => {
      expect(screen.getByText('contato.erroSelecioneTipo')).toBeInTheDocument()
    })
  })

  it('deve permitir selecionar um tipo de contato e avançar para etapa 2', async () => {
    render(<Contato />)

    // Abrir dropdown de tipos
    fireEvent.click(screen.getByText('contato.selecioneTipo'))

    // Selecionar uma opção
    fireEvent.click(screen.getByText('contato.tipo.sugestao'))

    // Avançar para etapa 2
    fireEvent.click(screen.getByText('next'))

    await waitFor(() => {
      expect(screen.getByText('contato.suaMensagem')).toBeInTheDocument()
    })
  })

  it('deve avançar para etapa 2 e permitir digitar mensagem', async () => {
    render(<Contato />)

    // Selecionar tipo
    fireEvent.click(screen.getByText('contato.selecioneTipo'))
    fireEvent.click(screen.getByText('contato.tipo.duvida'))

    // Avançar
    fireEvent.click(screen.getByText('next'))

    await waitFor(() => {
      expect(screen.getByText('contato.suaMensagem')).toBeInTheDocument()
    })

    // Digitar mensagem
    const textarea = screen.getByPlaceholderText('contato.digiteMensagem')
    fireEvent.change(textarea, { target: { value: 'Minha mensagem de teste' } })

    expect(textarea).toHaveValue('Minha mensagem de teste')
  })
})
