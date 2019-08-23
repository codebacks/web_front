import _ from 'lodash'
const getListItem =(data, val, getProps, returnProps) => { 
    const obj = _.find(data , c => c[getProps] === val)
    return obj && obj[returnProps]
}

//客户端
export const client_app = [
    { value: 'im', name: '牛客服' },
    { value: 'dash', name: '管理后台' },
    { value: 'server', name: '服务端' },
    { value: 'ios', name: 'IOS' },
    { value: 'android', name: 'Android' },
]

export function getClientAppName(val){
    return getListItem(client_app, val, 'name', 'value')
}
export function getClientAppVal(val){
    const v = _.toInteger(val)
    return getListItem(client_app, val, 'value', 'name')
}

//场景
export const source_from = [
    { value: '1', name: '牛客服' },
    { value: '10', name: '朋友圈' },
    { value: '11', name: '客户群发' },
    { value:'12', name: '自动问候' },
    { value: '13', name: '自动回复' },
    { value: '20', name: '入群问候' },
    { value: '21', name: '群自动回复' },
    { value: '22', name: '群群发' },
    { value: '23', name: '群公告' },
    { value: '24', name: '群行为管理' },
    { value: '25', name: '重复加群' },
    { value: '30', name: '快捷回复' },
    { value: '31', name: '收藏' },
    { value: '32', name: '消息群发' },
    { value: '33', name: '朋友圈插件' },
    { value: '34', name: '商品推荐' },
    { value: '35', name: '素材库' },
    { value: '36', name: '虎赞小店' },
    { value: '37', name: '首绑有礼' },
]

export function getSourceFromName(val){   
    return getListItem(source_from, val, 'name', 'value')
}
export function getSourceFromVal(val){
    const v = _.toInteger(val)
    return getListItem(source_from, val, 'value', 'name')
}
// 发送方式
export const send_type = [
    { value: 'chat', name: '私聊' },
    { value: 'group', name: '群聊' },
    { value: 'moment', name: '朋友圈' },
]
export function getSendTypeName(val){
    return getListItem(send_type, val, 'value', 'name')
}
export function getSendTypeVal(val){
    return getListItem(send_type, val, 'name', 'value')
}

