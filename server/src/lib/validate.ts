/** Минимальный type-safe валидатор без внешних зависимостей (стиль zod-lite). */

export class ValidationError extends Error {
  constructor(public issues: string[]) {
    super(issues.join('; '))
    this.name = 'ValidationError'
  }
}

type Kind = 'string' | 'email' | 'enum' | 'number' | 'integer' | 'boolean'

class Field<T> {
  optionalFlag = false
  defaultValue: T | undefined
  minLen: number | undefined
  maxLen: number | undefined
  minNum: number | undefined
  maxNum: number | undefined
  integerFlag = false
  enumValues: string[] | undefined
  name = 'поле'

  constructor(private kind: Kind) {}

  integer(): this {
    this.integerFlag = true
    return this
  }

  optional(): this {
    this.optionalFlag = true
    return this
  }

  default(v: T): this {
    this.defaultValue = v
    return this
  }

  /** Для строк — min length, для чисел — min value. */
  min(v: number): this {
    if (this.kind === 'string' || this.kind === 'email') this.minLen = v
    else this.minNum = v
    return this
  }

  max(v: number): this {
    if (this.kind === 'string' || this.kind === 'email') this.maxLen = v
    else this.maxNum = v
    return this
  }

  parse(value: unknown): T {
    if (value === undefined || value === null) {
      if (this.optionalFlag) return undefined as T
      if (this.defaultValue !== undefined) return this.defaultValue
      throw new ValidationError([`${this.name}: поле обязательно`])
    }
    switch (this.kind) {
      case 'string':
      case 'email': {
        if (typeof value !== 'string') throw new ValidationError([`${this.name}: ожидалась строка`])
        if (this.kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          throw new ValidationError([`${this.name}: невалидный email`])
        if (this.minLen !== undefined && value.length < this.minLen)
          throw new ValidationError([`${this.name}: минимум ${this.minLen} символов`])
        if (this.maxLen !== undefined && value.length > this.maxLen)
          throw new ValidationError([`${this.name}: максимум ${this.maxLen} символов`])
        return value as T
      }
      case 'enum': {
        if (!this.enumValues?.includes(value as string))
          throw new ValidationError([
            `${this.name}: недопустимое значение ${JSON.stringify(value)}`,
          ])
        return value as T
      }
      case 'number':
      case 'integer': {
        const n = typeof value === 'string' ? Number(value) : (value as number)
        if (typeof n !== 'number' || Number.isNaN(n))
          throw new ValidationError([`${this.name}: ожидалось число`])
        if ((this.kind === 'integer' || this.integerFlag) && !Number.isInteger(n))
          throw new ValidationError([`${this.name}: ожидалось целое число`])
        if (this.minNum !== undefined && n < this.minNum)
          throw new ValidationError([`${this.name}: минимум ${this.minNum}`])
        if (this.maxNum !== undefined && n > this.maxNum)
          throw new ValidationError([`${this.name}: максимум ${this.maxNum}`])
        return n as T
      }
      case 'boolean': {
        if (typeof value === 'boolean') return value as T
        if (value === 'true' || value === '1') return true as T
        if (value === 'false' || value === '0') return false as T
        throw new ValidationError([`${this.name}: ожидался boolean`])
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Shape = Record<string, Field<any>>

type Infer<T extends Shape> = {
  [K in keyof T]: T[K]['optionalFlag'] extends true
    ? ReturnType<T[K]['parse']> | undefined
    : ReturnType<T[K]['parse']>
}

class ObjectSchema<T extends Shape> {
  constructor(private shape: T) {}

  parse(value: unknown): Infer<T> {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
      throw new ValidationError(['ожидался объект'])
    const input = value as Record<string, unknown>
    const out: Record<string, unknown> = {}
    const issues: string[] = []
    for (const [key, field] of Object.entries(this.shape)) {
      field.name = key
      const v = input[key]
      if (v === undefined && field.optionalFlag) continue
      try {
        out[key] = field.parse(v)
      } catch (e) {
        if (e instanceof ValidationError) issues.push(...e.issues)
        else throw e
      }
    }
    if (issues.length) throw new ValidationError(issues)
    return out as Infer<T>
  }
}

export const z = {
  object: <T extends Shape>(shape: T) => new ObjectSchema(shape),
  string: () => new Field<string>('string'),
  email: () => new Field<string>('email'),
  enum: <Values extends readonly string[]>(values: Values): Field<Values[number]> => {
    const f = new Field<Values[number]>('enum')
    f.enumValues = [...values]
    return f
  },
  number: () => new Field<number>('number'),
  integer: () => new Field<number>('integer'),
  boolean: () => new Field<boolean>('boolean'),
}
