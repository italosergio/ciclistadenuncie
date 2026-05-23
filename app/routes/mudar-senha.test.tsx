import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MudarSenha from './mudar-senha'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

const mockUseAuth = vi.fn()
vi.mock('../lib/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('../components/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const mockChangePassword = vi.fn(() => Promise.resolve())
vi.mock('../lib/auth', () => ({
  changePassword: (...args: any[]) => mockChangePassword(...args),
}))

const mockNavigate = vi.fn()
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}))

// Helper to fill password inputs by their position in the form
function fillInput(container: HTMLElement, index: number, value: string) {
  const inputs = container.querySelectorAll('input')
  fireEvent.change(inputs[index], { target: { value } })
}

describe('MudarSenha', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: { uid: '123', username: 'teste', role: 'user', token: 'abc' },
    })
  })

  it('deve renderizar campos de senha', () => {
    const { container } = render(<MudarSenha />)
    expect(screen.getByText('mudarSenha.h1')).toBeInTheDocument()
    expect(screen.getByText('mudarSenha.senhaAtual')).toBeInTheDocument()
    expect(screen.getByText('mudarSenha.novaSenha')).toBeInTheDocument()
    expect(screen.getByText('mudarSenha.confirmarNovaSenha')).toBeInTheDocument()
    expect(screen.getByText('mudarSenha.button')).toBeInTheDocument()
    // Verify 3 password inputs exist
    expect(container.querySelectorAll('input').length).toBe(3)
  })

  it('deve exibir erro quando senhas não conferem', async () => {
    const { container } = render(<MudarSenha />)

    // Fill fields using their index in the form
    fillInput(container, 0, 'old123')
    fillInput(container, 1, 'new123')
    fillInput(container, 2, 'new456')

    fireEvent.submit(screen.getByRole('button', { name: 'mudarSenha.button' }))

    await waitFor(() => {
      expect(screen.getByText('erro.senhasDiferem')).toBeInTheDocument()
    })
  })

  it('deve exibir erro quando senha é muito curta', async () => {
    const { container } = render(<MudarSenha />)

    fillInput(container, 0, 'old123')
    fillInput(container, 1, 'abc')
    fillInput(container, 2, 'abc')

    fireEvent.submit(screen.getByRole('button', { name: 'mudarSenha.button' }))

    await waitFor(() => {
      expect(screen.getByText('erro.senhaCurta')).toBeInTheDocument()
    })
  })

  it('deve chamar changePassword e navegar para /admin no submit bem-sucedido', async () => {
    mockChangePassword.mockResolvedValue(undefined)
    const { container } = render(<MudarSenha />)

    fillInput(container, 0, 'old123')
    fillInput(container, 1, 'newpass123')
    fillInput(container, 2, 'newpass123')

    fireEvent.submit(screen.getByRole('button', { name: 'mudarSenha.button' }))

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith('old123', 'newpass123')
      expect(mockNavigate).toHaveBeenCalledWith('/admin')
    })
  })

  it('deve exibir erro quando senha atual está incorreta', async () => {
    mockChangePassword.mockRejectedValue({
      code: 'auth/invalid-credential',
      message: 'Senha incorreta',
    })
    const { container } = render(<MudarSenha />)

    fillInput(container, 0, 'wrong')
    fillInput(container, 1, 'newpass123')
    fillInput(container, 2, 'newpass123')

    fireEvent.submit(screen.getByRole('button', { name: 'mudarSenha.button' }))

    await waitFor(() => {
      expect(screen.getByText('mudarSenha.erroIncorreta')).toBeInTheDocument()
    })
  })
})
