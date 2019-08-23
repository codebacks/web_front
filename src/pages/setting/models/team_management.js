/**
 **@Description:
 **@author: leo
 */

import {tree, create, update, remove, move} from 'setting/services/departments'
import {
    create as createUser,
    update as updateUser,
    query as queryUsers,
    remove as removeUser,
    detail as detailUser,
    invitationInit,
} from 'setting/services/users'
import {update as updateCompany} from 'setting/services/company'
import {query as roles} from 'setting/services/roles'
import {AntdFormToObj} from 'setting/utils'
import {treeForEach} from 'utils'
import {forEachParents} from 'setting/utils'
import _ from 'lodash'

const initParams = {
    limit: 10,
    offset: 0,
    department_id: '',
    query: '',
    enabled: '',
    affiliated: '',
    role: '',
}

export default {
    namespace: 'setting_teamManagement',

    state: {
        tree: [],
        users: [],
        activeDepartment: null,
        params: {
            ...initParams,
        },
        total: 0,
        current: 1,
        userForm: {},
        roles: [],
        selectTree: [],
        invitationInit: {},
        expandedKeys: [],
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
        * selectTree({payload, callback}, {select, call, put}) {
            const {data} = yield call(tree, payload)

            if(data) {
                const userForm = yield select(({setting_teamManagement}) => setting_teamManagement.userForm)
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
        * tree({payload, callback}, {select, call, put}) {
            const {data} = yield call(tree, payload)

            if(data) {
                treeForEach(data, (item, parent) => {
                    item.parent = parent
                })

                yield put({
                    type: 'setProperty',
                    payload: {
                        tree: data,
                    },
                })
                const expandedKeys = yield select(({setting_teamManagement}) => setting_teamManagement.expandedKeys)
                if(!expandedKeys.length) {
                    yield put({
                        type: 'setProperty',
                        payload: {
                            expandedKeys: [String(_.get(data, '[0].id'))],
                        },
                    })
                }

                let activeDepartment = yield select(({setting_teamManagement}) => setting_teamManagement.activeDepartment)

                if(!activeDepartment && data[0]) {
                    yield put({
                        type: 'setActiveDepartment',
                        payload: data[0],
                    })
                }

                callback && callback()
            }
        },
        * queryUsers({payload, callback}, {select, call, put}) {
            let params = yield select(({setting_teamManagement}) => setting_teamManagement.params)
            params = {...params, ...payload.params}

            if(payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            let activeDepartment = yield select(({setting_teamManagement}) => setting_teamManagement.activeDepartment)
            if(activeDepartment) {
                params.department_id = activeDepartment.id
            }else {
                params.department_id = ''
            }

            const data = yield call(queryUsers, params)

            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        users: data.data,
                        params: params,
                        total: _.get(data, 'pagination.rows_found', 0),
                        current: payload.page === undefined ? 1 : payload.page,
                    },
                })
            }
        },
        * invitationInit({payload, callback}, {select, call, put}) {
            const {data} = yield call(invitationInit, payload)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        invitationInit: data,
                    },
                })
            }
        },
        * detailUser({payload, callback}, {select, call, put}) {
            const {data} = yield call(detailUser, payload)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        userForm: data,
                    },
                })
            }
        },
        * move({payload, callback}, {select, call, put}) {
            const {data} = yield call(move, payload)
            if(data) {
                yield put({
                    type: 'tree',
                    payload: {},
                })
                callback && callback()
            }
        },
        * create({payload, callback}, {select, call, put}) {
            const {data} = yield call(create, payload)
            if(data) {
                callback && callback()
            }
        },
        * update({payload, callback}, {select, call, put}) {
            const {data} = yield call(update, payload)
            if(data) {
                callback && callback()
            }
        },
        * remove({payload, callback}, {select, call, put}) {
            const {meta} = yield call(remove, payload)

            if(meta && meta.code === 200) {
                const activeDepartment = yield select(({setting_teamManagement}) => setting_teamManagement.activeDepartment)
                if(activeDepartment && activeDepartment.id === payload.id) {
                    yield put({
                        type: 'setProperty',
                        payload: {
                            activeDepartment: null,
                        },
                    })
                }
                callback && callback()
            }
        },
        * removeUser({payload, callback}, {select, call, put}) {
            const {meta} = yield call(removeUser, payload)

            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * createUser({payload, callback}, {select, call, put}) {
            const {data} = yield call(createUser, payload)
            if(data) {
                callback && callback()
            }
        },
        * enabled({payload, callback}, {select, call, put}) {
            const {data} = yield call(updateUser, payload)
            if(data) {
                callback && callback()
            }
        },
        * updateUser({payload, callback}, {select, call, put}) {
            let userForm = yield select(({setting_teamManagement}) => setting_teamManagement.userForm)
            userForm = AntdFormToObj(userForm)
            const {data} = yield call(updateUser, userForm)
            if(data) {
                callback && callback()
            }
        },
        * updateCompany({payload, callback}, {select, call, put}) {
            const {data} = yield call(updateCompany, payload)
            if(data) {
                let initData = yield select(({base}) => base.initData)
                yield put({
                    type: 'base/setProperty',
                    payload: {
                        initData: {
                            ...initData,
                            ...{
                                company: data,
                            },
                        },
                    },
                })
                callback && callback()
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
        updateTree(state, action) {
            const tree = state.tree
            return {...state, ...tree}
        },
        updateSelectTree(state, action) {
            const selectTree = state.selectTree
            return {...state, ...selectTree}
        },
        setActiveDepartment(state, action) {
            return {...state, ...{activeDepartment: action.payload}}
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
        resetParams(state, action){
            return {
                ...state, ...{
                    params: {
                        ...initParams,
                    },
                },
            }
        }
    },
}
