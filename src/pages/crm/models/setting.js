// import {parse} from 'qs'

export default {
    namespace: 'crm_setting',
    state: {
        moduleName: ''
    },
    subscriptions: {},
    effects: {},

    reducers: {
        setModuleName(state, action) {
            return {...state, ...action.payload}
        }
    }
}