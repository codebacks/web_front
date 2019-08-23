// 省市区三级级联选择
// 用于antd的Cascader组件

import CITYS from './data'
const data = JSON.parse(JSON.stringify(CITYS))
const dealData = (arr) => { 
    arr.forEach((item) => { 
        item.value = item.name
        item.label = item.name
        item.children = item.child || []
        if (item.child&&item.child.length>0) { 
            dealData(item.child)
        }
    })
}
const deleteData = (data) => { 
    data.forEach((item) => { 
        delete(item.child)
        delete(item.name)
        delete(item.cityCount)
        delete(item.code)
        if (item.children && item.children.length > 0) {
            deleteData(item.children)
        } else { 
            delete(item.children)
        }
    })
}
dealData(data)
deleteData(data)
export const AREA_DATA = data

