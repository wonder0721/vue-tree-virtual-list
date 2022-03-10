/**
 * @description 扁平化tree
 * @param {Array} data
 * @return {Array}
 */
export function flatTree(data) {
  return data.reduce((cur, next) => {
    return next.childNodes ? [...cur, next, ...flatTree(next.childNodes)] : [...cur, next]
  }, [])
}

// 获取子节点个数
function getChildCount(arr) {
  return arr.reduce((cur, next) => {
    return cur + (next.hasChildren ? getChildCount(next.childNodes) + 1 : 1)
  }, 0)
}

// 获取子节点
export function getExpandItem(data) {
  return data.reduce((cur, next) => {
    return next.expanded && next.hasChildren ? [...cur, next, ...getExpandItem(next.childNodes)] : [...cur, next]
  }, [])
}

/**
 * @description 后序遍历
 * @param {Array} data
 * @param {Function} callback
 */
export function recursionPostorderTraversal(data, callback) {
  let startIndex = 0
  function fn(length) {
    while (startIndex < length) {
      // console.log(startIndex)
      let item = data[startIndex]
      if (item.hasChildren) {
        startIndex++
        fn(getChildCount(item.childNodes) + startIndex)
        callback(item)
      } else {
        callback(item)
        startIndex++
      }
    }
  }
  fn(data.length)
}
