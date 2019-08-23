import _ from 'lodash'
import {
    list,
    create,
    filterFriends,
    groupParams,
    groupDetail,
} from 'crm/services/massMsg/group'
import {query as queryTags} from 'crm/services/tags'
import {parse} from "qs"

const params = {
    limit: 10,
    offset: 0,
    name: '',
    last_send_time: '', // 最后群发时间，逗号隔开
}

const filterParams = {
    create_time: '', // 创建时间，逗号隔开
    province: undefined,
    city: undefined,
    sexes: [], // 性别，number
    remark: '', // 备注
    exclude_remark: '',  // 备注不包含
    tag: [], // 包含标签
    exclude_tag: [], // 不包含标签
    // 订单
    order: {
        is_not: 0, // 是否取反
        product_name: '',  // 产品名称
        order_create_time: '', // 订单开始和结束时间, ,隔开
        buy_amount: '', // 订单金额, 订单金额, 逗号隔开
    },
}

const createParams = {
    name: '', // 分组名称
    params: {} // 参数
}

export default {
    namespace: 'crm_mass_msg_group',

    state: {
        params: {
            ...params
        },

        // 筛选
        filterParams: {
            ...filterParams
        },

        // 筛选条件
        searchParams: {},

        // 好友筛选
        friendsParams: {
            limit: 10,
            offset: 0,
        },
        friends: [],
        friendsTotal: 0,
        friendsCurrent: 1,

        // 创建
        createParams: {
            ...createParams
        },
        list: [],
        tags: [], // 标签
        total: 0,
        current: 1,

        step: 1,

    },

    effects: {
        * list({payload}, {call, put, select}) {
            let params = yield select(({crm_mass_msg_group}) => crm_mass_msg_group.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(list, parse(params))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page,
                    },
                })
            }
        },

        * filterFriends({payload, callback}, {select, call, put}) {
            let {filterParams, friendsParams: params} = yield select(({crm_mass_msg_group}) => crm_mass_msg_group)
            let _params = _.cloneDeep(filterParams)
            let _tags = []
            if(_params.tag){
                if (_params.tag.length) {
                    _params.tag.forEach((tag) => {
                        _tags.push({value: tag, relation: '='})
                    })
                }
                if (_params.exclude_tag.length) {
                    _params.exclude_tag.forEach((tag) => {
                        _tags.push({value: tag, relation: '!='})
                    })
                }
                if (_tags.length) {
                    _params.tags = _tags
                }
            }

            for (let key in _params) {
                if (_params.hasOwnProperty(key) && key === 'tag' || key === 'exclude_tag') {
                    delete _params[key]
                }
            }
            params = {...params, ...payload}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }

            let data = yield call(filterFriends, parse({
                body: {
                    ..._params,
                    ...params
                }
            }))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        friends: data.data,
                        friendsParams: params,
                        friendsTotal: data.pagination.rows_found,
                        friendsCurrent: payload.page === undefined ? 1 : payload.page,
                        createParams: {...createParams, ...{params: _params}},
                    }
                })
                callback && callback()
            }
        },

        * create({callback, payload}, {call, put, select}) {
            let {createParams: params} = yield select(({crm_mass_msg_group}) => crm_mass_msg_group)
            let res = yield call(create, parse(params))
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },

        * queryTags({payload, callback}, {call, put}) {
            const data = yield call(queryTags, parse(payload.params))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        tags: data.data
                    }
                })
                callback && callback(data.data)
            }
        },

        * groupDetail({payload, callback}, {call, put}) {
            const data = yield call(groupDetail, parse(payload))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        searchParams: data.data.params
                    }
                })
                callback && callback(data.data)
            }
        }
    },

    reducers: {
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetParams(state,) {
            return {...state, params}
        },
        resetFilterParams(state) {
            return {...state, filterParams}
        },
        resetCreateParams(state) {
            return {...state, createParams}
        },
    },
}
