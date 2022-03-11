import VirtualList from 'vue-virtual-scroll-list'
import Checkbox from './checkbox'
import { Node } from './node'
import { flatTree, getExpandItem, recursionPostorderTraversal } from './utils'
import './index.scss'

export default {
  name: 'VirtualTree',
  components: { VirtualList, Checkbox },
  props: {
    // 原始树形结构
    data: {
      type: Array,
      required: true,
      default: () => []
    },
    nodeKey: {
      type: String,
      default: () => 'id'
    },
    height: {
      type: Number,
      default: () => 300
    },
    keeps: {
      type: Number,
      default: () => 30
    },
    props: {
      type: Object,
      default: () => ({
        id: 'id',
        label: 'label',
        children: 'children'
      })
    },
    defaultExpandAll: {
      type: Boolean,
      default: () => false
    },
    checkStrictly: {
      type: Boolean,
      default: () => false
    },
    showCheckbox: {
      type: Boolean,
      default: () => false
    },
    indent: {
      type: Number,
      default: () => 16
    },
    filterNodeMethod: {
      type: Function,
      default: () => () => {}
    }
  },
  data() {
    return {
      sourceData: [], // 扁平化tree之后的列表结构
      items: [] // 虚拟列表截取展示的item
    }
  },
  watch: {
    data() {
      this.handleData()
    }
  },
  created() {
    const { id = 'id', label = 'label', children = 'children' } = this.props
    this.propsMap = { id, label, children }

    this.getPropertyFromData = function (node, prop) {
      const data = node.data || {}
      const config = this.propsMap[prop]
      return data[config]
    }
    this.handleData()
  },
  methods: {
    /**
     * 数据转化以适配virtual-list所需的列表结构
     */
    handleData() {
      let { childNodes } = new Node({ data: this.data, props: this.props })
      this.sourceData = flatTree(childNodes)
      this.items = this.sourceData.filter(item => item.level === 1)
      // console.log(this.items)
    },

    /**
     * 处理复选框被勾选的逻辑
     */
    onChange(item) {
      item.checked = !item.checked
      item.indeterminate = false
      // 节点选中状态更改时 所有子节点选中状态自动同步 递归计算父节点选中情况
      // 处理子节点
      if (item.hasChildren) {
        const index = this.sourceData.findIndex(v => v.id === item.id)
        for (let i = index + 1; i < this.sourceData.length; i++) {
          let v = this.sourceData[i]
          if (v.level === item.level) break
          v.checked = item.checked
          v.indeterminate = false
        }
      }
      // 处理父节点
      this.setParentCheckStatus(item.parentId)
      // 共两个参数，依次为：传递给 data 属性的数组中该节点所对应的对象、树目前的选中状态对象
      this.$emit('check', item, {
        checkedNodes: this.sourceData.filter(item => item.checked),
        checkedKeys: this.sourceData.filter(item => item.checked).map(item => item.id)
      })
      this.$emit('check-change', item, item.checked)
    },
    /**
     * 处理展开折叠逻辑
     */
    toggleChildrenDisplay(item, index) {
      if (item.expanded) {
        // 将子层级全部隐藏
        // 通过level字段将两项之间level不相同的都删除
        let count = 0
        for (let i = index + 1; i < this.items.length; i++) {
          const v = this.items[i]
          if (v.level === item.level) break
          count++
        }
        this.items.splice(index + 1, count)
      } else {
        // 递归展开子层级
        let children = getExpandItem(item.childNodes)
        // 添加父级节点下对应的子节点
        this.items.splice(index + 1, 0, ...children)
      }
      item.expanded = !item.expanded
    },
    setParentCheckStatus(parentId) {
      if (parentId && this.sourceData.find(v => v.id === parentId)) {
        let parent = this.sourceData.find(v => v.id === parentId)
        const checkedAll = parent.childNodes.every(v => v.checked)
        const checkedNone = parent.childNodes.every(v => !v.checked && !v.indeterminate)
        // 子节点全选 父节点设置全选
        if (checkedAll) parent.checked = true
        // 子节点全不选 父节点设置全不选
        else if (checkedNone) {
          parent.checked = false
          parent.indeterminate = false
        }
        // 子节点既不是全选也不是全不选 父节点设置半选
        else {
          parent.checked = false
          parent.indeterminate = true
        }
        this.setParentCheckStatus(parent.parentId)
      }
    },

    /**
     * 若节点可被选择（即 show-checkbox 为 true），则返回目前被选中的节点的 key 所组成的数组
     */
    getCheckedKeys() {
      return this.sourceData.filter(item => item.checked).map(item => item.data.id)
    },

    /**
     * 若节点可被选择（即 show-checkbox 为 true），则返回目前被选中的节点的 node 所组成的数组
     */
    getCheckedNodes() {
      return this.sourceData.filter(item => item.checked).map(item => item.data)
    },

    /**
     * 通过 keys 设置目前勾选的节点
     */
    setCheckedKeys(val) {
      console.log(val)
      // TODO 算法优化 类似于树的后序遍历
      recursionPostorderTraversal(this.sourceData, item => {
        if (item.hasChildren) {
          item.checked = val.includes(item.data.id) || item.childNodes.every(v => v.checked)
          item.indeterminate = !item.checked && !item.childNodes.every(v => !v.checked && !v.indeterminate)
        } else {
          item.checked = val.includes(item.data.id)
        }
      })
    },

    /**
     * 通过 key / data 设置某个节点的勾选状态
     */
    setChecked(id, val) {
      const item = this.sourceData.find(v => v.data.id === id)
      if (item) {
        item.checked = !!val
        this.setParentCheckStatus(item.parentId)
      }
    },

    onNodeClick(node) {
      console.log(node)
      this.$emit('node-click', node.data)
    },

    /**
     * 对树节点进行筛选操作
     * 接收一个任意类型的参数，该参数会在 filter-node-method 中作为第一个参数
     */
    filter(val) {
      if (!this.filterNodeMethod) {
        console.warn('filterNodeMethod is required')
      } else if (!Object.prototype.toString.call(this.filterNodeMethod) === '[object Function]') {
        console.warn('prop filterNodeMethod expected Function')
      } else {
        let filterData = this.sourceData.filter(item => this.filterNodeMethod(val, item.data))
        this.items = filterData
      }
    }
  },
  render(h) {
    const renderContentFn = ({ item, index }) => {
      const renderContent = []
      renderContent.push(
        h(
          'div',
          {
            class: {
              'fold-btn': true
            }
          },
          item.hasChildren
            ? [
                h(
                  'span',
                  {
                    class: {
                      icon: true
                    },
                    on: {
                      click: () => this.toggleChildrenDisplay(item, index)
                    }
                  },
                  item.expanded ? '-' : '+'
                )
              ]
            : ''
        )
      )
      this.showCheckbox &&
        renderContent.push(
          h(Checkbox, {
            props: {
              checked: item.checked,
              indeterminate: item.indeterminate
            },
            on: {
              change: $event => this.onChange(item, index, $event)
            }
          })
        )
      renderContent.push(
        h(
          'div',
          {
            class: {
              'node-content': true
            },
            on: {
              click: () => this.onNodeClick(item)
            }
          },
          this.$scopedSlots.default ? this.$scopedSlots.default({ node: item.data }) : item.label
        )
      )
      return renderContent
    }

    return h(VirtualList, {
      class: {
        'vue-tree-virtual-list': true
      },
      style: {
        height: this.height + 'px',
        'overflow-y': 'auto'
      },
      props: {
        'data-key': 'id',
        'data-sources': this.items,
        'data-component': {},
        keeps: this.keeps
      },
      scopedSlots: {
        item: ({ item, index }) =>
          h(
            'div',
            {
              class: {
                treeitem: true
              },
              style: {
                'padding-left': (item.level - 1) * this.indent + 'px'
              }
            },
            renderContentFn({ item, index })
          )
      }
    })
  }
}
