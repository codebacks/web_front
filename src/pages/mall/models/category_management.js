import { getToken } from 'setting/services/shops'
import { getCategory, addCategory, deleteCategory, updateCategory } from 'mall/services/category'

export default {
    namespace: 'category_management',
    state: {
        photoToken: '',
        photoPrefix: '',
        categoryList: [],
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
            }
        },
        *getCategory({payload, callback},{call, put}){
            const data = yield call(getCategory, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        categoryList: data
                    },
                })
                callback&&callback(data)
            }  
        },
        *addCategory({payload, callback},{call, put}){
            const data = yield call(addCategory, payload)
            if(data){
                callback&&callback(data)
            }  
        },
        *deleteCategory({payload, callback},{call, put}){
            const data = yield call(deleteCategory, payload)
            if(data){
                callback&&callback(data)
            }  
        },
        *updateCategory({payload, callback},{call, put}){
            const data = yield call(updateCategory, payload)
            if(data){
                callback&&callback(data)
            }  
        },
    }
}