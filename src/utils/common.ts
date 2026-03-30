export const isObjectKeySame = (a: Record<string, unknown>, b: Record<string, unknown>) => {
  const aKeys = JSON.stringify(Object.keys(a).sort())
  const bKeys = JSON.stringify(Object.keys(b).sort())
  return aKeys === bKeys
}

export const cloneDeep = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data)) as T
}

export const onDevelop = (fn: (...args: unknown[]) => void, self?: unknown, ...args: unknown[]) => {
  if (import.meta.env.DEV) {
    fn.call(self, ...args)
  }
}

export const removeNull = (obj: Record<string, unknown>) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
      delete obj[key]
    }
  })
}
