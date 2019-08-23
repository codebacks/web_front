/**
 **@Description:
 **@author: leo
 */

import {query, create, update, remove} from 'setting/services/roles'
import {getTree} from 'services'
import {message} from 'antd'
import {treeForEach} from 'utils'
import {forEachParents} from 'setting/utils'

const isCheckParents = Symbol('isCheckParents')

function checkParents(activeRole, state) {
    if(activeRole && !activeRole[isCheckParents]) {
        const flatTree = state.flatTree
        const checkArr = activeRole.modules

        if(flatTree && flatTree.length && checkArr.length) {
            let isDeleted = false
            checkArr.forEach((id) => {
                const treeNode = flatTree.find((treeNode) => {
                    return String(treeNode.id) === String(id)
                })
                if(treeNode && treeNode.children && treeNode.children.length) {
                    const childLen = treeNode.children.length
                    let childCheck = 0
                    treeNode.children.forEach((item) => {
                        const treeNode = checkArr.find((cid) => {
                            return String(cid) === String(item.id)
                        })

                        if(treeNode) {
                            childCheck++
                        }
                    })

                    if(childLen !== childCheck) {
                        forEachParents(treeNode.children[0], (treeItem) => {
                            const index = checkArr.findIndex((cid) => {
                                return String(cid) === String(treeItem.id)
                            })
                            if(index > -1){
                                checkArr.splice(index, 1)
                                isDeleted = true
                            }
                        })
                    }
                }
            })
            if(isDeleted){
                activeRole.modules = checkArr.slice()
            }
        }
        activeRole[isCheckParents] = true
    }
}

export default {
    namespace: 'setting_rolePermission',

    state: {
        roles: [],
        activeRole: null,
        tree: [],
        flatTree: [],
        privileges: [],
    },

    effects: {
        * getTreeAndQuery({payload, callback}, {select, call, put, all}) {
            const [
                {data: queryData},
                {data: treeData},
            ] = yield all([
                call(query, payload),
                call(getTree, payload),
            ])

            if(treeData) {
                const flatTree = []
                const privileges = []
                treeForEach(treeData, (item, parent) => {
                    if(item.privilege === 2) {
                        privileges.push(item.id)
                    }
                    if(parent){
                        item.parent = parent
                    }
                    flatTree.push(item)
                })

                yield put({
                    type: 'setProperty',
                    payload: {
                        tree: treeData,
                        flatTree,
                        privileges,
                    },
                })
                callback && callback()
            }

            if(queryData) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        roles: queryData,
                    },
                })

                const activeRole = yield select(state => {
                    return state.setting_rolePermission.activeRole
                })

                if(!activeRole && queryData[0]) {
                    yield put({
                        type: 'setActiveRole',
                        payload: {
                            key: queryData[0].id,
                        },
                    })
                }else {
                    activeRole[isCheckParents] = false
                    yield put({
                        type: 'changeActiveRole',
                        payload: activeRole,
                    })
                }
            }

        },
        // * getTree({payload, callback}, {call, put}) {
        //     const {data} = yield call(getTree, payload)
        //
        //     if(data) {
        //         const flatTree = []
        //         treeForEach(data, (item) => {
        //             flatTree.push(item)
        //         })
        //         yield put({
        //             type: 'setProperty',
        //             payload: {
        //                 tree: data,
        //                 flatTree,
        //             },
        //         })
        //         callback && callback()
        //     }
        // },
        * query({payload, callback}, {select, call, put}) {
            const {data} = yield call(query, payload)

            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        roles: data,
                    },
                })

                const activeRole = yield select(state => {
                    return state.setting_rolePermission.activeRole
                })

                if(!activeRole && data[0]) {
                    yield put({
                        type: 'setActiveRole',
                        payload: {
                            key: data[0].id,
                        },
                    })
                }else {
                    activeRole[isCheckParents] = false
                    yield put({
                        type: 'changeActiveRole',
                        payload: activeRole,
                    })
                }

                callback && callback()
            }
        },
        * create({payload, callback}, {select, call, put}) {
            const {data} = yield call(create, payload)
            if(data) {
                callback && callback(data)
            }
        },
        * update({payload, callback}, {select, call, put}) {
            const {data} = yield call(update, payload)
            if(data) {
                yield put({
                    type: 'changeActiveRole',
                    payload,
                })
                callback && callback()
            }
        },
        * remove({payload, callback}, {select, call, put}) {
            const {meta} = yield call(remove, payload)

            if(meta && meta.code === 200) {
                yield put({
                    type: 'deleteActiveRole',
                    payload: {
                        key: payload.id,
                    },
                })
                callback && callback(meta)
            }else {
                callback && callback(meta)
            }
        },
        * updateActiveRole({payload, callback}, {select, call, put}) {
            const activeRole = yield select(state => {
                return state.setting_rolePermission.activeRole
            })

            if(activeRole && activeRole.id) {
                const {data} = yield call(update, {
                    id: activeRole.id,
                    name: activeRole.name,
                    modules: activeRole.modules.map(item => Number(item)),
                })
                if(data) {
                    message.success('更新成功')
                    callback && callback()
                }
            }else {
                message.error('请选择岗位')
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        setRoles(state, action) {
            const roles = state.roles
            return {...state, ...roles}
        },
        deleteActiveRole(state, action) {
            const key = action.payload.key

            if(state.activeRole.id === Number(key)) {
                return {...state, ...{activeRole: null}}
            }

            return state
        },
        setActiveRole(state, action) {
            const key = action.payload.key
            const activeRole = state.roles.find(role => {
                return role.id === Number(key)
            })

            if(activeRole) {
                checkParents(activeRole, state)
                return {...state, ...{activeRole: activeRole}}
            }
            return state
        },
        changeActiveRole(state, action) {
            const newActiveRole = {
                ...state.activeRole,
                ...action.payload,
            }
            checkParents(newActiveRole, state)
            return {
                ...state,
                ...{
                    activeRole: newActiveRole,
                },
            }
        },
    },
}
