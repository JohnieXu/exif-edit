export const isObjectKeySame = (a, b) => {
  const _a = JSON.stringify(Object.keys(a).sort())
  const _b = JSON.stringify(Object.keys(b).sort())
  console.log(_a, _b)
  return _a === _b
}

export const cloneDeep = (data) => {
  return JSON.parse(JSON.stringify(data))
}

/**
 * 开发环境执行
 */
export const onDevelop = (fn, self, ...args) => {
  if (process.env.NODE_ENV === 'development') {
    fn.call(self, ...args)
  }
}

/**
 * 移除对象的空值（null, undefiend, ''）
 * @param {Object} obj 数据
 */
export const removeNull = (obj) => {
  Object.keys(obj).forEach(key => {
    if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
      delete obj[key]
    }
  })
}
