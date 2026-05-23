import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Denunciar from './denunciar'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}))

vi.mock('../lib/i18n', () => ({
  default: { t: (key: string) => key, language: 'pt', changeLanguage: vi.fn(), isInitialized: true },
}))

vi.mock('../lib/denuncias', () => ({
  salvarDenuncia: vi.fn(() => Promise.resolve()),
}))

vi.mock('../services/ibge.service', () => ({
  buscarCidadesIBGE: vi.fn(() => Promise.resolve([])),
}))

vi.mock('../services/geocoding.service', () => ({
  buscarEnderecoPorCoordenadas: vi.fn(() => Promise.resolve('Rua Teste')),
}))

const mockUseAuth = vi.hoisted(() => vi.fn())

vi.mock('../lib/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({}),
}))

const defaultProps = {
  loaderData: { cidades: [] },
  params: {},
  matches: [] as any,
} as any

describe('Denunciar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: null })
    localStorage.clear()
  })

  it('deve renderizar o título da página', () => {
    render(<Denunciar {...defaultProps} />)
    expect(screen.getByText('title')).toBeInTheDocument()
  })

  it('deve mostrar as 3 etapas no indicador', () => {
    render(<Denunciar {...defaultProps} />)
    expect(screen.getByText('step.tipo')).toBeInTheDocument()
    expect(screen.getByText('step.relato')).toBeInTheDocument()
    expect(screen.getByText('step.local')).toBeInTheDocument()
  })

  it('deve exibir erro se nenhuma situação for selecionada ao tentar avançar', async () => {
    render(<Denunciar {...defaultProps} />)

    fireEvent.click(screen.getByText('submit.proximo'))

    await waitFor(() => {
      expect(screen.getByText('erro.minTipo')).toBeInTheDocument()
    })
  })

  it('deve permitir navegar entre as etapas quando situação é selecionada', async () => {
    localStorage.setItem('denuncia_situacoes', JSON.stringify([{ tipo: 'fina', relato: '', placa: '' }]))

    render(<Denunciar {...defaultProps} />)

    fireEvent.click(screen.getByText('submit.proximo'))

    await waitFor(() => {
      expect(screen.getByText('relato.title')).toBeInTheDocument()
    })
  })
})
