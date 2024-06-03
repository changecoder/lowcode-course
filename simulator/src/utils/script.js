import { createDefer } from './create-defer'

export function evaluate(script, scriptType) {
  const scriptEl = document.createElement('script')
  scriptType && (scriptEl.type = scriptType)
  scriptEl.text = script
  document.head.appendChild(scriptEl)
  document.head.removeChild(scriptEl)
}

export function load(url, scriptType) {
  const node = document.createElement('script')

  node.onload = onload
  node.onerror = onload

  const i = createDefer()

  function onload(e) {
    node.onload = null
    node.onerror = null
    if (e.type === 'load') {
      i.resolve()
    } else {
      i.reject()
    }
  }

  node.src = url

  // `async=false` is required to make sure all js resources execute sequentially.
  node.async = false

  scriptType && (node.type = scriptType)

  document.head.appendChild(node)

  return i.promise()
}