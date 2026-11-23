import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react'
import { api, type ChaosFlags } from '../api/client'

/**
 * ChaosContext: подписывается на GET /api/test/flags (poll 2 с) и применяет
 * «нечестные» эффекты: убегающие кнопки, исчезающие элементы, принудительный
 * re-render и медленные картинки. В обычном режиме всё выключено — флаги = 0.
 */

const ChaosContext = createContext<ChaosFlags | null>(null)

export function useChaos(): ChaosFlags | null {
  return useContext(ChaosContext)
}

export function ChaosProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<ChaosFlags | null>(null)
  const [, forceRender] = useReducer((x: number) => x + 1, 0)

  useEffect(() => {
    let alive = true
    const load = () => {
      api
        .get<ChaosFlags>('/api/test/flags')
        .then((f) => {
          if (alive) setFlags(f)
        })
        .catch(() => {})
    }
    void load()
    const t = setInterval(load, 2000)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [])

  // Принудительный re-render всего дерева (ловим клик «между» рендерами).
  useEffect(() => {
    const ms = flags?.rerenderMs ?? 0
    if (ms <= 0) return
    const t = setInterval(() => forceRender(), ms)
    return () => clearInterval(t)
  }, [flags?.rerenderMs])

  // Кнопки «убегают» от курсора.
  useEffect(() => {
    if (!flags?.movingButtons) return
    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('button, .btn')
      if (!(el instanceof HTMLElement)) return
      const dx = Math.round((Math.random() - 0.5) * 140)
      const dy = Math.round((Math.random() - 0.5) * 70)
      el.style.transition = 'transform 0.15s ease'
      el.style.transform = `translate(${dx}px, ${dy}px)`
      setTimeout(() => {
        el.style.transform = ''
      }, 700)
    }
    document.addEventListener('mouseover', onOver)
    return () => document.removeEventListener('mouseover', onOver)
  }, [flags?.movingButtons])

  // Элементы с data-chaos="vanish" исчезают через vanishMs после появления.
  useEffect(() => {
    const ms = flags?.vanishMs ?? 0
    if (ms <= 0) return
    const hide = (el: Element) => {
      setTimeout(() => {
        ;(el as HTMLElement).style.visibility = 'hidden'
      }, ms)
    }
    document.querySelectorAll('[data-chaos="vanish"]').forEach(hide)
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node instanceof HTMLElement) {
            if (node.dataset.chaos === 'vanish') hide(node)
            node.querySelectorAll?.('[data-chaos="vanish"]')?.forEach(hide)
          }
        }
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [flags?.vanishMs])

  return <ChaosContext.Provider value={flags}>{children}</ChaosContext.Provider>
}
