import {query, create, update, get , remove } from '../../services/user'

export default {
    namespace: 'demo_user_index',
    state: {
        editModel: {},
        list: [],
        pagination: {}
    },
    effects: {
        * getEditModel({payload, callback}, {select, call, put}){
            
            const {data} = yield call(get, payload.id)

            yield put({
                type: 'setProperty',
                payload: {
                    editModel: data,
                },
            })

            callback && callback()
        },
        * query({payload, callback, onlyCallback}, {select, call, put}) {
            
            const {data, pagination} = yield call(query, payload.condition, payload.pageOptions)

            yield put({
                type: 'setProperty',
                payload: {
                    list: data,
                    pagination: pagination
                },
            })

            callback && callback()
        },
        * create({payload, callback}, { select, call, put}){
            yield call(create, payload.user)

            callback && callback()
        },
        * update({payload, callback}, { select, call, put}){
            yield call(update, payload.user)

            callback && callback()
        },
        * delete({payload, callback}, { select, call, put}){
            yield call(remove, payload)

            callback && callback()
        }
    },
    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    }
}