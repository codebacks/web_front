
import { editName,customerList ,customerOrderList} from 'mall/services/customer'
import {parse} from 'qs'
export default {
    namespace: 'mall_customer',
    state: {
        data:[],
        count:'',
        loading:false,
        orderList:[],
        params: {
            begin_at:'',
            end_at:'',
            page:0,
            per_page:10,
            id:1,
            no:'',
            status:'',
            type:''
        },
        current:1
    },

    effects: {
        // 用户列表
        *customerList({ payload ,callback}, { call, put }) {
            yield put({ type: 'setProperty', payload: { loading: true }})
            const response = yield call(customerList, payload)
            const json =yield response.json()
            const count = response.headers.get('row_count')
            if(response){
                yield put({
                    type: 'setProperty',
                    payload: {
                        data:json,
                        count:Number(count)
                    }
                })
                callback && callback()
            }
            yield put({ type: 'setProperty', payload: { loading: false }})
        },
        // 编辑用户姓名
        *editName({payload, callback},{call,put}) {
            const response = yield call(editName,payload)
            callback && callback()
        },
        // 用户订单列表
        *customerOrderList({payload,callback},{select,call,put}){
            yield put({ type: 'setProperty', payload: { loading: true }})
            const response = yield call(customerOrderList,parse(payload))
            const json =yield response.json()
            const count = response.headers.get('row_count')
            if(response){
                yield put({
                    type: 'setProperty',
                    payload: {
                        orderList:json,
                        params:{
                            ...payload
                        },
                        count:Number(count),
                    }
                })
                callback && callback()
            }
            yield put({ type: 'setProperty', payload: { loading: false }})
        }


    },

    reducers: {
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    },
}
