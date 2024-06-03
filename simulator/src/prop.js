export const UNSET = Symbol.for('unset')

export class Prop {
  constructor(
    parent,
    value = UNSET,
    key,
    spread = false,
    options = {}
  ) {
    this.owner = parent.owner
    this.props = parent.props
    this.key = key
    this.spread = spread
    this.options = options
  }
}