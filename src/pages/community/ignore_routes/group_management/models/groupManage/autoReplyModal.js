import {
    queryAutoReplyGlobal,
    setAutoReplySetting,
    getAutoReplySetting,
    getAutoReplyTemplates,
    getAutoReplyReplyContents,
    getAutoReplyTemplateDetail,
} from 'community/services/groupManagement'
import createModel from 'utils/model'
import {safeJsonParse} from "utils"
import { parse } from 'qs'

function getInitState() {
    return {
        // 公共设置内容
        status: undefined,
        reply_duration: 30,
        need_at: 0, // @群成员
        need_ated_trigger: 0, // 关键词触发@回复者

        // 全局关键词列表
        globalKeywords: [],
        globalParams: {
            offset: 0,
            limit: 10,
        },
        globalTotal: 0,
        globalCurrent: 1,

        // 其他模板
        templateDetailList: [], // 模板详情列表

        wx_setting_type: 0, // 自动回复类型 (默认全局)
        replyObj: null, // 问题的回复内容（AddKeywordReply中添加回复内容请求到的）
        target_template_id: undefined, // 模板id
        templates: [], // 模板
    }
}

function generateId(table, cb) {
    let id = 0
    table.forEach((item) => {
        item.id = id++
        if(cb) {
            cb(item)
        }
    })
    return table
}

export default createModel({
    namespace: 'community_group_management_autoReplyModal',

    state: getInitState(),

    effects: {
        // 获取设置
        * getSetting({payload, callback}, {call, put}) {
            const {data} = yield call(getAutoReplySetting, payload)
            if(data) {
                const setProperty = {
                    reply_duration: Number(data.reply_duration)/60,
                    need_at: data.need_at,
                    need_ated_trigger: data.need_ated_trigger,
                }
                yield put({
                    type: 'setProperty',
                    payload: setProperty,
                })
                callback && callback(data)
            }
        },
        // 获取全局关键词
        * queryGlobal({payload, callback}, {select, call, put}) {
            let globalParams = yield select(({community_group_management_autoReplyModal}) => community_group_management_autoReplyModal.globalParams)
            globalParams = {...globalParams, ...payload.globalParams}
            if (payload.page) {
                globalParams.offset = globalParams.limit * (payload.page - 1)
            }
            const res = yield call(queryAutoReplyGlobal, parse(globalParams))
            const data = res?.data
            if (res && data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        globalKeywords: data.keywords,
                        globalParams: globalParams,
                        globalTotal: res?.pagination?.rows_found,
                        globalCurrent: payload.page === undefined ? 1 : payload.page,
                    }
                })
                callback && callback(data.keywords)
            }
        },
        // 获取模板
        * getTemplates({payload}, {select, call, put}) {
            const data = yield call(getAutoReplyTemplates, { offset: 0, limit: 10000,})
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        templates: data.data,
                    }
                })
            }
        },
        // 更新设置
        * setSetting({payload, callback}, {call, put, select}) {
            const {meta} = yield call(setAutoReplySetting, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        // 回复内容
        * getReplyContents({payload, callback}, {select, call, put}) {
            const { data } = yield call(getAutoReplyReplyContents, payload)
            if(data) {
                generateId(data.reply_contents, (item) => {
                    item.common_msg_content = {
                        type: item.common_msg_content_type,
                        values: safeJsonParse(item.common_msg_content_values),
                        source_type: item.common_msg_content_source_type,
                    }
                })
                if(payload?.isSetProperty) { // 给AddKeyword组件中：获取回复内容
                    yield put({
                        type: 'setProperty',
                        payload: {
                            replyObj: data,
                        }
                    })
                }
                callback && callback(data)
            }
        },
        // 其他模板-关键词列表
        * getTemplateDetail({payload, callback}, {select, call, put}) {
            const data = yield call(getAutoReplyTemplateDetail, payload)
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        templateKeywords: data.data,
                    }
                })
                callback && callback(data.data)
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetState() {
            return getInitState()
        },
    },
})
