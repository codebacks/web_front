/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/1/30
 */

import {
    chatroomCommonsSettings,
    chatroomCommonsSetStatus,
} from 'community/services/groupSetting'
import createModel from 'utils/model'

export default createModel({
    namespace: 'community_groupSetting',
    state: {
        chatroomCommonsSettings: {},
    },
    effects: {
        * chatroomCommonsSettings({payload, callback}, {select, call, put}) {
            const {data} = yield call(chatroomCommonsSettings, payload)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        chatroomCommonsSettings: data,
                    },
                })
                callback && callback(data)
            }
        },
        * chatroomCommonsSetStatus({payload, callback}, {select, call, put}) {
            const {meta} = yield call(chatroomCommonsSetStatus, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
    },
    reducers: {},
})


