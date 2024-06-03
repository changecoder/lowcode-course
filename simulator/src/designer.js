import { ref } from 'vue'
import { ComponentMeta } from './component-meta'
import { Project } from './project'

export class Designer {
  _componentMetasMap = new Map()
  _lostComponentMetasMap = new Map()
  _simulatorProps = ref({})

  get simulatorProps() {
    return this._simulatorProps.value
  }

  get projectSimulatorProps() {
    return {
      ...this.simulatorProps,
      project: this.project,
      designer: this
    }
  }

  constructor(props) {
    const { editor } = props
    this.editor = editor
    this.project = new Project(this)
    this.setProps(props)
  }

  buildComponentMetasMap(metas) {
    metas.forEach((data) => this.createComponentMeta(data))
  }

  createComponentMeta(data){
    const key = data.componentName
    if (!key) {
      return null
    }
    let meta = this._componentMetasMap.get(key)
    if (meta) {
      meta.setMetadata(data)

      this._componentMetasMap.set(key, meta);
    } else {
      meta = this._lostComponentMetasMap.get(key)

      if (meta) {
        meta.setMetadata(data)
        this._lostComponentMetasMap.delete(key)
      } else {
        meta = new ComponentMeta(this, data)
      }

      this._componentMetasMap.set(key, meta)
    }
    return meta
  }

  setProps(nextProps) {
    const props = this.props ? { ...this.props, ...nextProps } : nextProps
    if (this.props) {
      if (props.simulatorProps !== this.props.simulatorProps) {
        this._simulatorProps.value = props.simulatorProps
      }
      if (
        props.componentMetadatas !== this.props.componentMetadatas &&
        props.componentMetadatas != null
      ) {
        this.buildComponentMetasMap(props.componentMetadatas)
      }
    } else {
      if (props.simulatorProps) {
        this._simulatorProps.value = props.simulatorProps;
      }
      if (props.componentMetadatas != null) {
        this.buildComponentMetasMap(props.componentMetadatas)
      }
    }
    this.props = props
  }
}