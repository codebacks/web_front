import {parse} from 'qs'
import {pressOrder,payment,recharge,smsCount } from '../../services/customerPool/paySMS';


export default {
    namespace: 'crm_customerPool_paySMS',
    state: {

    },

    effects: {
        *pressOrder({payload, callback}, {select, call, put}) {
            const data = yield call(pressOrder, payload)
            if (data && data.data) {
                callback && callback(data)
            } 
        },
        *payment({payload, callback}, {select, call, put}) {
            const data = yield call(payment, payload)
            if (data && data.data) {
                callback && callback(data.data.pay_url)
            } 
        },
        *recharge({payload, callback}, {select, call, put}) {
            const {data} = yield call(recharge, payload)
            if (data) {
                callback && callback(data)   
            }            
        },
        *smsCount({payload, callback}, {select, call, put}) {
            const data = yield call(smsCount, payload)
            if (data && data.data) {
                callback && callback(data.data.message_count)
            } 
        }
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        }
    }
}
