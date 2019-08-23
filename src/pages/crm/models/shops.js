import {getShopListOauth} from "crm/services/shops"

export default {
    namespace: 'crm_shops',
    state: {
        shops: [],
    },

    subscriptions: {},

    effects: {
        * getShopListOauth({payload, callback},{select, call, put}){
            const {data} = yield call(getShopListOauth, {limit: 9999})
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        shops: data
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
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
    }
}
