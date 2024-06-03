import { shallowRef } from 'vue'
import { AssetLoader } from './utils/asset'
import { assetsTransform } from './utils/assets-transform'

const AssetsCache = {}

export class Editor {
  _context = shallowRef(new Map())
  waits = new Map()

  get context() {
    return this._context.value
  }

  async setAssets(assets) {
    const { components } = assets
    if (components && components.length) {
      const componentDescriptions = []
      const remoteComponentDescriptions = []
      components.forEach((component) => {
        if (!component) {
          return
        }
        if (component.exportName && component.url) {
          remoteComponentDescriptions.push(component)
        } else {
          componentDescriptions.push(component)
        }
      })
      assets.components = componentDescriptions
      assets.componentList = assets.componentList || []

      // 如果有远程组件描述协议，则自动加载并补充到资产包中，同时出发 designer.incrementalAssetsReady 通知组件面板更新数据
      if (remoteComponentDescriptions && remoteComponentDescriptions.length) {
        await Promise.all(
          remoteComponentDescriptions.map(async (component) => {
            const { exportName, url, npm } = component
            if (!url || !exportName) {
              return
            }
            if (!AssetsCache[exportName] || !npm?.version || AssetsCache[exportName].npm?.version !== npm?.version) {
              await (new AssetLoader()).load(url)
            }
            AssetsCache[exportName] = component
            function setAssetsComponent(component, extraNpmInfo = {}) {
              const components = component.components
              assets.componentList = assets.componentList?.concat(component.componentList || [])
              if (Array.isArray(components)) {
                components.forEach(d => {
                  assets.components = assets.components.concat({
                    npm: {
                      ...npm,
                      ...extraNpmInfo,
                    },
                    ...d
                  } || [])
                })
                return
              }
              if (component.components) {
                assets.components = assets.components.concat({
                  npm: {
                    ...npm,
                    ...extraNpmInfo,
                  },
                  ...component.components
                } || [])
              }
            }
            function setArrayAssets(value, preExportName = '', preSubName = '') {
              value.forEach((d, i) => {
                const exportName = [preExportName, i.toString()].filter(d => !!d).join('.')
                const subName = [preSubName, i.toString()].filter(d => !!d).join('.')
                Array.isArray(d) ? setArrayAssets(d, exportName, subName) : setAssetsComponent(d, {
                  exportName,
                  subName
                })
              })
            }
            if (window[exportName]) {
              if (Array.isArray(window[exportName])) {
                setArrayAssets(window[exportName])
              } else {
                setAssetsComponent(window[exportName])
              }
            }
            return window[exportName]
          })
        )
      }
    }
    const innerAssets = assetsTransform(assets)
    this.context.set('assets', innerAssets)
    this.notifyGot('assets')
  }

  get(keyOrType) {
    return this.context.get(keyOrType)
  }

  set(key, value) {
    this.context.set(key, value)
  }

  notifyGot(key) {
    let waits = this.waits.get(key)
    if (!waits) {
      return
    }
    waits = waits.slice().reverse()
    let i = waits.length
    while (i--) {
      waits[i].resolve(this.get(key))
      if (waits[i].once) {
        waits.splice(i, 1)
      }
    }
    if (waits.length > 0) {
      this.waits.set(key, waits)
    } else {
      this.waits.delete(key)
    }
  }

  onceGot(keyOrType) {
    const x = this.context.get(keyOrType)
    if (x !== undefined) {
      return Promise.resolve(x)
    }
    return new Promise((resolve) => {
      this.setWait(keyOrType, resolve, true)
    })
  }

  setWait(key, resolve, once) {
    const waits = this.waits.get(key)
    if (waits) {
      waits.push({ resolve, once })
    } else {
      this.waits.set(key, [{ resolve, once }])
    }
  }
}