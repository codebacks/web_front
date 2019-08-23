
import { shopOauthSucc, getOauthUrl } from 'setting/services/shops'
import { mpaAuth } from 'setting/services/mpa.js'
import { subAuth } from 'setting/services/subscription.js'
export default {
    namespace: 'setting_oauthResult',
    state: {
        auth_url: '',
    },
    effects: {
        *shopOauthSucc({payload, callback},{call, put}){
            const data = yield call(shopOauthSucc, payload)
            if(data){
                callback && callback(data)
            }
        },
        *getOauthUrl({payload, callback},{call, put}){
            const data = yield call(getOauthUrl, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        auth_url: data.data.auth_url,
                    },
                })
                callback && callback()
            }
        },
        *mpaAuth({payload, callback},{call, put}){
            const meta = yield call(mpaAuth, payload)
            callback && callback(meta)
        },
        *subAuth({payload, callback},{call, put}){
            const meta = yield call(subAuth, payload)
            callback && callback(meta)
        },
    },
    reducers: {
        setProperty(state, action){
            return {...state, ...action.payload}
        },
    },
}