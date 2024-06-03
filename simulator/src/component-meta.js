export class ComponentMeta {
  constructor(designer, metadata) {
    this.designer = designer
    this.parseMetadata(metadata)
  }

  parseMetadata(metadata) {
    
  }

  setMetadata(metadata) {
    this.parseMetadata(metadata)
  }
}