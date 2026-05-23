import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Planos from './planos'

const mockNavigate = vi.fn()

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}))

const mockUseAuth = vi.fn()
vi.mock('../lib/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('Planos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve redirecionar para /login quando usuário não está logado', () => {
    mockUseAuth.mockReturnValue({ user: null })
    render(<Planos />)
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
  })

  it('deve redirecionar para /admin?tab=planos quando usuário está logado', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: '123', username: 'teste', role: 'user', token: 'abc' },
    })
    render(<Planos />)
    expect(mockNavigate).toHaveBeenCalledWith('/admin?tab=planos', { replace: true })
  })

  it('deve exibir o texto de redirecionamento', () => {
    mockUseAuth.mockReturnValue({ user: null })
    render(<Planos />)
    expect(screen.getByText('redirecting')).toBeInTheDocument()
  })
})
