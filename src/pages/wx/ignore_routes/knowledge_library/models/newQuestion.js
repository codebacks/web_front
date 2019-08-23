import {
    getReplyContents,
    addQuestion,
    editQuestion,
} from 'wx/services/knowledgeLibrary'
import {parse} from "qs"
import _ from 'lodash'
import {message} from "antd"
import {safeJsonParse} from "utils"

function getInitState() {
    return {
        reply_contents: [], // 回复内容列表
        des: undefined, // 描述
        comment: undefined, // 备注
    }
}

function sortTable(table) {
    return table.sort((a, b) => {
        return a.ord - b.ord
    })
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

function getMaxObj(table) {
    let maxObj = {
        id: 0,
        ord: 0,
    }
    table.forEach((item) => {
        if(item.id > maxObj.id) {
            maxObj.id = item.id
        }
        if(item.ord > maxObj.ord) {
            maxObj.ord = item.ord
        }
    })
    return maxObj
}

export default {
    namespace: 'wx_newQuestion',
    state: getInitState(),
    effects: {
        * getQuestionContent({payload, callback}, {select, call, put}) {
            const { data } = yield call(getReplyContents, payload)
            if(data) {
                generateId(data.reply_contents, (item) => {
                    item.common_msg_content = {
                        type: item.common_msg_content_type,
                        values: safeJsonParse(item.common_msg_content_values),
                        source_type: item.common_msg_content_source_type,
                    }
                })
                yield put({
                    type: 'setProperty',
                    payload: {
                        reply_contents: data?.reply_contents,
                        des: data?.des,
                        comment: data?.comment,
                    },
                })
                callback && callback(data)
            }
        },
        * addQuestion({payload, callback}, {select, call, put}) {
            const wx_newQuestion = yield select(({wx_newQuestion}) => wx_newQuestion)
            const formData = Object.assign({}, wx_newQuestion)
            payload.body = formData
            const {meta} = yield call(addQuestion, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * editQuestion({payload, callback}, {select, call, put}) {
            const wx_newQuestion = yield select(({wx_newQuestion}) => wx_newQuestion)
            const formData = Object.assign({}, wx_newQuestion)
            payload.body = formData
            const {meta} = yield call(editQuestion, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * deleteReply({payload, callback}, {call, put, select}) {
            const table = yield select(({wx_newQuestion}) => wx_newQuestion.reply_contents)
            const index = table.findIndex((item) => item.id === payload.id)
            let newTable = table.slice()
            if(index > -1) {
                newTable.splice(index, 1)
            }
            yield put({
                type: 'setStateByPath',
                payload: {
                    path: 'reply_contents',
                    value: sortTable(newTable),
                },
            })
        },
        * editReply({payload, callback}, {call, put, select}) {
            const table = yield select(({wx_newQuestion}) => wx_newQuestion.reply_contents)
            const newTable = table.map((item) => {
                if(item.id === payload.id) {
                    return Object.assign({}, item, payload)
                }else {
                    return Object.assign({}, item)
                }
            })
            yield put({
                type: 'setStateByPath',
                payload: {
                    path: 'reply_contents',
                    value: sortTable(newTable),
                },
            })
        },
        * addReply({payload, callback}, {call, put, select}) {
            const table = yield select(({wx_newQuestion}) => wx_newQuestion.reply_contents)
            const {id, ord} = getMaxObj(table)
            payload.id = id + 1
            payload.ord = ord + 1
            const newTable = table.slice()
            newTable.push(payload)

            yield put({
                type: 'setStateByPath',
                payload: {
                    path: 'reply_contents',
                    value: sortTable(newTable),
                },
            })
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
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
