const CLASS_PREFIX = 'pe_'

export const appendPrefix = (className: string) => CLASS_PREFIX + className

function gen(name: string, mods?: string | string[] | Record<string, boolean>): string {
  if (!mods) {
    return ''
  }

  if (typeof mods === 'string') {
    return ` ${name}--${mods}`
  }

  if (Array.isArray(mods)) {
    return mods.reduce((ret, item) => ret + gen(name, item), '')
  }

  return Object.keys(mods).reduce((ret, key) => ret + (mods[key] ? gen(name, key) : ''), '')
}

export function createBEM(name: string) {
  name = CLASS_PREFIX + name
  return function (
    el?: string | Record<string, boolean> | string[],
    mods?: string | Record<string, boolean> | string[]
  ): string {
    if (el && typeof el !== 'string') {
      mods = el
      el = ''
    }

    const finalEl = el ? `${name}__${el}` : name
    return `${finalEl}${gen(finalEl, mods)}`
  }
}
