/**
 * 给类名拼接前缀
 * @param {String} prefix 前缀
 * @param {String} className 类名
 * @returns 带有前缀的类名
 */

const CLASS_PREFIX = 'pe_'

export const appendPrefix = className => CLASS_PREFIX + className

/**
 * bem helper
 * b() // 'button'
 * b('text') // 'button__text'
 * b({ disabled }) // 'button button--disabled'
 * b('text', { disabled }) // 'button__text button__text--disabled'
 * b(['disabled', 'primary']) // 'button button--disabled button--primary'
 */

function gen (name, mods) {
  if (!mods) {
    return ''
  }

  if (typeof mods === 'string') {
    return ` ${name}--${mods}`
  }

  if (Array.isArray(mods)) {
    return mods.reduce((ret, item) => ret + gen(name, item), '')
  }

  return Object.keys(mods).reduce(
    (ret, key) => ret + (mods[key] ? gen(name, key) : ''),
    ''
  )
}

/**
 * 生成BEM风格类名
 * @param {String} name 组件名称
 * @returns 类名
 */
export function createBEM (name) {
  name = CLASS_PREFIX + name
  return function (el, mods) {
    if (el && typeof el !== 'string') {
      mods = el
      el = ''
    }

    el = el ? `${name}__${el}` : name

    return `${el}${gen(el, mods)}`
  }
}
