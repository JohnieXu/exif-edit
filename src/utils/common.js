export const isObjectKeySame = (a, b) => {
  const _a = JSON.stringify(Object.keys(a).sort())
  const _b = JSON.stringify(Object.keys(b).sort())
  console.log(_a, _b)
  return _a === _b
}

export const cloneDeep = (data) => {
  return JSON.parse(JSON.stringify(data))
}
