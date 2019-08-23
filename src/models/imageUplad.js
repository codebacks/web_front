import { getToken } from 'setting/services/shops'
export default {
    namespace: 'image_uplad',
    state: {
        photoToken: '',
        photoPrefix: '',
    },
    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        }
    },
    effects: {
        *getToken({payload, callback},{call, put}){
            const data = yield call(getToken, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        photoToken: data.data.token,
                        photoPrefix: data.data.prefix,
                    },
                })
                callback&&callback(data)
            }
        },
    }
}