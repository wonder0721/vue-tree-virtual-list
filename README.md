# vue-tree-virtual-list

A Vue tree component for lager data, based on [vue-virtual-scroll-list](https://github.com/tangbc/vue-virtual-scroll-list)

## 安装

```js
npm i vue-tree-virtual-list -s
```

## 用法

.vue file:

```html
<VueVirtualTree :data="treeData" :height="500" :props="defaultProps" show-checkbox>
  <template v-slot:default="{ node }">
    <span>{{ node.label}}</span>
  </template>
</VueVirtualTree>
```

```js
  import VirtualTree from 'vue-tree-virtual-list'
  import 'vue-tree-virtual-list/dist/vue-tree-virtual-list.css'
  ...
  export default {
    components: {
      VirtualTree,
    },
    data(){
      this.defaultProps = {
        id: 'id',
        children: 'childList',
        label: 'companyName'
      }
      return {
        treeData: [...],
      }
    }
  ...
```
