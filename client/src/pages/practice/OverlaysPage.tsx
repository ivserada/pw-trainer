import { useState } from 'react'
import { Drawer, Modal } from '../../components/overlays'
import { useToast } from '../../components/ui'

/**
 * 🟡 /practice/overlays — модалки, drawer, toast, нативные alert/confirm/prompt.
 */
export function OverlaysPage() {
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [nativeResult, setNativeResult] = useState<string>('—')

  return (
    <div className="page page--narrow">
      <h1>🟡 Оверлеи</h1>
      <p className="muted">
        Модальное окно, drawer, toast-уведомления и нативные диалоги (page.on('dialog')).
      </p>

      <section className="card card--pad-lg stack" data-testid="overlays-custom">
        <h2>Кастомные оверлеи</h2>
        <div className="row">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setModalOpen(true)}
            data-testid="open-modal"
          >
            Открыть модалку
          </button>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => setDrawerOpen(true)}
            data-testid="open-drawer"
          >
            Открыть drawer
          </button>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => toast('info', 'Обычное уведомление')}
            data-testid="toast-info"
          >
            Toast: info
          </button>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => toast('error', 'Что-то пошло не так')}
            data-testid="toast-error"
          >
            Toast: error
          </button>
        </div>
      </section>

      <section
        className="card card--pad-lg stack"
        style={{ marginTop: '1rem' }}
        data-testid="overlays-native"
      >
        <h2>Нативные диалоги</h2>
        <div className="row">
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => {
              alert('Привет! Это нативный alert.')
              setNativeResult('alert показан и закрыт')
            }}
            data-testid="native-alert"
          >
            alert()
          </button>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => {
              const ok = confirm('Удалить элемент безвозвратно?')
              setNativeResult(ok ? 'confirm: OK' : 'confirm: Отмена')
            }}
            data-testid="native-confirm"
          >
            confirm()
          </button>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => {
              const name = prompt('Как вас зовут?', 'Иван')
              setNativeResult(name === null ? 'prompt: отменено' : `prompt: ${name}`)
            }}
            data-testid="native-prompt"
          >
            prompt()
          </button>
        </div>
        <p aria-live="polite" data-testid="native-result">
          Результат: <strong>{nativeResult}</strong>
        </p>
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Пример модального окна"
        testId="demo-modal"
      >
        <p>
          Контент модалки. Закрывается крестиком, кликом по оверлею или клавишей <kbd>Esc</kbd>.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setModalOpen(false)
            toast('success', 'Форма из модалки отправлена')
          }}
        >
          <div className="field">
            <label htmlFor="modal-name">Имя в модалке</label>
            <input id="modal-name" className="input" required data-testid="modal-name" />
          </div>
          <button type="submit" className="btn btn--primary" data-testid="modal-submit">
            Отправить из модалки
          </button>
        </form>
      </Modal>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Пример drawer"
        testId="demo-drawer"
      >
        <p>
          Drawer выезжает справа. Тот же принцип, что у модалки: <kbd>Esc</kbd> и клик по оверлею
          закрывают панель.
        </p>
        <ul>
          <li>Пунт меню 1</li>
          <li>Пунт меню 2</li>
          <li>Пунт меню 3</li>
        </ul>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            setDrawerOpen(false)
            toast('success', 'Действие из drawer выполнено')
          }}
          data-testid="drawer-action"
        >
          Действие из drawer
        </button>
      </Drawer>
    </div>
  )
}
