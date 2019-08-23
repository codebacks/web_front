import {
    category,
    categoryUpdate,
} from 'wx/services/autoReply'
import {parse} from "qs"
import _ from 'lodash'
import {message} from "antd"
import {safeJsonParse} from 'utils'

function getInitState() {
    return {
        category: {
            des: '',
        },
        match_contents: {
            table: [],
            filter: [],
            current: 1,
            limit: 10,
            match_type: -1,
            content: '',
        },
        auto_reply_reply_contents: [],
    }
}

function sortTable(table) {
    return table.sort((a, b) => {
        return a.ord - b.ord
    })
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

export default {
    namespace: 'wx_Rules',

    state: getInitState(),

    effects: {
        * category({payload, callback}, {call, put}) {
            const {data} = yield call(category, {category_id: payload})

            if(data) {
                generateId(data.match_contents)
                generateId(data.auto_reply_reply_contents, (item) => {
                    item.common_msg_content = {
                        type: item.common_msg_content_type,
                        values: safeJsonParse(item.common_msg_content_values),
                        source_type: item.common_msg_content_source_type,
                    }
                })

                yield put({
                    type: 'setProperty',
                    payload: {
                        category: {
                            des: data.des,
                        },
                        match_contents: {
                            table: data.match_contents,
                            filter: [],
                            current: 1,
                            limit: 10,
                            match_type: -1,
                            content: '',
                        },
                        auto_reply_reply_contents: data.auto_reply_reply_contents,
                    },
                })
                yield put({
                    type: 'setFilterTable',
                })
            }
        },
        * categoryUpdate({payload, callback}, {call, put, select}) {
            const wx_Rules = yield select(({wx_Rules}) => wx_Rules)
            const formData = Object.assign({}, wx_Rules, {
                match_contents: wx_Rules.match_contents.table,
            })

            if(payload && payload.id) {
                formData.id = payload.id
            }

            if(!formData.category.des) {
                message.error('请添加问题描述')
                return
            }

            if(formData.category.des.length > 50) {
                message.error('问题描述不能大于50个字')
                return
            }

            if(!formData.match_contents.length) {
                message.error('请添加关键内容')
                return
            }

            if(!formData.auto_reply_reply_contents.length) {
                message.error('请添加回复内容')
                return
            }
            const {meta} = yield call(categoryUpdate, formData)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * deleteReply({payload, callback}, {call, put, select}) {
            const table = yield select(({wx_Rules}) => wx_Rules.auto_reply_reply_contents)
            const index = table.findIndex((item) => item.id === payload.id)
            let newTable = table.slice()
            if(index > -1) {
                newTable.splice(index, 1)
            }

            yield put({
                type: 'setStateByPath',
                payload: {
                    path: 'auto_reply_reply_contents',
                    value: sortTable(newTable),
                },
            })
        },
        * delete({payload, callback}, {call, put, select}) {
            const table = yield select(({wx_Rules}) => wx_Rules.match_contents.table)
            const index = table.findIndex((item) => item.id === payload.id)
            let newTable = table.slice()
            if(index > -1) {
                newTable.splice(index, 1)
            }

            yield put({
                type: 'assignStateByPath',
                payload: {
                    path: 'match_contents',
                    value: {
                        table: newTable,
                        current: 1,
                    },
                },
            })
            yield put({
                type: 'setFilterTable',
            })
        },
        * editReply({payload, callback}, {call, put, select}) {
            const table = yield select(({wx_Rules}) => wx_Rules.auto_reply_reply_contents)
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
                    path: 'auto_reply_reply_contents',
                    value: sortTable(newTable),
                },
            })
        },
        * edit({payload, callback}, {call, put, select}) {
            const table = yield select(({wx_Rules}) => wx_Rules.match_contents.table)
            const newTable = table.map((item) => {
                if(item.id === payload.id) {
                    return Object.assign({}, item, payload)
                }else {
                    return Object.assign({}, item)
                }
            })

            yield put({
                type: 'assignStateByPath',
                payload: {
                    path: 'match_contents',
                    value: {
                        table: newTable,
                    },
                },
            })
            yield put({
                type: 'setFilterTable',
            })
        },
        * addReply({payload, callback}, {call, put, select}) {
            const table = yield select(({wx_Rules}) => wx_Rules.auto_reply_reply_contents)
            const {id, ord} = getMaxObj(table)
            payload.id = id + 1
            payload.ord = ord + 1
            const newTable = table.slice()
            newTable.push(payload)

            yield put({
                type: 'setStateByPath',
                payload: {
                    path: 'auto_reply_reply_contents',
                    value: sortTable(newTable),
                },
            })
        },
        * add({payload, callback}, {call, put, select}) {
            const table = yield select(({wx_Rules}) => wx_Rules.match_contents.table)
            const {id, ord} = getMaxObj(table)
            payload.id = id + 1
            payload.ord = ord + 1
            const newTable = table.slice()
            newTable.push(payload)

            yield put({
                type: 'assignStateByPath',
                payload: {
                    path: 'match_contents',
                    value: {
                        table: newTable,
                    },
                },
            })
            yield put({
                type: 'setFilterTable',
            })
        },
        * search({payload, callback}, {call, put, select}) {
            const {match_type, content} = payload
            yield put({
                type: 'assignStateByPath',
                payload: {
                    path: 'match_contents',
                    value: {
                        match_type,
                        content,
                        current: 1,
                    },
                },
            })
            yield put({
                type: 'setFilterTable',
            })
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        setFilterTable(state) {
            const match_contents = state.match_contents
            const table = match_contents.table
            const content = match_contents.content
            const match_type = match_contents.match_type

            match_contents.filter = table.filter((item) => {
                const res = item.content.indexOf(content) > -1

                if(!res) {
                    return false
                }
                if(match_type === -1) {
                    return true
                }
                return match_type === item.match_type
            }).sort((a, b) => {
                return a.ord - b.ord
            })

            return {...state}
        },
        assignStateByPath(state, action) {
            const payload = action.payload
            const oldValue = _.get(state, payload.path, {})
            _.set(state, payload.path, Object.assign(oldValue, payload.value))

            return _.cloneDeep(state)
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
