/**
 **@Description:
 **@author: AmberYe
 */

import {query,downLoad,getShortUrl} from 'platform/services/wxcodelist'
export default {
    namespace: 'platform_list',

    state: {
        data:[],
        QR:'',
        loading:false,
        shortUrl:''
    },

    effects: {
        * query({payload, callback}, {select, call, put}) {
            yield put({type: 'setProperty', payload: {loading: true}})
            const data = yield call(query, payload)
            if(data.data) {                
                yield put({
                    type: 'setProperty',
                    payload: {
                        data: data.data,
                        rows_found:data.pagination.rows_found
                    }
                })
            }
            yield put({type: 'setProperty', payload: {loading: false}})
        },
        * downLoad({payload,callback},{select,call,put}) {
            const {data} = yield call(downLoad, payload)
            if(data) {                
                yield put({
                    type: 'setProperty',
                    payload: {
                        QR: data
                    }
                })
            }
            callback && callback() 
        },
        * getShortUrl({payload,callback},{select,call,put}){
            const {data} = yield call(getShortUrl, payload)
            if(data) {                
                yield put({
                    type: 'setProperty',
                    payload: {
                        shortUrl: data
                    }
                })
                callback && callback()
            }
             
        }
               
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },

    },
}
