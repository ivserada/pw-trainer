import { useState, type FormEvent } from 'react'

/**
 * 🟢 /practice/forms — все типы input с валидацией и aria-invalid.
 * Текст страницы намеренно русский: это учебный материал, как документация.
 */
export function FormsPage() {
  const [summary, setSummary] = useState<string[]>([])
  const [ok, setOk] = useState(false)

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const issues: string[] = []
    const setInvalid = (name: string, bad: boolean) => {
      const el = e.currentTarget.querySelector(`[name="${name}"]`)
      if (el) el.setAttribute('aria-invalid', bad ? 'true' : 'false')
      if (bad) issues.push(name)
    }
    setInvalid('username', String(fd.get('username') ?? '').trim().length < 3)
    setInvalid('email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(fd.get('email') ?? '')))
    setInvalid(
      'age',
      (() => {
        const n = Number(fd.get('age'))
        return Number.isNaN(n) || n < 18 || n > 120
      })(),
    )
    setInvalid('website', !/^https?:\/\/.+\..+/.test(String(fd.get('website') ?? '')))
    setInvalid('bio', String(fd.get('bio') ?? '').trim().length < 10)
    setSummary(issues)
    setOk(issues.length === 0)
  }

  return (
    <div className="page page--narrow">
      <h1>🟢 Формы: все типы input</h1>
      <p className="muted">
        Форма ниже содержит поля всех основных типов. Кнопка «Проверить» валидирует значения и
        выставляет <code>aria-invalid</code> на проблемных полях.
      </p>

      <form
        className="card card--pad-lg"
        onSubmit={onSubmit}
        data-testid="all-types-form"
        noValidate
      >
        <div className="field">
          <label htmlFor="pf-username">Имя пользователя (text, min 3)</label>
          <input
            id="pf-username"
            name="username"
            type="text"
            className="input"
            placeholder="например, tester"
            data-testid="pf-username"
          />
        </div>
        <div className="field">
          <label htmlFor="pf-email">Email (email)</label>
          <input
            id="pf-email"
            name="email"
            type="email"
            className="input"
            placeholder="you@example.com"
            data-testid="pf-email"
          />
        </div>
        <div className="field">
          <label htmlFor="pf-password">Пароль (password)</label>
          <input
            id="pf-password"
            name="password"
            type="password"
            className="input"
            autoComplete="new-password"
            data-testid="pf-password"
          />
        </div>
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div className="field" style={{ flex: 1, minWidth: '130px' }}>
            <label htmlFor="pf-age">Возраст (number, 18–120)</label>
            <input
              id="pf-age"
              name="age"
              type="number"
              className="input"
              min={18}
              max={120}
              placeholder="25"
              data-testid="pf-age"
            />
          </div>
          <div className="field" style={{ flex: 1, minWidth: '130px' }}>
            <label htmlFor="pf-birth">Дата рождения (date)</label>
            <input
              id="pf-birth"
              name="birth"
              type="date"
              className="input"
              data-testid="pf-birth"
            />
          </div>
          <div className="field" style={{ flex: 1, minWidth: '130px' }}>
            <label htmlFor="pf-alarm">Время звонка (time)</label>
            <input
              id="pf-alarm"
              name="alarm"
              type="time"
              className="input"
              data-testid="pf-alarm"
            />
          </div>
        </div>
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div className="field" style={{ flex: 1, minWidth: '160px' }}>
            <label htmlFor="pf-phone">Телефон (tel)</label>
            <input
              id="pf-phone"
              name="phone"
              type="tel"
              className="input"
              placeholder="+7 900 000-00-00"
              data-testid="pf-phone"
            />
          </div>
          <div className="field" style={{ flex: 1, minWidth: '160px' }}>
            <label htmlFor="pf-site">Сайт (url)</label>
            <input
              id="pf-site"
              name="website"
              type="url"
              className="input"
              placeholder="https://example.com"
              data-testid="pf-website"
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="pf-city">Город (select)</label>
          <select id="pf-city" name="city" className="select" data-testid="pf-city">
            <option value="">— выберите —</option>
            <option value="msk">Москва</option>
            <option value="spb">Санкт-Петербург</option>
            <option value="nsk">Новосибирск</option>
            <option value="tvr">Тверь</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="pf-city2">Страна (select multiple, Ctrl/⌘ для нескольких)</label>
          <select
            id="pf-city2"
            name="countries"
            className="select"
            multiple
            size={4}
            data-testid="pf-countries"
          >
            <option value="ru">Россия</option>
            <option value="by">Беларусь</option>
            <option value="kz">Казахстан</option>
            <option value="am">Армения</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="pf-browser">Браузер (select с datalist)</label>
          <input
            id="pf-browser"
            name="browser"
            className="input"
            list="browsers"
            placeholder="Chromium"
            data-testid="pf-browser"
          />
          <datalist id="browsers">
            <option value="Chromium" />
            <option value="Firefox" />
            <option value="WebKit" />
          </datalist>
        </div>
        <div className="field">
          <label htmlFor="pf-volume">Громкость (range)</label>
          <input
            id="pf-volume"
            name="volume"
            type="range"
            min={0}
            max={10}
            defaultValue={5}
            data-testid="pf-volume"
          />
        </div>
        <div className="field">
          <label htmlFor="pf-color">Любимый цвет (color)</label>
          <input
            id="pf-color"
            name="color"
            type="color"
            defaultValue="#7c3aed"
            data-testid="pf-color"
          />
        </div>
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div className="field" style={{ flex: 1, minWidth: '160px' }}>
            <label htmlFor="pf-month">Месяц подписки (month)</label>
            <input
              id="pf-month"
              name="month"
              type="month"
              className="input"
              data-testid="pf-month"
            />
          </div>
          <div className="field" style={{ flex: 1, minWidth: '160px' }}>
            <label htmlFor="pf-week">Неделя отпуска (week)</label>
            <input id="pf-week" name="week" type="week" className="input" data-testid="pf-week" />
          </div>
        </div>
        <fieldset
          style={{ border: '1px solid var(--border)', borderRadius: 8, margin: '0 0 1rem' }}
        >
          <legend>Уведомления (checkbox)</legend>
          <div className="checkbox-row">
            <input
              id="pf-n1"
              type="checkbox"
              name="notify"
              value="email"
              data-testid="pf-notify-email"
            />
            <label htmlFor="pf-n1">По email</label>
          </div>
          <div className="checkbox-row">
            <input
              id="pf-n2"
              type="checkbox"
              name="notify"
              value="sms"
              data-testid="pf-notify-sms"
            />
            <label htmlFor="pf-n2">По SMS</label>
          </div>
        </fieldset>
        <fieldset
          style={{ border: '1px solid var(--border)', borderRadius: 8, margin: '0 0 1rem' }}
        >
          <legend>Опыт автоматизации (radio)</legend>
          <div className="radio-row">
            <input
              id="pf-r1"
              type="radio"
              name="level"
              value="junior"
              data-testid="pf-level-junior"
            />
            <label htmlFor="pf-r1">Junior</label>
          </div>
          <div className="radio-row">
            <input
              id="pf-r2"
              type="radio"
              name="level"
              value="middle"
              defaultChecked
              data-testid="pf-level-middle"
            />
            <label htmlFor="pf-r2">Middle</label>
          </div>
          <div className="radio-row">
            <input
              id="pf-r3"
              type="radio"
              name="level"
              value="senior"
              data-testid="pf-level-senior"
            />
            <label htmlFor="pf-r3">Senior</label>
          </div>
        </fieldset>
        <div className="field">
          <label htmlFor="pf-search">Поиск (search)</label>
          <input
            id="pf-search"
            name="search"
            type="search"
            className="input"
            placeholder="поиск по форме"
            data-testid="pf-search"
          />
        </div>
        <div className="field">
          <label htmlFor="pf-bio">О себе (textarea, min 10 символов)</label>
          <textarea
            id="pf-bio"
            name="bio"
            className="textarea"
            rows={3}
            placeholder="Расскажите, чем занимаетесь"
            data-testid="pf-bio"
          />
        </div>
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div className="field" style={{ flex: 1, minWidth: '160px' }}>
            <label htmlFor="pf-file">Резюме (file)</label>
            <input id="pf-file" name="resume" type="file" className="input" data-testid="pf-file" />
          </div>
          <div className="field" style={{ flex: 1, minWidth: '160px' }}>
            <label htmlFor="pf-secret">Токен (disabled — не заполняется)</label>
            <input
              id="pf-secret"
              type="text"
              className="input"
              disabled
              value="auto-filled"
              data-testid="pf-disabled"
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="pf-ro">Логин (readonly)</label>
          <input
            id="pf-ro"
            type="text"
            className="input"
            readOnly
            value="readonly-user"
            data-testid="pf-readonly"
          />
        </div>
        <input type="hidden" name="csrf" value="practice-token" data-testid="pf-hidden" />

        <button type="submit" className="btn btn--primary" data-testid="pf-submit">
          Проверить форму
        </button>
      </form>

      {summary.length > 0 ? (
        <div className="card" role="alert" data-testid="form-issues" style={{ marginTop: '1rem' }}>
          <strong>Проблемные поля:</strong>
          <ul style={{ margin: '0.4rem 0 0' }}>
            {summary.map((s) => (
              <li key={s}>
                <code>{s}</code>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {ok ? (
        <p
          className="badge badge--success"
          role="status"
          data-testid="form-ok"
          style={{ marginTop: '1rem' }}
        >
          Форма валидна ✅
        </p>
      ) : null}
    </div>
  )
}
