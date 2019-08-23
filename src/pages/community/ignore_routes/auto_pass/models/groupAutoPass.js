import {
    groupAutoPass,
    updateGroupAutoPass,
} from 'community/services/autoConfirm'
import _ from 'lodash'

function getInitState() {
    return {
        forbid_repeat_group: false,
        status: false,
        white_list_limit: false,
    }
}

function transformData(data, cb = ()=>{}, blacklist = []) {
    const res = {}

    Object.keys(data).forEach((key) => {
        if(!blacklist.includes(key)){
            res[key] = cb(data[key])
        }
    })

    return res
}

export default {
    namespace: 'community_groupAutoPass',

    state: getInitState(),

    effects: {
        * groupAutoPass({payload, callback}, {call, put}) {
            let {data} = yield call(groupAutoPass, payload)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: transformData(data, Boolean),
                })
                callback && callback()
            }
        },
        * updateGroupAutoPass({payload, callback}, {call, put, select}) {
            const {
                // forbid_repeat_group,
                status,
                white_list_limit,
            } = yield select(({community_groupAutoPass}) => community_groupAutoPass)
            const fetchOption = Object.assign({
                // forbid_repeat_group,
                status,
                white_list_limit,
            }, payload)

            let {data} = yield call(updateGroupAutoPass, transformData(fetchOption, Number))
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: transformData(data, Boolean),
                })
                callback && callback()
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        assignStateByPath(state, action) {
            const payload = action.payload
            const oldValue = _.get(state, payload.path, {})
            _.set(state, payload.path, Object.assign(oldValue, payload.value))

            return _.cloneDeep(state)
        },
        setStateByPath(state, action) {
            const payload = action.payload
            _.set(state, payload.path, payload.value)

            return _.cloneDeep(state)
        },
        resetState() {
            return getInitState()
        },
    },
}
