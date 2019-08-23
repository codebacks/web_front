import { query, create, modify, remove } from 'wx/services/replyCategories'
import { parse } from 'qs'
import _ from 'lodash'
// import {PriorityType} from 'config'

export default {
	namespace: 'wx_replyCategories',
	state: {
		list: [],
		loading: false,
		modifyLoading: false,
		activeId: '',
		selectedId: '',
		params: {
			type: 1
		}
	},

	subscriptions: {},

	effects: {
		* query ({payload, callback}, {call, put}) {
			const data = yield call(query, parse({type: 1}))
			if (data && data.data) {
				yield put({
					type: 'setProperty',
					payload: {
						list: data.data.filter((item) => {
							return item.type === 1
						})
					}
				})
			}
		},
		* create ({payload, callback}, {call, put}) {
			const data = yield call(create, parse(payload))
			if (data && data.data) {
				callback && callback()
			}
		},
		* modify ({payload, callback}, {select, call, put}) {
			const data = yield call(modify, payload)
			if (data && data.data) {
				callback && callback()
			}
		},
		* remove ({payload, callback}, {call, put}) {
			const data = yield call(remove, parse(payload))
			if (data) {
				yield put({
					type: 'removeSuccess',
					payload: {
						id: payload.id
					}
				})
				callback && callback()
			}
		},
	},

	reducers: {
		createSuccess (state, action) {
			let list = Array.from(state.list)
			list.unshift(action.payload.reply)
			return {...state, ...{list: list}, loading: false}
		},
		setProperty (state, action) {
			return {...state, ...action.payload}
		},
		modifySuccess (state, action) {
			const record = action.payload
			const newList = state.list.map(item => {
				if (item.id === record.id) {
					return {...item, ...record}
				}
				return item
			})
			return {...state, list: newList, modifyLoading: false, modifyModal: false}
		},
		removeSuccess (state, action) {
			let list = state.list.filter((item) => {
				return item.id !== action.payload.id
			})
			return {...state, ...{list: list}}
		}

	}
}