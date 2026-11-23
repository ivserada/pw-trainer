import { useState, type DragEvent, type FormEvent } from 'react'
import { ApiError, api } from '../../api/client'

/**
 * 🔴 /practice/upload — загрузка и скачивание файлов с ограничениями.
 */
interface UploadedFile {
  id: string
  filename: string
  mime: string
  size: number
}

export function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const upload = async (file: File) => {
    setBusy(true)
    setError(null)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await api.postForm<{ file: UploadedFile }>('/api/files/upload', fd)
      setFiles((prev) => [...prev, res.file])
    } catch (e) {
      setError(
        e instanceof ApiError
          ? (e.data.message as string)
          : e instanceof Error
            ? e.message
            : 'Ошибка загрузки',
      )
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const input = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement
    const file = input.files?.[0]
    if (file) void upload(file)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void upload(file)
  }

  return (
    <div className="page page--narrow">
      <h1>🔴 Upload и download</h1>
      <p className="muted">
        Лимиты: максимум 1 МБ, типы png / jpg / pdf / txt. В тестах: <code>setInputFiles()</code> и{' '}
        <code>page.waitForEvent('download')</code>.
      </p>

      {error ? (
        <p role="alert" className="error-text" data-testid="upload-error">
          {error}
        </p>
      ) : null}

      <form
        className="card card--pad-lg stack"
        onSubmit={(e) => void onSubmit(e)}
        data-testid="upload-form"
      >
        <div className="field">
          <label htmlFor="file-input">Выбор файла</label>
          <input id="file-input" type="file" className="input" data-testid="file-input" />
        </div>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={busy}
          data-testid="upload-button"
        >
          {busy ? 'Загрузка…' : 'Загрузить'}
        </button>
      </form>

      <div
        className="card card--pad-lg"
        style={{
          marginTop: '1rem',
          border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border-strong)'}`,
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        data-testid="drop-zone"
      >
        Или перетащите файл сюда (drag&drop upload)
      </div>

      <section
        className="card card--pad-lg"
        style={{ marginTop: '1rem' }}
        aria-label="Загруженные файлы"
      >
        <h2>Загруженные файлы</h2>
        {files.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            Пока пусто
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }} data-testid="uploaded-list">
            {files.map((f) => (
              <li
                key={f.id}
                className="row"
                style={{ justifyContent: 'space-between', padding: '0.35rem 0' }}
              >
                <span>
                  <code>{f.filename}</code>{' '}
                  <span className="muted mono">
                    ({f.mime}, {(f.size / 1024).toFixed(1)} КБ)
                  </span>
                </span>
                <a
                  href={`/api/files/${f.id}/download`}
                  download
                  className="btn btn--outline btn--sm"
                  data-testid={`download-${f.id}`}
                >
                  ⬇ Скачать
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        className="card card--pad-lg"
        style={{ marginTop: '1rem' }}
        aria-label="Скачивание без загрузки"
      >
        <h2>Готовые файлы для скачивания</h2>
        <div className="row">
          <a
            href="/api/orders/o1/invoice"
            download
            className="btn btn--outline"
            data-testid="download-invoice"
          >
            ⬇ Счёт ORD-2026-001 (PDF)
          </a>
        </div>
      </section>
    </div>
  )
}
