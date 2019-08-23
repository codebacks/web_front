import {querySiderMenu} from 'crm/services'
// import {parse} from 'qs'

export default {
    namespace: 'crm_base',

    state: {
        menuData: [],
    },

    effects: {
        * querySiderMenu({payload, callback}, {select, call, put}) {
            const data = yield call(querySiderMenu)
            if(data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        menuData: data.data,
                    },
                })
                callback && callback(data.data)
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    },
}
