
import { getProductList,setShop,getShop,getCurrentTemplate,getTemplateList } from '../services/shop_fitment'

// 普通所有商品 & 推荐 
import { goodsList} from 'mall/services/goods_management'
// 拼团
import { getGoodsList as ptList} from 'mall/services/marketing/group'
// 特价
import { getGoodsList } from 'mall/services/marketing/specialPrice'
// 店铺信息
import { getOrderSetting } from 'mall/services/orders/orderList'

import { getToken } from 'setting/services/shops'

import { getCategory } from 'mall/services/category'



export default {
    namespace: 'shop_fitment',
    state: {
        products:{},
        list:[],
        goodsList:{
            default:[],
            // 推荐
            tuijian:[],
            // 拼团
            pingtuan:[],
            // 特价
            tejia:[]
        },
        photoToken: '',
        photoPrefix: '',
        categoryList: [],
        templateList:[],
        template:[],
        shop:{},
        theme:{},
    },
    effects: {
        *getToken({payload, callback},{call, put}){
            const data = yield call(getToken, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        photoToken: data.data.token,
                        photoPrefix: data.data.prefix,
                    },
                })
            }
        },
        *searchGoodsList({payload, callback}, {call, put, select}) {
            const response = yield call(goodsList, payload)
            if(response) {
                const data = yield response.json()
                const count = response.headers.get('row_count')
                if(data){
                    yield put({
                        type: 'setPropertyGoods',
                        payload: {
                            goodsList:{
                                default: data
                            }
                        }
                    })
                }
                callback && callback(count)
            }
        },
        *goodsList({payload, callback}, {call, put, select}) {
            const response = yield call(goodsList, payload)
            if(response) {
                const data = yield response.json()
                const count = response.headers.get('row_count')
                if(data){
                    yield put({
                        type: 'setPropertyGoods',
                        payload: {
                            goodsList:{
                                tuijian: data
                            }
                        }
                    })
                }
                callback && callback(count)
            }
        },
        *ptList({payload, callback}, {call, put, select}) {
            const response = yield call(ptList, payload)
            if(response) {
                const data = yield response.json()
                const count = response.headers.get('row_count')
                if(data){
                    yield put({
                        type: 'setPropertyGoods',
                        payload: {
                            goodsList:{
                                pingtuan: data
                            }
                        }
                    })
                }
                callback && callback(count)
            }
        },
        *getGoodsList({payload, callback}, {call, put, select}) {
            const response = yield call(getGoodsList, payload)
            if(response) {
                yield put({
                    type: 'setPropertyGoods',
                    payload: {
                        goodsList:{
                            tejia: response
                        }
                    }
                })
                callback && callback(null)
            }
        },
        *getOrderSetting({payload, callback}, {call, put, select}) {
            const respones = yield call(getOrderSetting, payload)
            if(respones) {
                if(respones.data){
                    yield put({
                        type: 'setProperty',
                        payload: {
                            shop:respones.data
                        }
                    })
                }
                callback && callback(respones)
            }
        },
        *getProductList({payload, callback}, {call, put, select}) {
            const respones = yield call(getProductList, payload)
            if(respones) {
                if(respones.data){
                    yield put({
                        type: 'setProperty',
                        payload: {
                            list:respones.data
                        }
                    })
                }
                callback && callback(respones)
            }
        },
        // 保存店铺信息
        *setShop({payload, callback}, {call, put, select}) {
            const respones = yield call(setShop, payload)
            if(respones) {
                callback && callback(respones)
            }
        },
        *getShop({payload, callback}, {call, put, select}) {
            const respones = yield call(getShop, payload)
            if(respones) {
                callback && callback(respones)
            }
        },
        *getCurrentTemplate({payload, callback}, {call, put, select}) {
            const respones = yield call(getCurrentTemplate, payload)
            if(!respones.hasOwnProperty('error')) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        template:respones.data[0]
                    }
                })
                callback && callback(respones.data[0])
            }
            
        },
        *getTemplateList({payload, callback}, {call, put, select}) {
            const respones = yield call(getTemplateList, payload)
            if(!respones.hasOwnProperty('error')) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        templateList:respones.data
                    }
                })
            }
            callback && callback(respones)
        },
        *getCategory({payload, callback}, {call, put, select}) {
            const respones = yield call(getCategory, payload)
            if(!respones.hasOwnProperty('error')) {
                respones.forEach(element => {
                    delete element.children
                })
                yield put({
                    type: 'setProperty',
                    payload: {
                        categoryList:respones
                    }
                })
            }
            callback && callback(respones)
        },
        // 重置 products key
        *resetData({payload, callback}, {call, put, select}) {
            yield put({
                type: 'resetProducts',
                payload
            })
        },
        //删除对应的产品列表
        *clearProducts({payload, callback}, {call, put, select}) {
            yield put({
                type: 'clear',
                payload
            })
        },
        *moveProducts({payload, callback}, {call, put, select}) {
            yield put({
                type: 'move',
                payload
            })
        },
        *setTheme({payload, callback}, {call, put, select}) {
            yield put({
                type: 'theme',
                payload:{theme:payload}
            })
        },
    },
    reducers: {
        clear(state, action){
            let {type,id} = action.payload
            if(type && !id){
                delete state.products[action.payload.type]
            }else if(type && id){
                let arr =state.products[type].slice()
                let _arr = []
                arr.forEach(i=> {
                    if(i.id !== id){
                        _arr.push(i) 
                    }
                })
                state.products[type] = _arr
            }
            return {...state}
        },
        move(state, action){
            let {type,pos,index} = action.payload
            let arr =state.products[type]
            let current = arr[index]
            let rep = arr[index + pos]
            if(rep){
                arr[index] = rep
                arr[index + pos] = current
                state.products[type] = arr
            }
            return {...state}
        },
        setPropertyGoods(state, action) {
            let goodsList = {...state.goodsList,...action.payload.goodsList}
            return {...state, ...{goodsList}}
        },
        setProperty(state, action) {
            if('list' in action.payload){
                let list = action.payload.list
                list.forEach(i => {
                    state.products[i.type] = i.data
                })
            }
            return {...state, ...action.payload}
        },
        resetProducts(state, action) {
            let obj = action.payload
            let products = JSON.parse(JSON.stringify(state.products))
            let newProducts = {}
            Object.keys(obj).forEach(key=>{
                if(products[key]){
                    newProducts[obj[key]] = products[key]
                }
            })
            state.products = {}
            state.products = JSON.parse(JSON.stringify(newProducts))
            return {...JSON.parse(JSON.stringify(state))}
        },
        theme(state, action) {
            return {...state, ...action.payload}
        },
    },
}
