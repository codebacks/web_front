import {
    list, detail, customerDetail, exportTask, exportStatus,
    getDivideOptions, setDivide,
    checkMass,
} from 'wx/services/friends/friends'
import {list as tags} from 'wx/services/tags'

function getInitParams() {
    return {
        query: '',
        wechat: {
            query: '',
            is_block: undefined, // boolean
            is_delete: false, // boolean
            remark: undefined, // 微信备注
            exclude_remark: undefined,  // 备注不包含
            source: '',
            sex: '', // 性别 0 未知, 1 男, 2 女，空 全部
            province: undefined, // 全部不传，未知传''
            province_id: '0',
            city: undefined,
        },
        create_time: '', // ,号隔开
        department_id: undefined,
        user_id: undefined,
        service_wx_id: undefined, // 所属微信
        // remark: '', // 备注, !非空
        // exclude_remark: '',  // 备注不包含
        tag: [], //前端使用传参时去掉
        exclude_tag: [], //前端使用传参时去掉
        // order_by: '', // 排序字段，字段名，前面加-降序，不加升序
        _sort: [], // 数组，field字段， order asc:升序，desc：降序
        limit: 10,
        offset: 0,
        group_id: undefined, // 分组id: -1为全部，传参时去掉
    }
}

const _state = {
    list: [],
    params: getInitParams(),
    searchParams: {},
    total: 0,
    current: 1,
    filterDelete: false,
    sortedInfo: null,
    tags: [],
    detail: {},
    customerDetail: {},
    selectedRowKeys: [],
    selectedRows: [],
    divideOptionsHasAll: [], // 分组的options
    divideOptions: [],
}
export default {
    namespace: 'wx_friends',
    state: {
        ..._state
    },

    subscriptions: {
    },

    effects: {
        * list({payload, callback}, {select, call, put}) {
            let params = yield select(({wx_friends}) => wx_friends.params) //取当前 state
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            let body = {...params}, _tags = []
            if(body.tag.length) {
                body.tag.forEach((tag) => {
                    _tags.push({value: tag, relation: '='})
                })
            }
            delete body.tag
            if(body.exclude_tag.length) {
                body.exclude_tag.forEach((tag) => {
                    _tags.push({value: tag, relation: '!='})
                })
            }
            delete body.exclude_tag
            if(_tags.length) {
                body.tags = _tags
            }

            for (let key in body) {
                if (body.hasOwnProperty(key) && body[key] === '' || (key === 'group_id' && body[key] === -1)) {
                    delete body[key]
                }
            }

            let wechat = {...body.wechat}

            for (let key in wechat) {
                if (wechat.hasOwnProperty(key)
                    && ((wechat[key] === '' && key !== 'province' && key !== 'city')
                        || typeof wechat[key] === 'undefined')
                        || key === 'province_id') {
                    delete wechat[key]
                }
            }

            if (!Object.keys(wechat).length) {
                delete body.wechat
            } else {
                body.wechat = wechat
            }

            let sort = [...body._sort]
            sort = sort.filter((item) => {
                return item.field && item.order
            })
            if (!sort.length) {
                delete body._sort
            }

            const res = yield call(list, {body: body})
            if (res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: res.data,
                        params: params,
                        total: res.pagination.rows_found,
                        current: parseInt(res.pagination.offset / res.pagination.limit, 10) + 1,
                        selectedRowKeys: [],
                        selectedRows: [],
                    }
                })
                yield put({
                    type: 'setProperty',
                    payload: {
                        searchParams: body,
                    },
                })
                callback && callback(res.data)
            }
        },

        * tags({payload, callback}, {select, call, put}) {
            const data = yield call(tags, payload)
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        tags: data.data,
                    },
                })
                callback && callback(data.data)
            }
        },
        * customerDetail({payload, callback}, {select, call, put}) {
            const res = yield call(customerDetail, payload)
            if (res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        customerDetail: res.data,
                    }
                })
                callback && callback(res.data)
            }
        },
        * detail({payload, callback}, {select, call, put}) {
            yield put({type: 'setProperty', payload: {loadingFriendDetail: true}})
            const res = yield call(detail, payload)
            if (res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        detail: res.data,
                    }
                })
                callback && callback(res.data)
            }
            yield put({type: 'setProperty', payload: {loadingFriendDetail: false}})

        },
        * exportTask({payload, callback}, {select, call, put}) {
            const res = yield call(exportTask, payload)
            if (res && res.data) {
                callback && callback(res.data)
            }
        },
        * exportStatus({payload, callback}, {select, call, put}) {
            const res = yield call(exportStatus, payload)
            callback && callback(res)
        },
        * getDivideOptions({payload}, {select, call, put, all}) {
            const divideData = yield call(getDivideOptions, {limit: 10000, offset: 0})
            if(divideData && divideData.meta?.code===200) {
                let divileList = [{group_id: 0, title: '未分组'}, ...divideData.data]
                let divideOptionsHasAll = divileList.map((item) => {
                    return {id: item.group_id, ...item}
                })
                let divideOptions = [...divideOptionsHasAll]
                divideOptionsHasAll.unshift({id: -1, title: '全部分组'})
                yield put({
                    type: 'setProperty',
                    payload: {
                        divideOptionsHasAll,
                        divideOptions: divideOptions
                    },
                })
            }
        },
        * setDivide({payload, callback}, {call, put}) {
            const data = yield call(setDivide, payload)
            if(data && data?.meta?.code === 200) {
                callback && callback(data.data)
            }
        },

        // 检查是否有群发次数
        * checkMass({payload, callback}, {call, put}) {
            let res = yield call(checkMass)
            if(res && res.meta && res.meta.code === 200) {
                callback && callback(res.data)
            }
        },

    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        resetParams(state, action) {
            return {...state, params: getInitParams()}
        }
    }
}
