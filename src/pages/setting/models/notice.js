/**
 **@Description:
 **@author: yecuilin
 */

import {getNoticeList,setReadStatus,getNoticeDetail} from 'setting/services/notice'

export default {
    namespace: 'setting_notice',

    state: {
        getNoticeList:[],
        getNoticeList_total:null,
        getNoticeDetail:{}
    },

    effects: {
        * getNoticeList({payload,callback}, {call, put}) {
            const data = yield call(getNoticeList, payload)
            if(data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        getNoticeList: data.data,
                        getNoticeList_total:data.pagination.rows_found
                    },
                })
            }
            callback && callback(data)
        },
        *setReadStatus({payload, callback},{select, call, put}){
            const data = yield call(setReadStatus, payload)
            if(data.data){
                yield put({
                    type: 'setProperty',
                })
            }
        },
        * getNoticeDetail({payload,callback}, {call, put}) {
            const data = yield call(getNoticeDetail, payload)
            if(data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        getNoticeDetail: data.data,
                    },
                })
                callback && callback(data)
            }
            
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    },
}
