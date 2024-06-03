import { ref, shallowRef } from 'vue'
import { PublicEnumTransformStage } from './utils'
import { DocumentModel } from './document-model'

export class Project {
  _documents = shallowRef([])
  _config = ref({})

  get config() {
    return this._config.value
  }
  set config(value) {
    this._config.value = value
  }

  get documents() {
    return this._documents.value
  }

  set documents(value) {
    this._documents.value = value 
  }

  documentsMap = new Map()

  constructor(designer) {
    this.designer = designer
    this.load()
  }

  load(schema) {
    this.unload()
    this.data = {
      version: '1.0.0',
      componentsMap: [],
      componentsTree: [],
      ...schema
    }
    this.config = schema?.config || this.config
  }

  unload() {
    if (this.documents.length < 1) {
      return
    }
    for (let i = this.documents.length - 1; i >= 0; i--) {
      this.documents[i].remove()
    }
  }

  createDocument(data) {
    const doc = new DocumentModel(this, data || this?.data?.componentsTree?.[0])
    this.documents.push(doc)
    this.documentsMap.set(doc.id, doc)
    return doc
  }

  /**
   * 获取项目整体 schema
   */
  getSchema(
    stage = PublicEnumTransformStage.Save,
  ) {
    return {
      ...this.data,
      componentsMap: this.getComponentsMap(),
      componentsTree: this.documents
        .filter((doc) => !doc.isBlank())
        .map((doc) => doc.export(stage) || {})
    }
  }

  getComponentsMap() {
    return this.documents.reduce((
      componentsMap,
      curDoc
    ) => {
      const curComponentsMap = curDoc.getComponentsMap()
      if (Array.isArray(curComponentsMap)) {
        curComponentsMap.forEach((item) => {
          const found = componentsMap.find((eItem) => {
            if (
              isProCodeComponentType(eItem) &&
              isProCodeComponentType(item) &&
              eItem.package === item.package &&
              eItem.componentName === item.componentName
            ) {
              return true
            } else if (
              isLowCodeComponentType(eItem) &&
              eItem.componentName === item.componentName
            ) {
              return true
            }
            return false
          });
          if (found) {
            return
          }
          componentsMap.push(item)
        })
      }
      return componentsMap
    }, [])
  }

  // 加载 schema
  open(doc) {
    doc = this.createDocument(doc)
    return doc.open()
  }
}