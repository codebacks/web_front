/**
 * 文件说明: 菜单模型
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期 18/08/01
 */

import { query } from 'demo/services/menu'

export default {
    namespace: 'demo_menu',

    state: {
        list: [],
    },

    effects: {
        *query({ payload, callback }, { select, call, put }) {
            const data = yield call(query)
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.data,
                    },
                })
                callback && callback(data.data)
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        },
    },
}
