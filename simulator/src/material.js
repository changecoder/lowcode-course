export class Material {
  constructor(editor) {
    this.editor = editor
  }

  setAssets(assets) {
    this.editor.setAssets(assets)
  }
}