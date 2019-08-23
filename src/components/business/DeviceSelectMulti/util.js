
export function getTreeNodeKeys(data, keys=[]) {
    keys.push(data.id.toString())
    if (data.children && data.children.length) {
        for (let i = 0; i < data.children.length; i++) {
            const item = data.children[i]
            getTreeNodeKeys(item, keys)
        }
    }
    return keys
}

export function getAllTreeNodeKeys(data, result = {}) {
    const key = data.id
    result[key] = getTreeNodeKeys(data)
    if (data.children && data.children.length) {
        for (let i = 0; i < data.children.length; i++) {
            getAllTreeNodeKeys(data.children[i], result)
        }
    }
    return result
}

export function searchTreeNode(data, filed, value) {
    let result = null
    for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if (result !== null) {
            break
        }
        if (item[filed] === value) {
            result = item
        } else if (item.children && item.children.length) {
            result = searchTreeNode(item.children, filed, value)
        }
    }
    return result
}

export function getLeafCount(data, count = 0) {
    if (!data.children || !data.children.length) {
        return 1
    } else {
        for (let i = 0; i < data.children.length; i++) {
            count += getLeafCount(data.children[i])
        }
    }
    return count
}
