/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/5
 */
import _ from "lodash"

export function assignStateByPath({state, path, value}) {
    const newState = _.cloneDeep(state)
    const oldValue = _.get(newState, path, {})
    _.set(newState, path, _.defaultsDeep({}, value, oldValue))

    return newState
}

export function setStateByPath({state, path, value}) {
    const newState = _.cloneDeep(state)
    _.set(newState, path, value)

    return newState
}