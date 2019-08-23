import {
    createTask,
    count,
} from 'crm/services/massSending'
import createModel from 'utils/model'
import moment from 'moment'

const format = 'HH:mm'

function getInitState() {
    return {
        count: '',
        messages: [],
        antdFrom: {
            filter_customer: {
                value: 0,
            },
            title: {
                value: '',
            },
            executeType: {
                value: 0,
            },
            executeRangeType: {
                value: 0,
            },
            execute_time: {
                value: null,
            },
            messageBetween: {
                value: [15, 40],
            },
            intervalBetween: {
                value: [60, 120],
            },
            time: {
                value: [moment('08:00', format), moment('18:00', format)],
            },
        },
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

export default createModel({
    namespace: 'crm_createMass',
    state: getInitState(),
    effects: {
        * sentMsgHandleSubmit({payload, callback}, {select, call, put}) {
            const fetchOption = Object.assign({}, payload)
            const res = yield call(createTask, fetchOption)
            if(res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        * count({payload, callback}, {select, call, put}) {
            const fetchOption = Object.assign({}, payload)
            const {data} = yield call(count, fetchOption)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        count: data,
                    },
                })
            }
        },
        * add({payload, callback}, {call, put, select}) {
            const table = yield select(({crm_createMass}) => crm_createMass.messages)
            const {id, ord} = getMaxObj(table)
            payload.id = id + 1
            payload.ord = ord + 1
            const newTable = table.slice()
            newTable.push(payload)

            yield put({
                type: 'setStateByPath',
                payload: {
                    path: 'messages',
                    value: sortTable(newTable),
                },
            })
        },
        * edit({payload, callback}, {call, put, select}) {
            const table = yield select(({crm_createMass}) => crm_createMass.messages)
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
                    path: 'messages',
                    value: sortTable(newTable),
                },
            })
        },
        * delete({payload, callback}, {call, put, select}) {
            const table = yield select(({crm_createMass}) => crm_createMass.messages)
            const index = table.findIndex((item) => item.id === payload.id)
            let newTable = table.slice()
            if(index > -1) {
                newTable.splice(index, 1)
            }

            yield put({
                type: 'setStateByPath',
                payload: {
                    path: 'messages',
                    value: sortTable(newTable),
                },
            })
        },
    },
    reducers: {},
})

