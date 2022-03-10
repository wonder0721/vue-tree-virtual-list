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
    return h('input', {
      ref: 'checkbox',
      attrs: {
        type: 'checkbox',
        checked: this.checked
      },
      on: {
        change: ($event) => {
          let value = $event.target.checked
          this.$emit('change', value)
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
