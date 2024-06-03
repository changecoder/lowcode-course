let guid = Date.now()
export function uniqueId(prefix = '') {
  return `${prefix}${(guid++).toString(36).toLowerCase()}`
}

export const PublicEnumTransformStage = {
  Render: 'render',
  Serilize: 'serilize',
  Save: 'save',
  Clone: 'clone',
  Init: 'init',
  Upgrade: 'upgrade'
}

export function isObject(value) {
  return value !== null && typeof value === 'object'
}

export function isProCodeComponentType(desc) {
  if (!isObject(desc)) {
    return false
  }

  return 'package' in desc
}

export function isLowCodeComponentType(desc) {
  return !isProCodeComponentType(desc)
}

const stageList = [
  'render',
  'serilize',
  'save',
  'clone',
  'init',
  'upgrade'
]

/**
 * 兼容原来的数字版本的枚举对象
 * @param stage
 * @returns
 */
export function compatStage(stage) {
  if (typeof stage === 'number') {
    console.warn('stage 直接指定为数字的使用方式已经过时，将在下一版本移除，请直接使用 IPublicEnumTransformStage.Render|Serilize|Save|Clone|Init|Upgrade');
    return stageList[stage - 1]
  }
  return stage
}

export function isDOMText(data) {
  return typeof data === 'string'
}

/**
 * 为了避免把 { type: 'JSExpression', extType: 'function' } 误判为表达式，故增加如下逻辑。
 *
 * 引擎中关于函数的表达：
 *  开源版本：{ type: 'JSFunction', source: '', value: '' }
 *  内部版本：{ type: 'JSExpression', source: '', value: '', extType: 'function' }
 *  能力是对标的，不过开源的 react-renderer 只认识第一种，而内部只识别第二种（包括 Java 代码、RE）。
 * @param data
 * @returns
 */
export function isJSExpression(data) {
  if (!isObject(data)) {
    return false
  }
  return data.type === 'JSExpression' && data.extType !== 'function'
}

export function isPlainObject(value){
  if (!isObject(value)) {
    return false
  }
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null || Object.getPrototypeOf(proto) === null
}

export function isJSSlot(data) {
  if (!isObject(data)) {
    return false
  }
  return data.type === 'JSSlot'
}

const publicPath = document.currentScript?.src.replace(/^(.*\/)[^/]+$/, '$1')

export function getPublicPath() {
  return publicPath || ''
}