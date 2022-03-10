function getPropertyFromData(node, prop) {
  const props = node.props
  const data = node.data || {}
  const config = props[prop]
  return data[config]
}

let id = 0

export class Node {
  expanded = false
  checked = false
  indeterminate = false
  level = 0
  hasChildren = false
  data = null

  constructor(options) {
    this.id = id++
    for (let name in options) {
      if (options.hasOwnProperty(name)) {
        this[name] = options[name]
      }
    }
    if (this.data) this.setData(this.data)
  }

  get label() {
    return getPropertyFromData(this, 'label')
  }

  setData(data) {
    this.data = data
    this.childNodes = []
    let children
    if (this.level === 0 && this.data instanceof Array) {
      children = this.data
    } else {
      children = getPropertyFromData(this, 'children') || []
    }
    this.hasChildren = !!children.length
    for (let i = 0, j = children.length; i < j; i++) {
      this.insertChild({ data: children[i] })
    }
  }

  insertChild(child) {
    if (!(child instanceof Node)) {
      Object.assign(child, {
        parentId: this.id,
        level: this.level + 1,
        props: this.props
      })
      child = new Node(child)
    }
    this.childNodes.push(child)
  }
}
