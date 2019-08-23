import {friends} from 'services/wechats'
import {
    search,
    plans,
    stat,
    planCustomers,
    customerDetail,
    exportCustomers,
    queryExportCustomers,
    downloadExportCustomers,
    checkMass,
} from 'crm/services/customers/customers'
import {query as latestPlans} from 'crm/services/customers/plan'
import {query as queryTags} from 'crm/services/tags'
import {queryOrdersDetail, detail as orderDetail, queryOrderSummary} from 'crm/services/shops/order'
import {verifyMe} from 'services/users'
import {registerSmsCode} from 'services/register'
import {query as queryTransfer} from 'crm/services/shops/transfer'
import {parse} from 'qs'
import _ from 'lodash'

const params = {
    limit: 10,
    offset: 0,
    query: '', //搜索关键字，支持姓名，姓名拼音，唯一名(目前是手机号码),备注
    wechat: {
        query: undefined,
        is_delete: false,
    },
    create_time: '', // ,号隔开
    department_id: undefined,
    user_id: undefined,
    service_wx_id: undefined,
    gender: '', // 性别 0 未知, 1 男, 2 女，空 全部
    birth_year: '',  // 出生年
    birth_month: '',  // 出生月
    birth_day: '',  // 出生日
    province: undefined, // 全部不传，未知传''
    province_id: '0',
    city: undefined,
    remark: '', // 备注, !非空
    exclude_remark: '',  // 备注不包含
    //tags: [], //根据tag, exclude_tag
    tag: [], //前端使用传参时去掉
    exclude_tag: [], //前端使用传参时去掉
    order: {
        order_no: '', // 订单编号
        order_create_time: '',  // 订单开始和结束时间 ,隔开
        product_name: '',  // 产品名称
        exclude_product_name: '',  // 产品名称不包含
        buy_count: '',  // 购买数量, 起始数量和结束数量 ,隔开
        buy_amount: '',  // 购买金额, 起始金额和结束金额, 隔开
        is_not: 0, // 以上条件是否非操作, 例如指定时间内未购买过商品
        average_amount: '',  // 平均金额，逗号隔开，
        total_amount: '',  // 总金额，逗号隔开
    },
    member: {
        name: '',  // 会员名
        mobile: '',  // 手机号码
        platform: '', // 商城类型
        total_count: '',  // 单数
        transfer_count: '',  // 返现次数
        transfer_amount: '',  // 返现金额
        last_buy_time: '',  // 上次一次购买时间
        last_transfer_time: '', //上次转账时间
    },
}
export default {
    namespace: 'crm_customers',
    state: {
        searchParams: {},
        list: [],
        loading: false, //加载角色列表
        loadingDetail: false, //加载客户详情
        params: _.cloneDeep(params),
        current: 1,
        total: 0,
        createLoading: false,
        plans: [],
        latestPlans: [], //最近计划
        stat: {},
        transfers: [],
        orders: [],
        queryOrders: false,
        loadingOrder: false,
        loadingPlan: false,
        queryStat: false,
        loadingTransfer: false,
        loadingFriends: false,
        friends: [], //客户ID搜索所在微信号
        selectedRowKeys: [], //选中
        resultFriends: [], //所有匹配到的客户用于创建计划

        profile: {}, // 基本资料
        detail: {}, // 客户资料详情
        orderSummary: {}, // 订单摘要
        ordersDetail: [], // 订单详细列表
        ordersDetailParams: {
            limit: 10,
            offset: 0,
        },
        ordersDetailTotal: 0,
        ordersDetailCurrent: 1,

        exportCustomersLoading: false,
        exportToken: null,
    },

    subscriptions: {},

    effects: {
        * query({payload, callback, onlyCallback}, {select, call, put}) {
            yield put({type: 'setProperty', payload: {customerLoading: true}})
            let {params} = yield select(({crm_customers}) => crm_customers)
            let _params = {...params, ...payload.params}, _tags = []
            if(payload.page) {
                _params.offset = _params.limit * (payload.page - 1)
            }
            if(_params.tag.length) {
                _params.tag.forEach((tag) => {
                    _tags.push({value: tag, relation: '='})
                })
            }
            delete _params.tag
            if(_params.exclude_tag.length) {
                _params.exclude_tag.forEach((tag) => {
                    _tags.push({value: tag, relation: '!='})
                })
            }
            delete _params.exclude_tag
            if(_tags.length) {
                _params.tags = _tags
            }

            for(let key in _params) {
                if(_params.hasOwnProperty(key) && !_params[key] && key !== 'province' && key !== 'city' && _params[key] !== 0
                || (key === 'province_id')) {
                    delete _params[key]
                }
            }
            let _order = {..._params.order}
            for(let key in _order) {
                if(_order.hasOwnProperty(key) && !_order[key] && _order[key] !== 0) {
                    delete _order[key]
                }
            }
            let _member = {..._params.member}
            for(let key in _member) {
                if(_member.hasOwnProperty(key) && !_member[key] && _member[key] !== 0) {
                    delete _member[key]
                }
            }
            if(!Object.keys(_order).length || (Object.keys(_order).length === 1 && _order.hasOwnProperty('is_not'))) {
                delete _params.order

            }else {
                if(_order.is_not) {
                    _order.is_not = 1
                }else {
                    _order.is_not = 0
                }
                _params.order = _order
            }
            if(!Object.keys(_member).length) {
                delete _params.member
            }else {
                _params.member = _member
            }

            let data = yield call(search, parse(_params))

            if(data && data.data) {
                if(!onlyCallback) {
                    yield put({
                        type: 'querySuccess',
                        payload: {
                            list: data.data,
                            total: data.pagination.rows_found,
                            current: payload.page === undefined ? 1 : payload.page,
                            customerLoading: false,
                        },
                    })
                }else {
                    yield put({type: 'setProperty', payload: {customerLoading: false}})
                }
                yield put({
                    type: 'setProperty',
                    payload: {
                        searchParams: _params,
                    },
                })
                callback && callback(data.data)
            }else {
                yield put({type: 'setProperty', payload: {customerLoading: false}})
            }

        },
        * exportCustomers({payload, callback, onlyCallback}, {select, call, put}) {
            yield put({type: 'setProperty', payload: {exportCustomersLoading: true}})
            let {params, tags, exportToken} = yield select(({crm_customers}) => crm_customers)
            let _params = {...params, ...payload.params}, _tags = []
            if(payload.page) {
                _params.offset = _params.limit * (payload.page - 1)
            }
            const getTag = (tag_id) => {
                let res = tags.filter((item) => {
                    return item.id === window.parseInt(tag_id)
                })
                return res[0]
            }
            if(_params.tag_ids.length) {
                _params.tag_ids.forEach((tag_id) => {
                    let _tag = getTag(tag_id)

                    _tags.push({value: _tag.name, relation: '='})
                })
            }
            if(_params.exclude_tag_ids.length) {
                _params.exclude_tag_ids.forEach((tag_id) => {
                    let _tag = getTag(tag_id)
                    _tags.push({value: _tag.name, relation: '!='})
                })
            }
            if(_tags.length) {
                _params.tags = _tags
            }

            for(let key in _params) {
                if(_params.hasOwnProperty(key) && !_params[key] && key !== 'province' && key !== 'city' && _params[key] !== 0) {
                    delete _params[key]
                }
            }
            let _order = {..._params.order}
            for(let key in _order) {
                if(_order.hasOwnProperty(key) && !_order[key] && _order[key] !== 0) {
                    delete _order[key]
                }
            }
            let _member = {..._params.member}
            for(let key in _member) {
                if(_member.hasOwnProperty(key) && !_member[key] && _member[key] !== 0) {
                    delete _member[key]
                }
            }
            if(!Object.keys(_order).length || (Object.keys(_order).length === 1 && _order.hasOwnProperty('is_not'))) {
                delete _params.order

            }else {
                if(_order.is_not) {
                    _order.is_not = 1
                }else {
                    _order.is_not = 0
                }
                _params.order = _order
            }
            if(!Object.keys(_member).length) {
                delete _params.member
            }else {
                _params.member = _member
            }

            _params['token'] = window.localStorage.getItem('export_customers_token')

            let data = yield call(exportCustomers, parse(_params))

            if(data && data.data) {
                if(!onlyCallback) {
                    yield put({
                        type: 'querySuccess',
                        payload: {
                            exportCustomersLoading: false,
                        },
                    })
                }else {
                    yield put({type: 'setProperty', payload: {exportCustomersLoading: false}})
                }
                callback && callback(data)
            }else {
                yield put({type: 'setProperty', payload: {exportCustomersLoading: false}})
                callback && callback(data)
            }

        },
        * verifyMe({payload, callback}, {select, call, put}) {
            const {data} = yield call(verifyMe, payload)
            if(data && data.token) {
                window.localStorage.setItem('export_customers_token', data.token)
                yield put({
                    type: 'setProperty',
                    payload: {
                        exportToken: data.token,
                    },
                })
            }

            callback && callback(data)
        },
        * registerSmsCode({payload, callback}, {call, put, select}) {
            const data = yield call(registerSmsCode, payload)
            if(data.meta.code === 200) {
                callback && callback()
            }
        },
        * queryExportCustomers({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {queryExportCustomersLoading: true}})
            const data = yield call(queryExportCustomers, parse(payload))
            if(data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        detail: data.data,
                        queryExportCustomersLoading: false,
                    },
                })
                callback && callback(data.data)
            }else {
                yield put({type: 'setProperty', payload: {queryExportCustomersLoading: false}})
            }
        },
        * downloadExportCustomers({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {downloadExportCustomersLoading: true}})
            const data = yield call(downloadExportCustomers, parse(payload))
            if(data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        detail: data.data,
                        downloadExportCustomersLoading: false,
                    },
                })
                callback && callback(data)
            }else {
                callback && callback(data)
                yield put({type: 'setProperty', payload: {downloadExportCustomersLoading: false}})
            }
        },
        * queryOrdersDetail({payload, callback}, {select, call, put}) {
            yield put({type: 'setProperty', payload: {loadingOrders: true}})
            let params = yield select(({crm_customers}) => crm_customers.ordersDetailParams) //取当前 state
            params = {...params, ...payload.params}
            if(payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(queryOrdersDetail, parse(params))
            if(data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        ordersDetail: data.data,
                        loadingOrders: false,
                        ordersDetailParams: params,
                        ordersDetailTotal: data.pagination.rows_found,
                        ordersDetailCurrent: payload.page === undefined ? 1 : payload.page,
                    },
                })
                callback && callback(data.data)
            }else {
                yield put({type: 'setProperty', payload: {loadingOrders: false}})
            }
        },
        * queryOrderSummary({payload}, {call, put}) {
            let res = yield call(queryOrderSummary, parse(payload.params))
            if(res && res.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        orderSummary: res.data,
                    },
                })
            }
        },

        * queryDetail({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {loadingDetail: true}})
            const data = yield call(customerDetail, parse(payload))
            if(data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        detail: data.data,
                        loadingDetail: false,
                    },
                })
                callback && callback(data.data)
            }else {
                yield put({type: 'setProperty', payload: {loadingDetail: false}})
            }
        },

        * queryFriends({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {loadingFriends: true}})
            let res = yield call(friends, parse(payload))
            if(res && res.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        friends: res.data,
                        loadingFriends: false,
                    },
                })
                callback && callback(res.data)
            }else {

                yield put({type: 'setProperty', payload: {loadingFriends: false}})
            }
        },
        * queryTags({payload, callback}, {call, put}) {
            yield put({type: 'showLoading'})
            const data = yield call(queryTags, parse(payload))
            if(data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        tags: data.data,
                    },
                })
                callback && callback(data.data)
            }else {
                yield put({type: 'hideLoading'})
            }
        },
        // * queryDetail({payload, callback}, {call, put}) {
        //     yield put({type: 'setProperty', payload: {loadingDetail: true}})
        //     const data = yield call(detail, parse(payload.params))
        //     if (data && data.data) {
        //         yield put({
        //             type: 'setProperty',
        //             payload: {
        //                 detail: data.data,
        //                 loadingDetail: false
        //             }
        //         })
        //         callback && callback(data.data)
        //     } else {
        //         yield put({type: 'setProperty', payload: {loadingDetail: false}})
        //     }
        // },
        * queryPlans({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {loadingPlan: true}})
            const data = yield call(plans, parse(payload.params))
            if(data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        plans: data.data,
                        loadingPlan: false,
                    },
                })
                callback && callback(data.data)
            }else {
                yield put({type: 'setProperty', payload: {loadingPlan: false}})
            }
        },
        * queryLatestPlans({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {loadingPlan: true}})
            const data = yield call(latestPlans, parse(payload.params))
            if(data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        latestPlans: data.data,
                        loadingPlan: false,
                    },
                })
                callback && callback(data.data)
            }else {
                yield put({type: 'setProperty', payload: {loadingPlan: false}})
            }
        },
        * queryStat({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {loadingStat: true}})
            const data = yield call(stat, parse(payload.params))
            if(data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        stat: data.data,
                        loadingStat: false,
                    },
                })
                callback && callback(data.data)
            }else {
                yield put({type: 'setProperty', payload: {loadingStat: false}})
            }
        },
        * queryTransfer({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {loadingTransfer: true}})
            const data = yield call(queryTransfer, parse(payload.params))
            if(data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        transfers: data.data,
                        loadingTransfer: false,
                    },
                })
                callback && callback(data.data)
            }else {
                yield put({type: 'setProperty', payload: {loadingTransfer: false}})
            }
        },
        * orderDetail({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {loadingOrder: true}})
            const data = yield call(orderDetail, parse(payload.params))
            if(data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        orderDetail: data.data,
                        loadingOrder: false,
                    },
                })
                callback && callback(data.data)
            }else {
                yield put({type: 'setProperty', payload: {loadingOrder: false}})
            }
        },
        * savePlanCustomers({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {savePlanCustomersLoading: true}})
            const data = yield call(planCustomers, parse(payload))
            if(data && data.data) {
                callback && callback()
            }
            yield put({type: 'setProperty', payload: {savePlanCustomersLoading: false}})
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
            let params = {...state.params, ...action.payload}
            return {...state, ...{params: params}}
        },
        querySuccess(state, action) {
            return {...state, ...action.payload, loading: false}
        },
        resetParams(state, action) {
            return {...state, ...{params: {...params, ...action.payload}}}
        },
    },
}
