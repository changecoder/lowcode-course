import { PublicEnumTransformStage, compatStage } from './utils'
import { Props } from './props'
import { NodeChildren } from './node-children'

export class Node {
  purged = false

  /**
   * 是否已销毁
   */
  get isPurged() {
    return this.purged
  }

  get isLeafNode() {
    return this.componentName === 'Leaf'
  }

  /**
   * 当前节点子集
   */
  get children() {
    return this._children || null
  }

  /**
   * 当前节点子集
   */
  get children() {
    return this._children || null
  }

  get componentMeta() {
    return this.document.getComponentMeta(this.componentName)
  }

  get isParentalNode() {
    return !this.isLeafNode
  }

  constructor(document, nodeSchema) {
    this.document = document
    const { componentName, id } = nodeSchema
    this.id = document.nextId(id)
    this.componentName = componentName
    this.props = new Props(this, props, extras)
    this._children = new NodeChildren(this, this.initialChildren(children))
  }

  /**
   * 是否一个父亲类节点
   */
  isParental() {
    return this.isParentalNode
  }

  /**
   * 导出 schema
   */
  export(stage = PublicEnumTransformStage.Save, options = {}) {
    stage = compatStage(stage)
    const baseSchema = {
      componentName: this.componentName
    }

    if (stage !== PublicEnumTransformStage.Clone) {
      baseSchema.id = this.id
    }
    if (stage === PublicEnumTransformStage.Render) {
      baseSchema.docId = this.document.id
    }

    const schema = {
      ...baseSchema,
      props: {}
    }

    if (this.isParental() && this.children && this.children.size > 0 && !options.bypassChildren) {
      schema.children = this.children.export(stage)
    }

    return schema
  }

  initialChildren(children) {
    const { initialChildren } = this.componentMeta.advanced

    if (children == null) {
      if (initialChildren) {
        if (typeof initialChildren === 'function') {
          return initialChildren(this.internalToShellNode()) || []
        }
        return initialChildren
      }
      return []
    }

    if (Array.isArray(children)) {
      return children
    }

    return [children]
  }

  internalToShellNode() {
    return this.document.designer.shellModelFactory.createNode(this)
  }

}