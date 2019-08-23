/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/26
 */

import createModel from 'utils/model'
import {
    initOem,
} from 'common/oem'

export const {oemConfig} = initOem()

function getInitState() {
    return {
        oemConfig,
    }
}

export default createModel({
    namespace: 'oem',

    state: getInitState(),

    effects: {
        * getConfig({payload, callback}, {call, put}) {

        },
    },

    reducers: {},
})

