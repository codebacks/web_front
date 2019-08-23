/**
 * @Description 白名单
 * @author XuMengPeng
 * @date 2018/12/13
*/
import {parse} from 'qs'
import { whitelistList, whitelistEditRemark, whitelistRemove, whitelistSearchWx, whitelistAdd } from "wx/services/whitelist"
// import moment from "moment/moment"

const params = {
	limit: 10,
	offset: 0,
	key: '',
	start_time: '',// moment().subtract(7, 'days').format(DateFormat) + ' 00:00:00',
	end_time: '',// moment().format(DateFormat) + ' 23:59:59',
}

const addModalParams = {
	key: '',
}

export default {
	namespace: 'wx_whitelist',
	state: {
		params: {
			...params
		},
		addModalParams: {
			...addModalParams
		},
		list: [],
		total: 0,
		current: 1,
		recordRemark: '', // 单个修改备注
		addModalList: [], //下面是用于add弹窗
		addRemark: '',
		addWxId: '',
	},
	subscriptions: {},
	effects: {
		* query({payload, callback}, {select, call, put}) {
			let params = yield select(({wx_whitelist}) => wx_whitelist.params)
			params = {...params, ...payload.params}
			if (payload.page) {
				params.offset = params.limit * (payload.page - 1)
			}
			const data = yield call(whitelistList, parse(params))
			if (data && data.data) {
				yield put({
					type: 'setProperty',
					payload: {
						list: data.data,
						params: params,
						total: data.pagination.rows_found,
						current: payload.page === undefined ? 1 : payload.page
					}
				})
				callback && callback(data.data)
			}
		},
		* whitelistEditRemark({payload, callback}, {select, call, put}) {
			const data = yield call(whitelistEditRemark, payload) // payload.id, payload.body={remark:''}
			if (data && data.meta?.code===200) {
				callback && callback(data.data)
			}
		},
		* whitelistRemove({payload, callback}, {select, call, put}) {
			const data = yield call(whitelistRemove, payload) // payload.id
			if (data && data.meta?.code===200) {
				callback && callback(data.data)
			}
		},
		* whitelistSearchWx({payload, callback}, {select, call, put}) {
			let addModalParams = yield select(({wx_whitelist}) => wx_whitelist.addModalParams)
			// addModalParams = {...addModalParams, ...payload.addModalParams}
			const data = yield call(whitelistSearchWx, parse(addModalParams))
			if (data && data.data) {
				yield put({
					type: 'setProperty',
					payload: {
						addModalList: data.data,
					}
				})
				callback && callback(data.data)
			}
		},
		* whitelistAdd({payload, callback}, {select, call, put}) {
            console.log('payload:', payload)
            const data = yield call(whitelistAdd, payload) // payload.body={wechat_id: '', remark:''}
            if (data && data.meta?.code === 200) {
                callback && callback(data.data)
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
			return {...state, params}
		},
		resetModalParams(state, action) {
			return {...state, addModalParams}
		},
	}
}