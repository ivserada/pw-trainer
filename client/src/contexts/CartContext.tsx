import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, type Cart } from '../api/client'

interface CartValue {
  cart: Cart | null
  count: number
  refresh: () => Promise<void>
  add: (productId: string, qty?: number) => Promise<void>
  setQty: (productId: string, qty: number) => Promise<void>
  remove: (productId: string) => Promise<void>
  applyPromo: (code: string) => Promise<void>
}

const CartContext = createContext<CartValue>({
  cart: null,
  count: 0,
  refresh: async () => {},
  add: async () => {},
  setQty: async () => {},
  remove: async () => {},
  applyPromo: async () => {},
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<Cart>('/api/cart')
      setCart(data)
    } catch {
      setCart(null)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const onReset = () => void refresh()
    window.addEventListener('pw:reset', onReset)
    return () => window.removeEventListener('pw:reset', onReset)
  }, [refresh])

  const add = useCallback(
    async (productId: string, qty = 1) => {
      await api.post('/api/cart', { productId, qty })
      await refresh()
    },
    [refresh],
  )
  const setQty = useCallback(
    async (productId: string, qty: number) => {
      await api.patch(`/api/cart/${productId}`, { qty })
      await refresh()
    },
    [refresh],
  )
  const remove = useCallback(
    async (productId: string) => {
      await api.del(`/api/cart/${productId}`)
      await refresh()
    },
    [refresh],
  )
  const applyPromo = useCallback(
    async (code: string) => {
      await api.post('/api/cart/promo', { code })
      await refresh()
    },
    [refresh],
  )

  const count = cart?.items.reduce((sum, it) => sum + it.qty, 0) ?? 0
  const value = useMemo(
    () => ({ cart, count, refresh, add, setQty, remove, applyPromo }),
    [cart, count, refresh, add, setQty, remove, applyPromo],
  )
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartValue {
  return useContext(CartContext)
}
