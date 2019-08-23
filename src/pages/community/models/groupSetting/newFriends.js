import {
    getConfig,
    getOneConfig,
    setOneConfig,
    createOneContent,
    deleteOneContent,
    updateOneContent,
    oneMove,
} from 'community/services/groupSetting/newFriends'
import createModel from 'utils/model'

function getInitState() {
    return {
        list: [],
        companyList: [],
        companyStatus: 0,
        companyDuration: 120,
        group_setting_type: '0',
        greet_duration_minutes: 120,
        operator: '',
        update_at: null,
        need_at: 0, // @群成员
    }
}

export default createModel({
    namespace: 'community_groupSetting_newFriends',

    state: getInitState(),

    effects: {
        * getConfig({payload, callback}, {call, put}) {
            const {data} = yield call(getConfig)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        companyList: data.greet_contents,
                        companyDuration: String(data.greet_duration_minutes),
                    },
                })
            }
        },
        * getOneConfig({payload, callback}, {call, put}) {
            const {data} = yield call(getOneConfig, payload)
            if(data) {
                const setProperty = {
                    list: data.greet_contents,
                    operator: data.operator,
                    update_at: data.update_at,
                }
                if(payload.init) {
                    setProperty.greet_duration_minutes = String(data.greet_duration_minutes)
                    setProperty.group_setting_type = String(data.group_setting_type)
                    setProperty.need_at = data.need_at

                    if(setProperty.group_setting_type === '0'){
                        yield put({
                            type: 'getConfig',
                        })
                    }
                }
                yield put({
                    type: 'setProperty',
                    payload: setProperty,
                })
            }
        },
        * setOneConfig({payload, callback}, {call, put, select}) {
            const {
                group_setting_type,
                greet_duration_minutes,
                need_at,
            } = yield select(({community_groupSetting_newFriends}) => community_groupSetting_newFriends)

            const fetchOption = Object.assign({
                group_setting_type: Number(group_setting_type),
                greet_duration_minutes: Number(greet_duration_minutes),
                need_at: need_at,
            }, payload)

            const {data} = yield call(setOneConfig, fetchOption)
            if(data) {
                callback && callback()
            }
        },
        * createOneContent({payload, callback}, {call, put}) {
            const {meta} = yield call(createOneContent, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * updateOneContent({payload, callback}, {call, put}) {
            const {meta} = yield call(updateOneContent, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * deleteOneContent({payload, callback}, {call, put}) {
            const {meta} = yield call(deleteOneContent, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * oneMove({payload, callback}, {call, put}) {
            const {meta} = yield call(oneMove, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
    },

    reducers: {},
})
