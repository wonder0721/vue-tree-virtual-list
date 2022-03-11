export default {
  name: 'checkbox',
  props: {
    checked: {
      type: Boolean,
      default: () => false
    },
    indeterminate: {
      type: Boolean,
      default: () => false
    },
    disabled: {
      type: Boolean,
      default: () => false
    }
  },
  render(h) {
    let _vm = this
    return h('input', {
      ref: 'checkbox',
      attrs: {
        type: 'checkbox',
        checked: _vm.checked
      },
      on: {
        change: $event => {
          let value = $event.target.checked
          _vm.$emit('change', value)
        }
      }
    })
  },
  computed: {
    showIndeterminate() {
      return !this.checked && this.indeterminate
    }
  },
  watch: {
    checked: {
      handler(val) {
        this.$refs.checkbox.checked = val
      }
    },
    showIndeterminate: {
      handler(val) {
        this.$nextTick(() => {
          this.$refs.checkbox.indeterminate = val
        })
      },
      immediate: true
    },
    disabled: {
      handler(val) {
        this.$nextTick(() => {
          this.$refs.checkbox.disabled = val
        })
      },
      immediate: true
    }
  }
}
