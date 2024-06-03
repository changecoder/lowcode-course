export function assetsTransform(assets) {
  const { components, packages } = assets
  const packageMaps = (packages || []).reduce((acc, cur) => {
    const key = cur.id || cur.package || ''
    acc[key] = cur
    return acc
  }, {})
  components.forEach((componentDesc) => {
    let { devMode, schema, reference } = componentDesc
    if (devMode === 'lowcode') {
      devMode = 'lowCode'
    } else if (devMode === 'proCode') {
      devMode = 'proCode'
    }
    if (devMode) {
      componentDesc.devMode = devMode
    }
    if (devMode === 'lowCode' && !schema && reference) {
      const referenceId = reference.id || ''
      componentDesc.schema = packageMaps[referenceId].schema
    }
  })
  return assets
}