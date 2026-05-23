import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Sucesso from './sucesso'

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: "3rdParty", init: vi.fn() },
}));

const mockUseLocation = vi.fn()
vi.mock('react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useLocation: () => mockUseLocation(),
}))

describe('Sucesso', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar título e mensagem de obrigado quando não há state', () => {
    mockUseLocation.mockReturnValue({ state: null })
    render(<Sucesso />)
    expect(screen.getByText('sucesso.title')).toBeInTheDocument()
    expect(screen.getByText('sucesso.obrigado')).toBeInTheDocument()
  })

  it('deve mostrar resumo das situações quando state possui situacoes', () => {
    mockUseLocation.mockReturnValue({
      state: {
        situacoes: [{ tipo: 'fina', relato: '' }, { tipo: 'ameaca', relato: '' }],
      },
    })
    render(<Sucesso />)
    expect(screen.getByText('sucesso.resumoContagem')).toBeInTheDocument()
    expect(screen.getByText('fina')).toBeInTheDocument()
    expect(screen.getByText('ameaca')).toBeInTheDocument()
  })

  it('deve mostrar placa quando presente no state', () => {
    mockUseLocation.mockReturnValue({
      state: {
        placa: 'ABC1234',
      },
    })
    render(<Sucesso />)
    expect(screen.getByText('ABC1234')).toBeInTheDocument()
  })

  it('deve renderizar links para mapa e home', () => {
    mockUseLocation.mockReturnValue({ state: { situacoes: [{ tipo: 'fina' }] } })
    render(<Sucesso />)
    expect(screen.getByText('sucesso.verNoMapa')).toBeInTheDocument()
    expect(screen.getByText('backToHome')).toBeInTheDocument()
    expect(screen.getByText('sucesso.fazerOutraDenuncia')).toBeInTheDocument()
  })
})
