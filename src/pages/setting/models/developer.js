
import { getDevelopInfo, newDevelopInfo, resetDevelopInfo } from 'setting/services/developer'
export default {
    namespace: 'setting_developer',
    state: {
        app_key: '',
        app_secret: '',
    },
    effects: {
        *getDevelopInfo({payload, callback},{call, put}){
            const data = yield call(getDevelopInfo, payload)
            if(data&&data.data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        app_key: data.data.app_key || '',
                        app_secret: data.data.app_secret || '',
                    },
                })
                callback && callback(data)
            }
        },
        *newDevelopInfo({payload, callback},{call, put}){
            const data = yield call(newDevelopInfo, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        app_key: data.data.app_key || '',
                        app_secret: data.data.app_secret || '',
                    },
                })
                callback && callback(data)
            }
        },
        *resetDevelopInfo({payload, callback},{call, put}){
            const data = yield call(resetDevelopInfo, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        app_key: data.data.app_key || '',
                        app_secret: data.data.app_secret || '',
                    },
                })
                callback && callback(data)
            }
        },
    },
    reducers: {
        setProperty(state, action){
            return {...state, ...action.payload}
        },
    },
}