import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, getToken, setToken, type User } from '../api/client'

interface LoginResult {
  user?: User
  requiresOtp?: boolean
  otpToken?: string
}

interface AuthValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  completeOtp: (otpToken: string, code: string) => Promise<User | null>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthValue>({
  user: null,
  loading: false,
  login: async () => ({}),
  completeOtp: async () => null,
  logout: async () => {},
  refresh: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const me = await api.get<User>('/api/auth/me')
      setUser(me)
    } catch {
      setUser(null)
      setToken(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const res = await api.post<{
      user: User
      accessToken?: string
      requiresOtp?: boolean
      otpToken?: string
    }>('/api/auth/login', { email, password })
    if (res.accessToken) {
      setToken(res.accessToken)
      setUser(res.user)
      return { user: res.user }
    }
    return { requiresOtp: res.requiresOtp, otpToken: res.otpToken }
  }, [])

  const completeOtp = useCallback(async (otpToken: string, code: string): Promise<User | null> => {
    const res = await api.post<{ user: User; accessToken: string }>('/api/auth/otp', {
      otpToken,
      code,
    })
    setToken(res.accessToken)
    setUser(res.user)
    return res.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // игнорируем — токен мог уже протухнуть
    }
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, completeOtp, logout, refresh }),
    [user, loading, login, completeOtp, logout, refresh],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  return useContext(AuthContext)
}
