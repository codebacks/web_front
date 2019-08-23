import { getToken } from 'setting/services/shops'
import { getGoods, getCategory, createGoods, modifyGoods, getPostage } from 'mall/services/add_good'
export default {
    namespace: 'add_good',
    state: {
        data: {},
        photoToken: '',
        photoPrefix: '',
        categoryList: [],
        postageList: [],
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
            }
        },
        *getGoods({payload, callback},{call, put}){
            yield put({ type: 'setProperty'})
            const response = yield call(getGoods, payload)
            if(response){
                yield put({type: 'setProperty', payload: { data: response }})
                callback && callback(response)
            }
        },
        *createGoods({payload, callback},{call, put}){
            yield put({ type: 'setProperty'})
            const response = yield call(createGoods, payload)
            if(response){
                callback && callback(response)
            }
        },
        *modifyGoods({payload, callback},{call, put}){
            yield put({ type: 'setProperty'})
            const response = yield call(modifyGoods, payload)
            if(response){
                callback && callback(response)
            }
        },
        *getCategory({payload, callback},{call, put}){
            const data = yield call(getCategory, payload)
            if(data){
                yield put({type: 'setProperty', payload: {categoryList: data}})
                callback&&callback(data)
            }  
        },
        *getPostage({payload, callback},{call, put}){
            const data = yield call(getPostage, payload)
            if(data){
                yield put({type: 'setProperty', payload: {postageList: data}})
                callback&&callback(data)
            }  
        },
    },
    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        },
        initEditData(state){
            return {...state, ...{data: {}}}
        }
    },
}