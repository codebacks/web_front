/**
 **@Description:
 **@author: 吴明
 */

import {createModel,modelList,deleteModel,editModel} from 'platform/services/packet_model'

export default {
    namespace: 'platform_packet_model',
    state: {
        data:[],
        ispacket:'',
        count:'',
        loading:false,
        shopList:[]
    },

    effects: {
        *createModel({ payload ,callback}, { call, put }) {
            const response = yield call(createModel, payload)
            if(response.meta.code === 200){
                callback && callback()
            }
        },
        *modelList({ payload ,callback}, { call, put }) {
            yield put({ type: 'setProperty', payload: { loading: true }})
            const response = yield call(modelList, payload)
            if(response.data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        data:response.data,
                        count:response.pagination.rows_found
                    }
                })
                callback && callback()
            }
            yield put({ type: 'setProperty', payload: { loading: false }})
        },
        *deleteModel({ payload ,callback}, { call, put }) {
            const response = yield call(deleteModel, payload)
            if(response.meta.code === 200){
                callback && callback()
            }
        },
        *editModel({ payload ,callback}, { call, put }) {
            const response = yield call(editModel, payload)
            if(response.meta.code === 200){
                callback && callback()
            }
        }
    },

    reducers: {
        setProperty(state, action) {
            return {
                ...state,
                ...action.payload
            }
        }
    },
}
