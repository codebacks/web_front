/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/5
 */

import _ from 'lodash'

const defaultOption = {
    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        assignState(state, action) {
            return _.defaultsDeep({}, action.payload, state)
        },
        assignStateByPath(state, action) {
            const {payload} = action

            return assignStateByPath({
                state,
                path: payload.path,
                value: payload.value,
                cloneDeep: !!payload.cloneDeep,
                assignStateDeep: !!payload.assignStateDeep,
            })
        },
        setStateByPath(state, action) {
            const {payload} = action

            return setStateByPath({
                state,
                path: payload.path,
                value: payload.value,
                cloneDeep: !!payload.cloneDeep,
            })
        },
    },
}

export function assignStateByPath({state, path, value, cloneDeep = true, assignStateDeep = true}) {
    const newState = cloneDeep ? _.cloneDeep(state) : _.clone(state)
    const oldValue = _.get(newState, path, {})
    const assignState = assignStateDeep
        ? _.defaultsDeep({}, value, oldValue)
        : _.defaults({}, value, oldValue)
    _.set(newState, path, assignState)

    return newState
}

export function setStateByPath({state, path, value, cloneDeep = true}) {
    const newState = cloneDeep ? _.cloneDeep(state) : _.clone(state)
    _.set(newState, path, value)

    return newState
}

export default function createModel(option = {}) {
    const initState = option.state

    if (typeof initState === 'function') {
        defaultOption.reducers.resetState = initState()
    } else {
        defaultOption.reducers.resetState = () => {
            return initState
        }
    }

    return _.defaultsDeep({}, option, defaultOption)
}
