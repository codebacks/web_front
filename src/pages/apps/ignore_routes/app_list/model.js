/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/28
 */

import {apps, previewApps, grantApp} from 'apps/services/apps'
import createModel from 'utils/model'

function getInitState() {
    return {
        apps: [],
        previewApps: [],
    }
}

export default createModel({
    namespace: 'apps_appList',

    state: getInitState(),

    effects: {
        *grantApp({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(grantApp, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            } catch (e) {}
        },
        * apps({payload, callback}, {select, call, put}) {
            try {
                const {data} = yield call(apps, payload)

                if (data) {
                    yield put({
                        type: 'setProperty',
                        payload: {
                            apps: data,
                        },
                    })

                    callback && callback(data)
                }
            }catch (e) {
            }
        },
        * previewApps({payload, callback}, {select, call, put}) {
            try {
                const {data} = yield call(previewApps, payload)

                if (data) {
                    yield put({
                        type: 'setProperty',
                        payload: {
                            previewApps: data,
                        },
                    })

                    callback && callback(data)
                }
            }catch (e) {
            }
        },
    },

    reducers: {},
})
