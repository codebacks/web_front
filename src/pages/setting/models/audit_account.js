/**
 **@Description:
 **@author: leo
 */

import {tree} from 'setting/services/departments'
import {
    invitationVerify,
    invitations,
} from 'setting/services/users'
import {query as roles} from 'setting/services/roles'
import {AntdFormToObj} from 'setting/utils'
import {forEachParents} from 'setting/utils'
import {treeForEach} from 'utils'

export default {
    namespace: 'setting_auditAccount',

    state: {
        invitations: [],
        userForm: {},
        roles: [],
        selectTree: [],
        params: {
            limit: 10,
            offset: 0,
        },
        total: 0,
        current: 1,
        selectTreeExpandedKeys: [],
        searchValue: '',
    },

    effects: {
        * roles({payload, callback}, {select, call, put}) {
            const {data} = yield call(roles, payload)

            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        roles: data,
                    },
                })
            }
        },
        * invitations({payload, callback}, {select, call, put}) {
            let params = yield select(({setting_auditAccount}) => setting_auditAccount.params)
            params = {...params, ...payload.params}

            if(payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }

            const data = yield call(invitations, params)

            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        invitations: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page,
                    },
                })
                callback && callback()
            }
        },
        * noPass({payload, callback}, {select, call, put}) {
            const {data} = yield call(invitationVerify, payload)
            if(data) {
                callback && callback()
            }
        },
        * updateUser({payload, callback}, {select, call, put}) {
            let userForm = yield select(({setting_auditAccount}) => setting_auditAccount.userForm)
            userForm = AntdFormToObj(userForm)
            if(payload.isAdmin) {
                userForm.type = 0
            }else {
                userForm.type = Number(userForm.type)
            }

            userForm.remark = userForm.adminRemark

            const params = {
                id: userForm.id,
                user: userForm,
                verify_status: payload.verify_status,
            }
            const {data} = yield call(invitationVerify, params)
            if(data) {
                callback && callback()
            }
        },
        * selectTree({payload, callback}, {select, call, put}) {
            const {data} = yield call(tree, payload)

            if(data) {
                const userForm = yield select(({setting_auditAccount}) => setting_auditAccount.userForm)
                const departments = userForm.departments
                const selectTreeExpandedKeys = []
                if(departments.length) {
                    treeForEach(data, (item, parent) => {
                        item.parent = parent
                        const index = departments.findIndex((department) => {
                            return department.id === item.id
                        })
                        if(index > -1) {
                            forEachParents(item, (parent) => {
                                if(!selectTreeExpandedKeys.some((expandedKey) => String(expandedKey) === String(parent.id))) {
                                    selectTreeExpandedKeys.push(String(parent.id))
                                }
                            })
                        }
                    })
                }

                yield put({
                    type: 'setProperty',
                    payload: {
                        selectTree: data,
                        selectTreeExpandedKeys,
                    },
                })
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        searchTreeChange(state, action) {
            const value = action.payload
            const {selectTree} = state
            const selectTreeExpandedKeys = []
            treeForEach(selectTree, (item, parent) => {
                item.parent = parent
                const index = item.name.indexOf(value)
                if(index > -1) {
                    forEachParents(item, (parent) => {
                        if(!selectTreeExpandedKeys.some((expandedKey) => String(expandedKey) === String(parent.id))) {
                            selectTreeExpandedKeys.push(String(parent.id))
                        }
                    })
                }
            })

            return {
                ...state,
                ...{
                    searchValue: value,
                    selectTreeExpandedKeys,
                },
            }
        },
        setUserForm(state, action) {
            const userForm = state.userForm
            const form = action.payload
            Object.keys(form).forEach((key) => {
                userForm[key] = form[key]
            })

            return {
                ...state,
                ...{
                    userForm: userForm,
                },
            }
        },
        updateSelectTree(state, action) {
            const selectTree = state.selectTree
            return {...state, ...selectTree}
        },
        setParams(state, action) {
            return {
                ...state, ...{
                    params: {
                        ...state.params,
                        ...action.payload,
                    },
                },
            }
        },
    },
}
