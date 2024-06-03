import { shallowRef } from 'vue'
import { uniqueId, PublicEnumTransformStage, compatStage, isDOMText, isJSExpression, isPlainObject } from './utils'
import { Node } from './node'

export class DocumentModel {
  _blank = false
  _opened = false
  id = uniqueId('doc')
  _nodesMap = new Map()
  _nodes = shallowRef(new Set())

  get nodes() {
    return this._nodes.value
  }

  set nodes(value) {
    this._nodes.value = value
  }

  get simulator() {
    return this.project.simulator
  }

  get nodesMap(){
    return this._nodesMap
  }

  constructor(project, schema) {
    this.project = project
    this.designer = this.project?.designer
    if (!schema) {
      this._blank = true
    }

    // 兼容 vision
    this.id = project.getSchema()?.id || this.id

    this.rootNode = this.createNode(
      schema || {
        componentName: 'Page',
        id: 'root',
        fileName: ''
      }
    )
  }

  createNode(data) {
    let schema
    if (isDOMText(data) || isJSExpression(data)) {
      schema = {
        componentName: 'Leaf',
        children: data
      }
    } else {
      schema = data
    }

    if (this.hasNode(schema?.id)) {
      schema.id = null
    }

    const node = new Node(this, schema)

    this._nodesMap.set(node.id, node)
    this.nodes.add(node)

    return node
  }

  isBlank() {
    return !!this._blank
  }

  /**
   * 生成唯一 id
   */
  nextId(possibleId) {
    let id = possibleId
    while (!id || this.nodesMap.get(id)) {
      id = `node_${(String(this.id).slice(-10) + (++this.seqId).toString(36)).toLocaleLowerCase()}`
    }

    return id
  }
  /**
   * 根据 id 获取节点
   */
  getNode(id) {
    return this._nodesMap.get(id) || null
  }

  /**
   * 是否存在节点
   */
  hasNode(id) {
    const node = this.getNode(id)
    return node ? !node.isPurged : false
  }

  getComponentMeta(componentName) {
    return this.designer.getComponentMeta(
      componentName,
      () => this.simulator?.generateComponentMetadata(componentName) || null
    )
  }

  getComponentsMap(extraComps) {
    const componentsMap = []
    // 组件去重
    const exsitingMap = {}
    for (const node of this._nodesMap.values()) {
      const { componentName } = node || {}
      if (!exsitingMap[componentName]) {
        exsitingMap[componentName] = true
        if (node.componentMeta?.npm?.package) {
          componentsMap.push({
            ...node.componentMeta.npm,
            componentName
          })
        } else {
          componentsMap.push({
            devMode: 'lowCode',
            componentName
          })
        }
      }
    }
    // 合并外界传入的自定义渲染的组件
    if (Array.isArray(extraComps)) {
      extraComps.forEach((componentName) => {
        if (componentName && !exsitingMap[componentName]) {
          const meta = this.getComponentMeta(componentName)
          if (meta?.npm?.package) {
            componentsMap.push({
              ...meta?.npm,
              componentName
            })
          } else {
            componentsMap.push({
              devMode: 'lowCode',
              componentName
            })
          }
        }
      })
    }
    return componentsMap
  }

  export(stage = PublicEnumTransformStage.Serilize) {
    stage = compatStage(stage)
    // 置顶只作用于 Page 的第一级子节点，目前还用不到里层的置顶；如果后面有需要可以考虑将这段写到 node-children 中的 export
    const currentSchema = this.rootNode?.export(stage)
    if (Array.isArray(currentSchema?.children) && currentSchema?.children?.length && currentSchema?.children?.length > 0) {
      const FixedTopNodeIndex = currentSchema?.children
        .filter(i => isPlainObject(i))
        .findIndex((i => i.props?.__isTopFixed__))
      if (FixedTopNodeIndex > 0) {
        const FixedTopNode = currentSchema?.children.splice(FixedTopNodeIndex, 1)
        currentSchema?.children.unshift(FixedTopNode[0])
      }
    }
    return currentSchema
  }

  open() {
    this._opened = true
    return this
  }
}