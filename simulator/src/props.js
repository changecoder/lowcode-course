import { uniqueId } from "./utils"
import { Prop } from './prop'

export class Props {
  id = uniqueId('props')

  constructor(owner, value) {
    this.owner = owner
    if (Array.isArray(value)) {
      this.type = 'list'
      this.items = value.map(
        (item, idx) => new Prop(this, item.value, item.name || idx, item.spread)
      )
    } else if (value != null) {
      this.items = Object.keys(value).map((key) => new Prop(this, value[key], key, false))
    }
  }
}