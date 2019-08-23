/*
 * @Author: sunlzhi 
 * @Date: 2018-11-16 14:34:31 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-11-19 17:12:17
 */
import { userGroupings, addGroup, deleteGroupings, customerList } from '../../services/customer_group/customer_group'
import {query as queryTags} from 'crm/services/tags'
import {parse} from 'qs'

export default {
    namespace: 'customer_group',

    state: {
        systemData: [],
        customData: [],
        customerList: [],
        customerPagination: {},
        tags: [],
    },

    effects: {
        * userGroupings({payload, callback}, {select, call, put}) {
            const data = yield call(userGroupings)

            if(data && data.data) {
                const userGroupingsData = data.data
                const customData = []
                const systemData = []
                if (userGroupingsData.length > 0) {
                    for (let v of userGroupingsData) {
                        if (v.is_system_default) {
                            systemData.push(v)
                        } else {
                            customData.push(v)
                        }
                    }

                    yield put({type: 'setProperty',payload: {systemData, customData}})
                }
                callback && callback(data)
            }
        },
        * addGroup({payload, callback}, {select, call, put}) {
            const { data } = yield call(addGroup, payload)
            if(data) {
                callback && callback(data)
            }
        },
        * deleteGroupings({payload, callback}, {select, call, put}) {
            const data = yield call(deleteGroupings, payload)
            if(data) {
                callback && callback()
            }
        },
        * customerList({payload, callback}, {select, call, put}) {
            const {data, pagination} = yield call(customerList, payload)
            if(data) {
                yield put({type: 'setProperty',payload: {customerList: data, customerPagination: pagination}})
                callback && callback()
            }
        },
        * queryTags({payload, callback}, {call, put}) {
            const data = yield call(queryTags, parse(payload))
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
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    },
}
