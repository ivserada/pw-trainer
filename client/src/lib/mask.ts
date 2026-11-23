/** Простые маски ввода для форм. */

export function maskPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^8/, '7').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 1) return `+${digits}`
  const p1 = digits.slice(1, 4)
  const p2 = digits.slice(4, 7)
  const p3 = digits.slice(7, 9)
  const p4 = digits.slice(9, 11)
  let out = `+7 (${p1}`
  if (digits.length > 4) out += `) ${p2}`
  if (digits.length > 7) out += `-${p3}`
  if (digits.length > 9) out += `-${p4}`
  return out
}

export function maskCard(raw: string): string {
  return raw
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

export function maskExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

/** Возвращает обработчик onChange, применяющий маску к полю. */
export function maskedSetter(
  apply: (raw: string) => string,
  setValue: (value: string) => void,
): (e: { target: { value: string } }) => void {
  return (e) => setValue(apply(e.target.value))
}
