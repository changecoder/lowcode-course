import { isCSSUrl } from './is-css-url'
import { load, evaluate } from './script'

export const AssetLevel = {
  // 环境依赖库 比如 vue
  Environment: 1,
  // 基础类库，比如 lodash deep fusion antd
  Library: 2,
  // 主题
  Theme: 3,
  // 运行时
  Runtime: 4,
  // 业务组件
  Components: 5,
  // 应用 & 页面
  App: 6
}

export const AssetLevels = [
  AssetLevel.Environment,
  AssetLevel.Library,
  AssetLevel.Theme,
  AssetLevel.Runtime,
  AssetLevel.Components,
  AssetLevel.App
]

export const AssetType = {
  JSUrl: 'jsUrl',
  CSSUrl: 'cssUrl',
  CSSText: 'cssText',
  JSText: 'jsText',
  Bundle: 'bundle'
}

export function isAssetItem(obj) {
  return obj && obj.type
}

export function isAssetBundle(obj){
  return obj && obj.type === AssetType.Bundle
}

export function assetBundle(
  assets,
  level
) {
  if (!assets) {
    return null
  }
  return {
    type: AssetType.Bundle,
    assets,
    level
  }
}

export function assetItem(type, content, level, id) {
  if (!content) {
    return null
  }
  return {
    type,
    content,
    level,
    id
  }
}

export class StylePoint {
  constructor(level, id) {
    this.level = level
    if (id) {
      this.id = id
    }
    let placeholder
    if (id) {
      placeholder = document.head.querySelector(`style[data-id="${id}"]`)
    }
    if (!placeholder) {
      placeholder = document.createTextNode('')
      const meta = document.head.querySelector(`meta[level="${level}"]`)
      if (meta) {
        document.head.insertBefore(placeholder, meta)
      } else {
        document.head.appendChild(placeholder)
      }
    }
    this.placeholder = placeholder
  }

  applyText(content) {
    if (this.lastContent === content) {
      return
    }
    this.lastContent = content
    this.lastUrl = undefined
    const element = document.createElement('style')
    element.setAttribute('type', 'text/css')
    if (this.id) {
      element.setAttribute('data-id', this.id)
    }
    element.appendChild(document.createTextNode(content))
    document.head.insertBefore(element, this.placeholder.parentNode === document.head ? this.placeholder.nextSibling : null)
    document.head.removeChild(this.placeholder)
    this.placeholder = element
  }

  applyUrl(url) {
    if (this.lastUrl === url) {
      return
    }
    this.lastContent = undefined
    this.lastUrl = url
    const element = document.createElement('link')
    element.onload = onload
    element.onerror = onload

    const i = createDefer()
    function onload(e) {
      element.onload = null
      element.onerror = null
      if (e.type === 'load') {
        i.resolve()
      } else {
        i.reject()
      }
    }

    element.href = url
    element.rel = 'stylesheet'
    if (this.id) {
      element.setAttribute('data-id', this.id)
    }
    document.head.insertBefore(element, this.placeholder.parentNode === document.head ? this.placeholder.nextSibling : null)
    document.head.removeChild(this.placeholder)
    this.placeholder = element
    return i.promise()
  }
}

function parseAssetList(scripts, styles, assets, level) {
  for (const asset of assets) {
    parseAsset(scripts, styles, asset, level);
  }
}

function parseAsset(scripts, styles, asset, level) {
  if (!asset) {
    return
  }
  if (Array.isArray(asset)) {
    return parseAssetList(scripts, styles, asset, level)
  }

  if (isAssetBundle(asset)) {
    if (asset.assets) {
      if (Array.isArray(asset.assets)) {
        parseAssetList(scripts, styles, asset.assets, asset.level || level)
      } else {
        parseAsset(scripts, styles, asset.assets, asset.level || level)
      }
      return
    }
    return
  }

  if (!isAssetItem(asset)) {
    asset = assetItem(isCSSUrl(asset) ? AssetType.CSSUrl : AssetType.JSUrl, asset, level)
  }

  let lv = asset.level || level

  if (!lv || AssetLevel[lv] == null) {
    lv = AssetLevel.App
  }

  asset.level = lv
  if (asset.type === AssetType.CSSUrl || asset.type == AssetType.CSSText) {
    styles[lv].push(asset)
  } else {
    scripts[lv].push(asset)
  }
}

export class AssetLoader {
  stylePoints = new Map()

  async load(asset) {
    const styles = {}
    const scripts = {}
    AssetLevels.forEach(lv => {
      styles[lv] = []
      scripts[lv] = []
    })
    parseAsset(scripts, styles, asset)
    const styleQueue = styles[AssetLevel.Environment].concat(
      styles[AssetLevel.Library],
      styles[AssetLevel.Theme],
      styles[AssetLevel.Runtime],
      styles[AssetLevel.App]
    )
    const scriptQueue = scripts[AssetLevel.Environment].concat(
      scripts[AssetLevel.Library],
      scripts[AssetLevel.Theme],
      scripts[AssetLevel.Runtime],
      scripts[AssetLevel.App]
    )
    await Promise.all(
      styleQueue.map(({ content, level, type, id }) => this.loadStyle(content, level, type === AssetType.CSSUrl, id))
    );
    await Promise.all(scriptQueue.map(({ content, type, scriptType }) => this.loadScript(content, type === AssetType.JSUrl, scriptType)))
  }

  loadStyle(content, level, isUrl, id) {
    if (!content) {
      return;
    }
    let point
    if (id) {
      point = this.stylePoints.get(id)
      if (!point) {
        point = new StylePoint(level, id)
        this.stylePoints.set(id, point)
      }
    } else {
      point = new StylePoint(level)
    }
    return isUrl ? point.applyUrl(content) : point.applyText(content)
  }

  loadScript(content, isUrl, scriptType) {
    if (!content) {
      return
    }
    return isUrl ? load(content, scriptType) : evaluate(content, scriptType);
  }

  async loadAsyncLibrary(asyncLibraryMap) {
    const promiseList = []
    const libraryKeyList = []
    const pkgs = []
    for (const key in asyncLibraryMap) {
      // 需要异步加载
      if (asyncLibraryMap[key].async) {
        promiseList.push(window[asyncLibraryMap[key].library])
        libraryKeyList.push(asyncLibraryMap[key].library)
        pkgs.push(asyncLibraryMap[key])
      }
    }
    await Promise.all(promiseList).then((mods) => {
      if (mods.length > 0) {
        mods.map((item, index) => {
          const { exportMode, exportSourceLibrary, library } = pkgs[index]
          window[libraryKeyList[index]] =
            exportMode === 'functionCall' &&
            (exportSourceLibrary == null || exportSourceLibrary === library)
              ? item()
              : item
          return item
        })
      }
    })
  }
}