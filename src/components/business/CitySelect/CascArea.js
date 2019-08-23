// 省市级联选择
// 用于antd的Select组件下

import CITYS from './data'
const data = JSON.parse(JSON.stringify(CITYS))
let provinceData = []
let cityData = {}
Array.isArray(data)&&data.forEach((val,key) => { 
    provinceData.push(val.name)
    cityData[val.name] = []
    if (val.child&&val.child.length > 0) { 
        val.child.forEach((v,k) => { 
            cityData[val.name].push(v.name)
        })
    }
})
export default {
    provinceData,
    cityData,
}

