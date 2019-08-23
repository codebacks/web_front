import { getPageConfig, setPageConfig, uploadBg } from 'community/services/groupCode'
import {parse} from "qs"
import _ from 'lodash'

const _state = {
    custom_backgrond_img_url: '',
    des: '',
    title: '',
    type: '', // 1:模板 2自定义
}
export default {
    namespace: 'community_groupCodePageConfig',

    state: {
        ..._state
    },

    effects: {
        * getPageConfig({payload, callback}, {select, call, put}) {
            const data = yield call(getPageConfig, {id: payload.id})
            if (data && data.meta?.code === 200) {
                console.log('获取页面配置成功', data.data)
                yield put({
                    type: 'setProperty',
                    payload: {
                        ...data.data
                    }
                })
                callback && callback(data.data)
            }
        },
        * setPageConfig({payload, callback}, {select, call, put}) {
            const data = yield call(setPageConfig, {id: payload.id, body: payload.body})
            if (data && data.meta?.code === 200) {
                callback && callback(data.data)
            }
        },
        * uploadBg({payload,callback},{select,call,put}) {
            const {data,meta} = yield call(uploadBg,payload)
            if(data && meta){
                yield put({
                    type:'setProperty',
                    payload:{
                        token:data.token
                    },
                })
                callback && callback(data,meta)
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetState(state, action) {
            return {...state, ..._state}
        },
    },
}
