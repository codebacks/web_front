import _ from 'lodash'
import {list, create, update, remove, createText, batchRemove,
    tags, batchTag, updateTags,
    voiceConvert,
    groups, createGroup, updateGroup, removeGroup, batchGroup,
} from 'wx/services/material/library'
import {treeForEach} from 'utils'

// type 1: 文本，2：图片， 3：视频，4：文件，5：语音，6：网页，7：小程序，8：音乐，9：公众号名片

function getInitParams() {
    return {
        keyword: '', // 关键字搜索
        type: 1,
        only_mine: undefined, // 1 只看自己的
        tags: [], // 标签
        source: undefined, // 来源, 0:手动创建，1：牛客服添加
        department_id: undefined,
        user_id: undefined,
        limit: 20,
        offset: 0,
    }
}

function getInitState() {
    return {
        params: getInitParams(),
        list: [],
        selectedMaterials: [],
        total: 0,
        current: 0,
        groups: [],
        groupExpandedKeys: [],
        groupSelectedKey: null,
    }
}

export default {
    namespace: 'wx_material_library',

    state: getInitState(),

    effects: {
        * list({payload, callback}, {call, put, select}) {
            let {params, groupSelectedKey} = yield select(({wx_material_library}) => wx_material_library)

            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }

            let query = {...params}
            let tags = [...query.tags]
            if (tags.length) {
                tags = tags.map((item) => {
                    return encodeURIComponent(item)
                })
                tags = tags.join(',')
            } else {
                tags = ''
            }
            delete query.tags

            query.category_id = groupSelectedKey

            const res = yield call(list, {params: query, tags: tags})
            if (res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        params: params,
                    },
                })
                callback && callback(res.data, res.pagination, params.type)
            }
        },
        * query({payload, callback}, {call, put}) {
            let query = {...payload.params}
            let tags = [...query.tags]
            if (tags.length) {
                tags = tags.map((item) => {
                    return encodeURIComponent(item)
                })
                tags = tags.join(',')
            } else {
                tags = ''
            }
            delete query.tags
            const res = yield call(list, {params: query, tags: tags})
            if (res && res.data) {
                callback && callback(res.data, res.pagination)
            }
        },
        * create({payload, callback}, {call}) {
            const res = yield call(create, payload)
            if (res) {
                callback && callback(res)
            }
        },
        * update({payload, callback}, {call}) {
            const res = yield call(update, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        * remove({payload, callback}, {call}) {
            const res = yield call(remove, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        // 创建文本素材
        * createText({payload, callback}, {call}) {
            const res = yield call(createText, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        // 批量删除素材
        * batchRemove({payload, callback}, {call}) {
            const res = yield call(batchRemove, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        // 标签列表
        * tags({payload, callback}, {call, put}) {
            const res = yield call(tags)
            if (res && res.data) {
                callback && callback(res.data)
            }
        },
        // 批量打标
        * batchTag({payload, callback}, {call}) {
            const res = yield call(batchTag, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        // 管理标签
        * updateTags({payload, callback}, {call}) {
            const res = yield call(updateTags, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        // 语音转换
        * voiceConvert({payload, callback}, {select, call}) {
            const {data} = yield call(voiceConvert, payload)
            if (data) {
                callback && callback(data)
            }
        },
        // 分组列表
        * groups({payload, callback}, {select, call, put}) {
            const res = yield call(groups)
            if (res && res.data) {
                const {data} = res
                treeForEach(data, (item, parent) => {
                    item.parent = parent
                })

                const extraGroup = [{
                    children: [],
                    id: 0,
                    name: "未分组",
                    parent_id: 0,
                    priority: 0,
                }]
                const groups = extraGroup.concat(data)
                yield put({
                    type: 'setProperty',
                    payload: {
                        originGroups: data,
                        groups: groups,
                    },
                })

                const expandedKeys = yield select(({wx_material_library}) => wx_material_library.groupExpandedKeys)
                const groupExpandedKeys = groups.map((item) => {
                    return String(item.id)
                })
                if (!expandedKeys.length) {
                    yield put({
                        type: 'setProperty',
                        payload: {
                            groupExpandedKeys: groupExpandedKeys,
                        },
                    })
                }

                let groupSelectedKey = yield select(({wx_material_library}) => wx_material_library.groupSelectedKey)
                if(groupSelectedKey == null && groups[0]) {
                    yield put({
                        type: 'setProperty',
                        payload: {
                            groupSelectedKey: _.get(groups[0], 'id', '')
                        },
                    })
                }

                callback && callback(data)
            }
        },
        // 创建分组
        * createGroup({payload, callback}, {call}) {
            const res = yield call(createGroup, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback(res)
            }
        },
        // 更新分组
        * updateGroup({payload, callback}, {call}) {
            const res = yield call(updateGroup, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        // 删除分组
        * removeGroup({payload, callback}, {call}) {
            const res = yield call(removeGroup, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        // 批量分组
        * batchGroup({payload, callback}, {call}) {
            const res = yield call(batchGroup, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
    },

    reducers: {
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        updateGroupTree(state, action) {
            const groups = state.groups
            return {...state, ...groups}
        },
        resetParams(state, action) {
            return {...state, params: {...getInitParams(), ...action.payload}}
        },
        resetState() {
            return getInitState()
        }
    },
}
