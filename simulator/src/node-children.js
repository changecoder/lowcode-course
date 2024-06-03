import { shallowRef } from 'vue'
import { PublicEnumTransformStage, compatStage } from './utils'

export class NodeChildren {
  _children = shallowRef([])

  get size() {
    return this.children.length
  }

  get children() {
    return this._children.value
  }

  set children(value) {
    this._children.value = value
  }

  constructor(
    owner,
    data,
    options = {}
  ) {
    this.owner = owner
    this.children = (Array.isArray(data) ? data : [data]).filter(child => !!child).map((child) => {
      return this.owner.document?.createNode(child, options.checkId)
    })
  }

  /**
   * 导出 schema
   */
  export(stage = PublicEnumTransformStage.Save) {
    stage = compatStage(stage)
    return this.children.map((node) => {
      const data = node.export(stage)
      return data
    })
  }
}