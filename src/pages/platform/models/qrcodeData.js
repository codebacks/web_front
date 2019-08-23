/**
 **@Description:
 **@author: 吴明
 */

import {qrcodeData, qrcodeWechat,downloadExports,timeInterval} from 'platform/services/qrcodeData'

export default {
    namespace: 'platform_qrcodeData',
    state: {
        data:[],
        date:[],
        loading:false,
        //添加数
        addCount:[],
        shopList:[],
        //展示数
        displayCount:[],
        rows_found:'',
        wechat:[],
        title:[],
        echartData:[]
    },

    effects: {
        *qrcodeData({ payload ,callback}, { call, put }){
            const response = yield call (qrcodeData,payload)
            if(response.data.length>0){
                yield put({
                    type: 'setQrcodeData',
                    payload: {
                        echartData:response.data
                    }
                })
                callback && callback()
            }
        },
        *qrcodeWechat({ payload ,callback}, { call, put }){
            yield put({ type: 'setQrcodeWechat', payload: { loading: true }})
            const response = yield call (qrcodeWechat,payload)
            if (response.data.length>0){
                let arr = response.data[0].data
                let title= []
                for(var i = 0 ;i < arr.length ;i++){
                    let item = arr[i].createdAt.slice(5,10).replace('-','/')
                    title.push(item)
                }
                yield put({
                    type: 'setQrcodeWechat',
                    payload: {
                        wechat:response.data,
                        title: title,
                        rows_found:response.pagination.rows_found
                    }
                })
                callback && callback()
            }
            yield put({ type: 'setQrcodeWechat', payload: { loading: false }})
        },
        *downloadExports({ payload ,callback}, { call, put }){
            const response = yield call (downloadExports,payload)
            callback && callback(response)
        },
        *timeInterval({ payload ,callback}, { call, put }){
            const data = yield call (timeInterval,payload)
            callback && callback(data)
        },
    },

    reducers: {
        setQrcodeData(state,action) {
            return {
                ...state,
                ...action.payload
            }
        },
        setQrcodeWechat(state,action) {
            return {
                ...state,
                ...action.payload
            }
        }
    },
}
