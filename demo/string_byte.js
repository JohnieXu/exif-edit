const cha1 = 'a';
const cha2 = '好';
const cha3 = '🤣';

const len = 1000 * 100;

const genStr = (cha, len) => {
  return new Array(len).fill(cha).reduce((str, item) => str + item, '')
}

console.log('单字节')
console.log(genStr(cha1, len))

console.log('三字节')
console.log(genStr(cha2, len))

console.log('四字节')
console.log(genStr(cha3, len))
