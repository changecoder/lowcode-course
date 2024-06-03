export function createDefer() {
  const r = {}
  const promise = new Promise((resolve, reject) => {
    r.resolve = resolve
    r.reject = reject
  })

  r.promise = () => promise

  return r
}