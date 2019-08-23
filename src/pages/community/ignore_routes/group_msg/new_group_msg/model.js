import {
    search,
    sendTask,
    exitsCount,
    groupingsSummary,
} from 'community/services/mass'
import createModel from 'utils/model'
import _ from 'lodash'
import moment from 'moment'

const allGroupId = -100
const format = 'HH:mm'

function spliceArrForMap(arr, map) {
    let mapLen = map.length
    for(let i = arr.length - 1; i > -1; i--) {
        const val = arr[i]
        if(map[val.id]) {
            arr.splice(i, 1)
            mapLen--
        }
        if(mapLen < 1) {
            break
        }
    }
}

function setWxGroupId(data) {
    data.forEach((item) => {
        item.id = getWxGroupId(item)
    })
    return data
}

function getWxGroupId(item) {
    return `${item.from.uin}_${item.target.username}`
}

function selectedFilter(item, {nickname, group_id}) {
    const name = item.target.nickname || item.target.display_name || ''
    let isGroup = true
    if(group_id !== allGroupId){
        isGroup = group_id === _.get(item, 'group.id', -1)
    }
    return name.indexOf(nickname) > -1 && isGroup
}



function getInitCheckWeChatGroupState() {
    return {
        groupingsSummary: [],
        wxData: [],
        wxFilter: {
            table: [],
            group_id: allGroupId,
            total: 0,
            current: 1,
            limit: 10,
            isSync: true,
            nickname: '',
            selectedRowKeysMap: {},
            selectedAll: false,
        },
        selected: {
            data: [],
            table: [],
            total: 0,
            current: 1,
            limit: 10,
            nickname: '',
            group_id:allGroupId,
        },
        exitsCountData: {
            exit_count: 0,
            is_not_owner_count: 0,
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

function getInitState() {
    return {
        stepsCurrent: 0,
        at: false,
        selectGroupWeChat: {
            selectedList: [],
            total: 0,
            current: 1,
            limit: 10,
        },
        checkWeChatGroup: getInitCheckWeChatGroupState(),
        sentMsg: {
            data: [],
            messages: [],
            antdFrom: {
                title: {
                    value: '',
                },
                executeType: {
                    value: 0,
                },
                execute_time: {
                    value: null,
                },
                between: {
                    value: [60, 120],
                },
                executeRangeType: {
                    value: 1,
                },
                time: {
                    value: [moment('08:00', format), moment('18:00', format)],
                },
                messageBetween: {
                    value: [15, 40],
                },
            },
        },
    }
}

export default createModel({
    namespace: 'community_automaticNewGroupMsg',

    state: getInitState(),

    effects: {
        *groupingsSummary({payload, callback}, {select, call, put}) {
            try {
                const {data} = yield call(groupingsSummary, payload)

                if (data) {
                    yield put({
                        type: 'setStateByPath',
                        payload: {
                            path: 'checkWeChatGroup.groupingsSummary',
                            value: data,
                        },
                    })

                    callback && callback(data)
                }
            } catch (e) {}
        },
        * add({payload, callback}, {call, put, select}) {
            const table = yield select(({community_automaticNewGroupMsg}) => community_automaticNewGroupMsg.sentMsg.messages)
            const {id, ord} = getMaxObj(table)
            payload.id = id + 1
            payload.ord = ord + 1

            const newTable = table.slice()
            newTable.push(payload)

            yield put({
                type: 'setStateByPath',
                payload: {
                    path: 'sentMsg.messages',
                    value: sortTable(newTable),
                },
            })
        },
        * edit({payload, callback}, {call, put, select}) {
            const table = yield select(({community_automaticNewGroupMsg}) => community_automaticNewGroupMsg.sentMsg.messages)
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
                    path: 'sentMsg.messages',
                    value: sortTable(newTable),
                },
            })
        },
        * delete({payload, callback}, {call, put, select}) {
            const table = yield select(({community_automaticNewGroupMsg}) => community_automaticNewGroupMsg.sentMsg.messages)
            const index = table.findIndex((item) => item.id === payload.id)
            let newTable = table.slice()
            if(index > -1) {
                newTable.splice(index, 1)
            }

            yield put({
                type: 'setStateByPath',
                payload: {
                    path: 'sentMsg.messages',
                    value: sortTable(newTable),
                },
            })
        },
        * sentMsgHandleSubmit({payload, callback}, {select, call, put}) {
            const fetchOption = Object.assign({}, payload)
            const res = yield call(sendTask, fetchOption)
            if(res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        * checkWeChatGroupSearch({payload, callback}, {select, call, put, all}) {
            yield put({
                type: 'setStateByPath',
                payload: {
                    path: 'checkWeChatGroup',
                    value: getInitCheckWeChatGroupState(),
                },
            })

            const is_owner = Number(yield select(({community_automaticNewGroupMsg}) => community_automaticNewGroupMsg.at))

            const selectedList = yield select(({community_automaticNewGroupMsg}) => community_automaticNewGroupMsg.selectGroupWeChat.selectedList)
            const uins = selectedList.map((item) => item.uin)

            let params = yield select(({community_automaticNewGroupMsg}) => community_automaticNewGroupMsg.checkWeChatGroup.params)
            const fetchOption = Object.assign({}, params)
            fetchOption.uins = uins
            fetchOption.is_owner = is_owner

            const [
                searchData,
                {data: countData},
            ] = yield all([
                call(search, fetchOption),
                call(exitsCount, {
                    uins,
                    is_owner,
                }),
            ])

            if(searchData) {
                yield put({
                    type: 'setStateByPath',
                    payload: {
                        path: 'checkWeChatGroup.wxData',
                        value: setWxGroupId(searchData.data),
                    },
                })
                yield put({
                    type: 'setWxFilter',
                    payload: {},
                })
            }

            if(countData) {
                yield put({
                    type: 'setStateByPath',
                    payload: {
                        path: 'checkWeChatGroup.exitsCountData',
                        value: countData,
                    },
                })
            }
        },
    },

    reducers: {
        nextStepsCurrent(state) {
            return {...state, ...{stepsCurrent: state.stepsCurrent + 1}}
        },
        prevStepsCurrent(state) {
            return {...state, ...{stepsCurrent: state.stepsCurrent - 1}}
        },
        filterReGroup(state) {
            const checkWeChatGroup = state.checkWeChatGroup
            const data = []
            const groupMap = {}
            state.checkWeChatGroup.selected.table.forEach((item) => {
                const username = item.target.username
                if(!groupMap[username]) {
                    data.push({
                        uin: item.from.uin,
                        friend_wx_id: username,
                    })
                    groupMap[username] = true
                }
            })

            state.sentMsg.data = data

            return {...state}
        },
        setWxFilter(state) {
            const wxData = state.checkWeChatGroup.wxData
            const wxFilter = state.checkWeChatGroup.wxFilter
            const isSync = wxFilter.isSync
            const nickname = wxFilter.nickname
            const group_id = wxFilter.group_id

            const table = wxData.filter((item) => {
                const target = item.target
                let itemIsSync = true
                if(isSync) {
                    itemIsSync = target.is_sync === true
                }
                const name = target.nickname || target.display_name || ''
                let isGroup = true
                if(group_id !== allGroupId){
                    isGroup = group_id === _.get(item, 'group.id', -1)
                }

                return itemIsSync && (name.indexOf(nickname) > -1) && isGroup
            })

            wxFilter.table = table

            return {...state}
        },
        setSelectedFilter(state) {
            const selected = state.checkWeChatGroup.selected
            const nickname = selected.nickname
            const group_id = selected.group_id

            const table = selected.data.filter((item) => {
                return selectedFilter(item, {nickname, group_id})
            })

            selected.table = table

            return {...state}
        },
        selectedAll(state, action) {
            const wxFilter = state.checkWeChatGroup.wxFilter
            const wxFilterTable = wxFilter.table
            const selectedAll = !wxFilter.selectedAll
            const selected = state.checkWeChatGroup.selected
            const nickname = selected.nickname
            const group_id = selected.group_id
            const table = []
            const selectedRowKeysMap = {}
            const data = []
            if(selectedAll) {
                for(let i = 0, len = wxFilterTable.length; i < len; i++) {
                    const val = wxFilterTable[i]
                    if(selectedFilter(val, {nickname, group_id})) {
                        table.push(val)
                    }
                    data.push(val)
                    selectedRowKeysMap[val.id] = true
                }
            }

            wxFilter.selectedRowKeysMap = selectedRowKeysMap
            selected.data = data
            selected.table = table
            wxFilter.selectedAll = selectedAll

            return {...state}
        },
        handleRemoveAll(state) {
            const wxFilter = state.checkWeChatGroup.wxFilter
            wxFilter.selectedRowKeysMap = {}
            wxFilter.selectedAll = false
            state.checkWeChatGroup.selected.table = []
            state.checkWeChatGroup.selected.data = []

            return {...state}
        },
        selectedRow(state, action) {
            const {checked, records, keys} = action.payload
            const wxFilter = state.checkWeChatGroup.wxFilter
            const selected = state.checkWeChatGroup.selected
            if(checked) {
                const table = selected.table
                const data = selected.data
                const nickname = selected.nickname
                const selectedRowKeysMap = wxFilter.selectedRowKeysMap
                const group_id = selected.group_id
                records.forEach((item) => {
                    if(!selectedRowKeysMap[item.id]) {
                        selectedRowKeysMap[item.id] = true
                        data.push(item)
                        if(selectedFilter(item, {nickname, group_id})) {
                            table.push(item)
                        }
                    }
                })
            }else {
                const selectedRowKeysMap = wxFilter.selectedRowKeysMap
                const deleteMap = {}
                keys.forEach((key) => {
                    deleteMap[key] = true
                    delete selectedRowKeysMap[key]
                })
                spliceArrForMap(selected.data, deleteMap)
                spliceArrForMap(selected.table, deleteMap)
            }

            return {...state}
        },
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
    },
})
