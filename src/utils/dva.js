/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/3/8
 */
import _ from 'lodash'

export const globalActionsType = {
    logout: 'leoGlobalActions/logout',
    resetState: 'leoGlobalActions/resetState',
}

export function resetState({namespace}) {
    dispatch({
        type: globalActionsType.resetState,
        payload: {
            namespace,
        },
    })
}

export function getDva() {
    return _.get(window, 'g_app', {})
}

export function getStore() {
    return getDva()._store
}

export function getState() {
    const store = getStore()
    if (store && typeof store.getState === 'function') {
        return store.getState()
    }
}

export function dispatch(...arg) {
    const store = getStore()
    if (store && typeof store.dispatch === 'function') {
        return store.dispatch(...arg)
    }
}
