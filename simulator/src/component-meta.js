export class ComponentMeta {

  get advanced() {
    return this.getMetadata().configure.advanced || {}
  }

  constructor(designer, metadata) {
    this.designer = designer
    this.parseMetadata(metadata)
  }

  parseMetadata(metadata) {
    
  }

  setMetadata(metadata) {
    this.parseMetadata(metadata)
  }

  getMetadata() {
    return {
      configure: {
        advanced: undefined
      }
    }
  }
}