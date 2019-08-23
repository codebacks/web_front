import React, {Component} from 'react'
import {Form, Input, Button, Row, Col, Tabs, Pagination, message, Checkbox, Spin, Select, Modal, Tree, Icon, Menu} from 'antd'
import {connect} from 'dva'
import _ from 'lodash'
import ContentHeader from 'components/business/ContentHeader'
import documentTitleDecorator from 'hoc/documentTitle'
import ImagePreview from 'components/business/ImagePreview'
import VideoPreview from 'components/business/VideoPreview'
import config from 'wx/common/config'
import helper from 'wx/utils/helper'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import TagManagement from './components/TagManagement'
import Text from './components/Text'
import BatchTag from './components/BatchTag'
import BatchGroup from './components/BatchGroup'
import Image from './components/Image'
import Video from './components/Video'
import File from './components/File'
import Voice from './components/Voice'
import WebPage from './components/WebPage'
import MiniApp from './components/MiniApp'
import Music from './components/Music'
import OfficialAccount from './components/OfficialAccount'
import ModalForm from './components/Group/ModalForm'
import HzDropdown from './components/Group/HzDropdown'
import {source, titleMaxLength, imageType, subFileType, groupNameMaxLength} from './config'
import utils from './utils'
import styles from './index.scss'

const FormItem = Form.Item
const Option = Select.Option
const TreeNode = Tree.TreeNode
const MenuItem = Menu.Item
const TabPane = Tabs.TabPane
const confirm = Modal.confirm

const {pageSizeOptions, materialType} = config

@connect(({ base, wx_material_library, loading}) => ({
    base,
    wx_material_library,
    listLoading: loading.effects['wx_material_library/list'],
    createLoading: loading.effects['wx_material_library/create'],
    removeLoading: loading.effects['wx_material_library/remove'],
    groupTreeLoading: loading.effects['wx_material_library/groups'],
    createGroupLoading: loading.effects['wx_material_library/createGroup'],
    updateGroupLoading: loading.effects['wx_material_library/updateGroup'],
}))
@documentTitleDecorator()
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tags: [],
            record: {},
            selectedMaterials: [],
            batchTagVisible: false,
            tagManagementVisible: false,
            batchGroupVisible: false,
            imageUrl: '',
            imageVisible: false,
            videoSource: '',
            videoVisible: false,
            currentType: materialType.text.type,
            lists: {},
            totalFileList: [],
            fileList: [],
            imageFileList: [],
            videoFileList: [],
            creatingTypes: [],

            groupFormProp: {},
        }
    }

    componentDidMount() {
        this._isMounted = true
        this.loadTags()
        this.loadGroupTree(() => {
            this.handleSearch()
        })
    }

    componentWillUnmount() {
        this._isMounted = false
        this.props.dispatch({
            type: 'wx_material_library/resetState',
        })
    }

    loadGroupTree = (callback) => {
        this.props.dispatch({
            type: 'wx_material_library/groups',
            payload: {},
            callback,
        })
    }

    loadTags = () => {
        this.props.dispatch({
            type: 'wx_material_library/tags',
            payload: {},
            callback: (data) => {
                if (this._isMounted) {
                    this.setState({
                        tags: data
                    })
                    this.filterTags(data)
                }
            }
        })
    }

    filterTags = (tags) => {
        let params = {...this.props.wx_material_library.params}
        params.tags = params.tags.filter((v) => {
            return tags.includes(v)
        })
        this.setParams(params)
    }

    handleSearch = () => {
        this.resetSelection() // 重置
        this.goPage(1)
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }

        if (key === 'keyword') {
            val = val.trim()
        }

        let params = {...this.props.wx_material_library.params}
        params[key] = val

        if (key === 'department_id') {
            params['user_id'] = undefined
        }

        if (key === 'user_id') {
            if (params.only_mine) {
                params['only_mine'] = undefined
                this.setParams(params)
                this.handleSearch()
                return
            }
        }

        this.setParams(params)
    }

    setParams = (params) => {
        this.props.dispatch({
            type: 'wx_material_library/setParams',
            payload: {
                params: params,
            },
        })
    }

    handleCheckChange = (e) => {
        const checked = e.target.checked
        let params = {...this.props.wx_material_library.params}
        if (checked) {
            params.only_mine = 1
            if(params.user_id) {
                params.user_id = undefined
            }
        } else {
            params.only_mine = undefined
        }
        this.setParams(params)
        this.handleSearch()
    }

    onTreeClick = (item, e) => {
        e.stopPropagation()
        item.select = !item.select
        this.props.dispatch({
            type: 'wx_material_library/updateGroupTree',
            payload: {}
        })
    }

    getPopupContainer = () => {
        let container = document.body
        const content = document.getElementById('wxMaterialLibraryMain')
        if(content) {
            container = content
        }
        return container
    }

    onTreeDropdownClick = (item, action, e) => {
        e.domEvent && e.domEvent.stopPropagation()

        if(item) {
            item.select = !item.select
        }

        let groupFormProp = {
            visible: true,
            label: '分组名称',
            placeholder: '请输入分组名称',
            validateRe: {
                pattern: new RegExp(`^.{1,${groupNameMaxLength}}$`),
                message: `限${groupNameMaxLength}个字`,
            },
        }
        if (action === 'create') {
            groupFormProp.title = item ? '添加子分组' : '添加分组'
            groupFormProp.data = {
                actionName: 'create',
                parent_id: item && item.id,
            }
        } else if (action === 'update') {
            groupFormProp.title = '修改分组'
            groupFormProp.data = {
                actionName: 'update',
                id: item.id,
            }
            groupFormProp.initialValue = item.name
        } else if (action === 'remove') {
            groupFormProp = {}

            this.handleRemoveGroup(item.id)
        }

        this.setState({
            groupFormProp,
        })
    }

    handleRemoveGroup = (id) => {
        confirm({
            icon: 'info-circle',
            title: '提示',
            content: '是否要删除该分组？',
            okText: '删除',
            cancelText: '取消',
            onOk: () => {
                return new Promise((resolve, reject) => {
                    this.props.dispatch({
                        type: 'wx_material_library/removeGroup',
                        payload: {
                            id: id,
                        },
                        callback: () => {
                            this.loadGroupTree()
                        },
                    })
                    resolve()
                }).catch((err) => console.log(err))
            },
            onCancel() {},
        })
    }

    setGroupFormRef = (ref) => {
        this.groupFormRef = ref
    }

    handleGroupFormOk = () => {
        const {form, data} = this.groupFormRef.props

        form.validateFields((err, values) => {
            if(err) {
                return
            }
            const name = values.name.replace(/\s*$/, '') // 去除结尾的空格
            if(data.actionName === 'create') {
                if (this.props.createGroupLoading) {
                    return
                }
                this.props.dispatch({
                    type: 'wx_material_library/createGroup',
                    payload: {
                        body: {
                            name: name,
                            parent_id: data.parent_id || 0,
                        }
                    },
                    callback: () => {
                        this.loadGroupTree()
                        this.handleGroupFormCancel()
                    },
                })
            } else if(data.actionName === 'update') {
                if (this.props.updateGroupLoading) {
                    return
                }
                this.props.dispatch({
                    type: 'wx_material_library/updateGroup',
                    payload: {
                        id: data.id,
                        body: {
                            name: name,
                            parent_id: data.parent_id,
                        }
                    },
                    callback: () => {
                        this.loadGroupTree()
                        this.handleGroupFormCancel()
                    },
                })
            }
        })
    }

    handleGroupFormCancel = () => {
        const {groupFormProp} = this.state

        this.setState({
            groupFormProp: {
                ...groupFormProp,
                visible: false,
            },
        }, () => {
            this.groupFormRef.props.form.resetFields()
        })
    }

    renderTreeTitle = (item) => {
        let nodeClick = item.id ? (
            <div className={styles.treeNodeClick}>
                <Icon
                    className={styles.treeNodeDot}
                    type="ellipsis"
                    onClick={(e)=>{this.onTreeClick(item, e)}}
                />
            </div>
        ) : null

        return (
            <div className={styles.treeNode}>
                <div className={styles.treeNodeTitle} title={item.name}>{item.name}</div>
                {
                    item.select ? this.renderTreeDropdown(item, nodeClick) : nodeClick
                }
            </div>
        )
    }

    renderTreeDropdown = (item, nodeClick) => {
        if(nodeClick) {
            const menu = (
                <Menu>
                    <MenuItem onClick={(e)=>{this.onTreeDropdownClick(item, 'create', e)}}>
                        添加子分组
                    </MenuItem>
                    <MenuItem onClick={(e)=>{this.onTreeDropdownClick(item, 'update', e)}}>
                        修改名称
                    </MenuItem>
                    <MenuItem onClick={(e)=>{this.onTreeDropdownClick(item, 'remove', e)}}>
                        删除分组
                    </MenuItem>
                </Menu>
            )

            return (
                <HzDropdown
                    handleOutside={() => {
                        this.handleOutside(item)
                    }}
                    getPopupContainer={this.getPopupContainer}
                    overlay={menu}
                    visible
                    placement="bottomRight"
                >
                    {nodeClick}
                </HzDropdown>
            )
        }
    }

    handleOutside = (item) => {
        item.select = false

        this.props.dispatch({
            type: 'wx_material_library/updateGroupTree',
            payload: {},
        })
    }

    renderTreeNodes = (data) => {
        return data.map((item) => {
            if(item.children) {
                return (
                    <TreeNode
                        title={this.renderTreeTitle(item)}
                        key={item.id}
                        dataRef={item}
                    >
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                )
            }
            return (
                <TreeNode
                    title={this.renderTreeTitle(item)}
                    key={item.id}
                    dataRef={item}
                />
            )
        })
    }

    onGroupExpand = (expandedKeys) => {
        this.props.dispatch({
            type: 'wx_material_library/setProperty',
            payload: {
                groupExpandedKeys: expandedKeys
            },
        })
    }

    onGroupSelect = (selectedKeys, e) => {
        const {node, selected} = e
        if (!selected) {
            const {dataRef, expanded} = node.props
            let {groupExpandedKeys} = this.props.wx_material_library
            let newExpandedKeys = groupExpandedKeys.slice()

            const id = String(dataRef.id)
            const index = newExpandedKeys.indexOf(id)

            if (expanded && index >= 0) {
                newExpandedKeys.splice(index, 1)
            } else if (!expanded && index === -1) {
                newExpandedKeys.push(id)
            }

            this.props.dispatch({
                type: 'wx_material_library/setProperty',
                payload: {
                    groupExpandedKeys: newExpandedKeys
                },
            })
        } else {
            this.props.dispatch({
                type: 'wx_material_library/setProperty',
                payload: {
                    groupSelectedKey: parseInt(node.props.eventKey, 10)
                },
            })
            this.goPage(1)
            this.resetSelection()
        }
    }

    handleTabChange = (e) => {
        const type = parseInt(e, 10)
        this.setState({
            currentType: type
        })
        let params = {...this.props.wx_material_library.params}
        params.type = type
        this.props.dispatch({
            type: 'wx_material_library/setProperty',
            payload: {
                params: params
            },
        })
        this.resetSelection() // 重置选择
        this.goPage(1)
    }

    resetSelection = () => {
        this.setState({
            selectedMaterials: []
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.wx_material_library.params}
        params.limit = size
        this.props.dispatch({
            type: 'wx_material_library/setProperty',
            payload: {params: params},
        })
        this.goPage(1)
    }

    goPage = (page, callback) => {
        this.props.dispatch({
            type: 'wx_material_library/list',
            payload: {page: page},
            callback: (data, pagination, type) => {
                this.loadTags()
                if (this._isMounted) {
                    if(callback && typeof callback === 'function'){
                        callback()
                    }
                    const list = {
                        data: data,
                        total: pagination.rows_found,
                        current: parseInt(pagination.offset / pagination.limit, 10) + 1
                    }
                    let lists = {...this.state.lists}
                    lists[type] = list
                    this.setState({
                        lists: lists
                    })
                }
            }
        })
    }

    handleSelectPageAll = (e, type) => {
        const checked = e.target.checked
        const {lists} = this.state
        const list = this.getCurrentData(lists, type)
        let selectedMaterials = [...this.state.selectedMaterials]
        if (checked) {
            list.forEach((item) => {
                const id = item.id
                const some = selectedMaterials.some((v)=>{return v === id})
                if (!some) {
                    if (item.is_operable) {
                        selectedMaterials.push(id)
                    }
                }
            })
        } else {
            selectedMaterials = selectedMaterials.filter((v) => {
                const include = list.some((item) => {
                    return item.id === v
                })
                return !include
            })
        }
        this.setState({
            selectedMaterials: selectedMaterials
        })
    }

    handleSelectMaterial = (id, e) => {
        const checked = e.target.checked
        let selectedMaterials = [...this.state.selectedMaterials]
        const index = selectedMaterials.findIndex((v)=>{ return v === id })
        if (checked) {
            if (index === -1) {
                selectedMaterials.push(id)
            }
        } else {
            if (index !== -1) {
                selectedMaterials.splice(index, 1)

            }
        }
        this.setState({
            selectedMaterials: selectedMaterials
        })
    }

    isSelectedPageAll = (list) => {
        const {selectedMaterials} = this.state
        const operableList = this.getOperableList(list)
        const ids = operableList.map((v) => {
            return v.id
        })
        if (operableList.length) {
            return this.isContained(selectedMaterials, ids)
        }
        return false
    }

    isOperable = (list) => {
        const operableList = this.getOperableList(list)
        return operableList.length
    }

    getOperableList = (list) => {
        return list.filter((v) => {
            return v.is_operable
        })
    }

    isContained(arr1, arr2) {
        if (!(arr1 instanceof Array) || !(arr2 instanceof Array) || ((arr1.length < arr2.length))) {
            return false
        }
        let aaStr = arr1.toString()
        for (let i = 0; i < arr2.length; i++) {
            if (aaStr.indexOf(arr2[i]) < 0) return false
        }
        return true
    }

    handleBatchDeletion = (selectedMaterials) => {
        const len = selectedMaterials.length
        if (!len) {
            message.warning('请先选择需要删除的素材')
            return
        }
        confirm({
            title: '批量删除',
            content: `是否确定要删除此${len}个素材？`,
            onOk: () => {
                this.batchDeletion(selectedMaterials)
            },
            onCancel: () => {},
        })
    }

    batchDeletion = (selectedMaterials) => {
        const payload = {
            ids: selectedMaterials.join(',')
        }
        this.props.dispatch({
            type: 'wx_material_library/batchRemove',
            payload: payload,
            callback: () => {
                message.success('删除成功')
                const {currentType} = this.state
                const lists = {...this.state.lists}
                let currentList = lists[currentType]
                const {params: {limit}} = this.props.wx_material_library
                let deleteCount = selectedMaterials.length
                const {total, current} = currentList
                let currentTotal = total - deleteCount // 当前总数
                let currentPage = 1
                if (currentTotal) {
                    if (currentTotal > (current - 1) * limit) {
                        currentPage = current // 留在当前页
                    }
                }
                this.goPage(currentPage, ()=>{
                    this.resetSelection()
                    this.loadTags()
                })
            }
        })
    }

    setModalStatus = (key, visible, extra) => {
        this.setState({
            [key]: visible,
            ...extra
        })
    }

    handleBatchTagging = (selectedMaterials) => {
        if (!selectedMaterials.length) {
            message.warning('请先选择需要打标的素材')
            return
        }
        this.setModalStatus('batchTagVisible', true)
    }

    handleBatchTagOk = () => {
        this.setModalStatus('batchTagVisible', false)
        this.resetSelection()
        this.reload()
    }

    handleBatchGrouping = (selectedMaterials) => {
        if (!selectedMaterials.length) {
            message.warning('请先选择需要分组的素材')
            return
        }
        this.setModalStatus('batchGroupVisible', true)
    }

    handleBatchGroupOk = () => {
        this.setModalStatus('batchGroupVisible', false)
        this.resetSelection()
        this.reload()
    }

    handleEditOk = (record, body) => {
        const {currentType: type} = this.state
        let lists = {...this.state.lists}
        let list = [...this.getCurrentData(lists, type)]
        for (let i = 0; i < list.length; i++) {
            let temp = list[i]
            if (temp.id === record.id) {
                list[i] = {
                    ...temp,
                    ...body
                }
                break
            }
        }
        lists[type].data = list
        this.setState({
            lists: lists
        })
    }

    handleShowTagManagement = (record) => {
        this.setState({
            record: record,
            tagManagementVisible: true
        })
    }

    handleTagManagementOk = () => {
        this.handleHideTagManagement()
        this.reload()
    }

    handleHideTagManagement = () => {
        this.setState({
            currentTags: [],
            tagManagementVisible: false
        })
    }

    reload = (page) => {
        this.loadTags() // 更新tags
        const {currentType: type, lists} = this.state
        const current = page || this.getCurrent(lists, type)
        this.goPage(current)
    }

    removeMaterial = (type, item) => {
        this.setState({
            record: item
        })
        const {id} = item
        this.props.dispatch({
            type: 'wx_material_library/remove',
            payload: {
                id: id
            },
            callback: () => {
                if(this._isMounted) {
                    message.success('删除成功')
                    this.loadTags()
                    const {selectedMaterials} = this.state
                    if (selectedMaterials.includes(id)) {
                        this.setState({
                            selectedMaterials: selectedMaterials.filter((v) => {
                                return v !== id
                            })
                        })
                    }
                    const{params} = this.props.wx_material_library
                    const lists = {...this.state.lists}
                    const {total, current, data} = lists[type]
                    const list = [...data]
                    const realList = list.filter((item) => {
                        return item.id !== id
                    })

                    const currentTotal = total - 1
                    const rest = currentTotal % params.limit
                    if (currentTotal) {
                        if (rest) {
                            lists[type] = {
                                data: realList,
                                total: currentTotal,
                                current: current,
                            }
                            this.setState({
                                lists: lists
                            })
                        } else {
                            this.goPage(current -1)
                        }
                    } else {
                        this.goPage(1)
                    }
                }
            }
        })
    }

    handleCreateMaterial = (type, fileList) => {
        if (type === materialType.text.type) {
            this.reload(1)
            return
        }

        if(type === materialType.file.type) {
            this.handleCreateFileMaterial(fileList)
            return
        }

        const payload = this.getPayload(type, fileList)

        this.createMaterial(payload, type, ()=>{
            this.goPage(1)
        })
    }

    getPayload = (type, fileList) => {
        const body = this.getBody(type, fileList)
        return {
            body: body
        }
    }

    getBody = (type, fileList) => {
        const content = []
        const {groupSelectedKey} = this.props.wx_material_library

        fileList.forEach((item) => {
            if (item && item.response && item.response.url) {
                const url = item.response.url
                const filename = item.name
                const fileType = item.type
                let title = ''
                if (fileType) {
                    title = filename.slice(0, filename.lastIndexOf('.'))
                } else {
                    title = filename
                }
                if (title.length > titleMaxLength) {
                    title = title.slice(0, titleMaxLength)
                }

                let subType = {}
                if (imageType.includes(fileType)) {
                    if (fileType === 'image/gif') {
                        subType.sub_type = subFileType.gif
                    } else {
                        subType.sub_type = subFileType.normal
                    }
                }
                content.push({
                    url: url,
                    title: title,
                    type: type,
                    category_id: groupSelectedKey ? parseInt(groupSelectedKey, 10) : 0,
                    ...subType
                })
            }
        })
        return content
    }

    createMaterial = (payload, type, callback) => {
        this.props.dispatch({
            type: 'wx_material_library/create',
            payload: payload,
            callback: (res) => {
                if (this._isMounted) {
                    const {currentType} = this.state
                    if (res.meta && res.meta.code === 200) {
                        message.success(`${utils.getTypeText(type)}上传成功`)
                        if (currentType === type) {
                            this.goPage(1)
                        }
                    }
                    this.clearFileList(type)
                    if(callback && typeof callback === 'function'){
                        callback()
                    }
                }
            }
        })
    }

    handleCreateFileMaterial = (totalFileList, list) => {
        const {creatingTypes} = this.state
        let {fileList, imageFileList, videoFileList} = this.state
        fileList = this.getConcatFileList(fileList, list[materialType.file.type])
        imageFileList = this.getConcatFileList(imageFileList, list[materialType.image.type])
        videoFileList = this.getConcatFileList(videoFileList, list[materialType.video.type])
        let payload = {}
        this.setState({
            totalFileList: this.getExistingFileList(totalFileList),
            fileList: this.getExistingFileList(fileList),
            imageFileList: this.getExistingFileList(imageFileList),
            videoFileList: this.getExistingFileList(videoFileList),
        })


        if (imageFileList.length && helper.isUploadComplete(imageFileList)) {
            if(!creatingTypes.includes(materialType.image.type)) {
                payload = this.getPayload(materialType.image.type, imageFileList)
                this.createFileMaterial(payload, materialType.image.type, imageFileList)
            }
        }
        if (videoFileList.length && helper.isUploadComplete(videoFileList)) {
            if(!creatingTypes.includes(materialType.video.type)) {
                payload = this.getPayload(materialType.video.type, videoFileList)
                this.createFileMaterial(payload, materialType.video.type, videoFileList)
            }
        }
        if (fileList.length && helper.isUploadComplete(fileList)) {
            if (!creatingTypes.includes(materialType.file.type)) {
                payload = this.getPayload(materialType.file.type, fileList)
                this.createFileMaterial(payload, materialType.file.type, fileList)
            }
        }
    }

    createFileMaterial = (payload, type, fileList) => {
        let creatingTypes = [...this.state.creatingTypes]
        if (creatingTypes.includes(type)) {
            return
        }
        creatingTypes.push(type)
        this.setState({
            creatingTypes: creatingTypes
        }, ()=>{
            this.createMaterial(payload, type, ()=>{
                this.clearFileList(type)
                const {totalFileList} = this.state
                const currentTotalFileList = this.getFilterFileList(totalFileList, fileList)
                const currentCreatingTypes = this.state.creatingTypes.filter((v) => {
                    return v !== type
                })
                this.setState({
                    totalFileList: currentTotalFileList,
                    creatingTypes: currentCreatingTypes
                })
            })
        })
    }

    getUids = (fileList) => {
        return fileList.map((v) => {
            return v.uid
        })
    }

    getFilterFileList = (totalList, list) => {
        const uids = this.getUids(list)
        return totalList.filter((v) => {
            return !uids.includes(v.uid)
        })
    }

    getExistingFileList = (fileList) => {
        return fileList.filter((item)=>{
            return item.status !== 'removed' && item.status !== 'error'
        })
    }

    getConcatFileList = (a, b) => {
        if (!a.length || !b.length) {
            return a.concat(b)
        }
        const uidsA = this.getUids(a)
        const uidsB = this.getUids(b)
        const unionUids = Array.from(new Set(uidsA.concat(uidsB))) // 并集
        const intersectionUids = uidsA.filter(v => uidsB.includes(v)) // 交集

        if (!intersectionUids.length) { // 没有交集
            return b.concat(a)
        }
        // 有交集
        let result = _.cloneDeep(a)
        unionUids.forEach((uid) => {
            const indexA = a.findIndex((v) => {
                return v.uid === uid
            })
            const indexB = b.findIndex((v) => {
                return v.uid === uid
            })
            if (indexA !== -1 && indexB !== -1) {
                result[indexA] = _.cloneDeep(b[indexB])
            }
        })
        return result
    }

    clearFileList = (type) => {
        switch (type) {
            case materialType.image.type :
                this.setState({imageFileList: []})
                break
            case materialType.video.type:
                this.setState({videoFileList: []})
                break
            case materialType.file.type:
                this.setState({fileList: []})
                break
            default:
        }
    }


    handleUploadChange = (type, fileList) => {
        switch (type) {
            case materialType.image.type :
                this.setState({imageFileList: fileList})
                break
            case materialType.video.type:
                this.setState({videoFileList: fileList})
                break
            default:
        }
    }

    handleShowImagePreview = (imageUrl) => {
        this.setState({
            imageVisible: true,
            imageUrl: imageUrl
        })
    }

    handleHideImagePreview = () => {
        this.setState({
            imageVisible: false,
            imageUrl: ''
        })
    }

    handleShowVideoPreview = (videoSource) => {
        this.setState({
            videoVisible: true,
            videoSource: videoSource
        })
    }

    handleHideVideoPreview = () => {
        this.setState({
            videoVisible: false,
            videoSource: ''
        })
    }

    resetParams = (payload) => {
        this.props.dispatch({
            type: 'wx_material_library/resetParams',
            payload: payload
        })
    }

    resetSearch = () => {
        this.resetParams({
            type: this.state.currentType
        })
        setTimeout(() => {
            this.handleSearch()
        }, 0)
    }

    getCurrentData = (lists, type) => {
        return lists[type] && lists[type].data || []
    }

    getCurrent = (lists, type) => {
        return lists[type] && lists[type].current || 1
    }

    showEmpty = () => {
        const {listLoading} = this.props
        const {currentType, lists, imageFileList, videoFileList, fileList} = this.state
        const list = lists[currentType] && lists[currentType].data || []
        if (currentType === materialType.image.type) {
            if (imageFileList.length) {
                return false
            }
        } else if (currentType === materialType.video.type) {
            if (videoFileList.length) {
                return false
            }
        } else if (currentType === materialType.file.type) {
            if (fileList.length) {
                return false
            }
        }
        if (list.length || listLoading) {
            return false
        }
        return true
    }

    getBatch = (type) => {
        const {selectedMaterials, lists} = this.state
        const list = lists[type]
        if(list && list.total) {
            const currentList = this.getCurrentData(lists, type)
            const isSelectedPageAll = this.isSelectedPageAll(currentList)
            const isOperable = this.isOperable(currentList)
            return <div className={styles.batch}>
                {isOperable ? <Checkbox className={styles.all}
                    checked={isSelectedPageAll}
                    onChange={(e) => {
                        this.handleSelectPageAll(e, type)
                    }}>本页全选</Checkbox>
                    : null}
                <span className={styles.selectedCount}>已选 {selectedMaterials.length} 个</span>
                <Button className={styles.batchBtn}
                    onClick={()=>{this.handleBatchDeletion(selectedMaterials)}}
                >批量删除</Button>
                <Button className={styles.batchBtn}
                    onClick={()=>{this.handleBatchTagging(selectedMaterials)}}
                >批量打标</Button>
                <Button className={styles.batchBtn}
                    onClick={() => {this.handleBatchGrouping(selectedMaterials)}}
                >移至分组</Button>
            </div>
        }
        return null
    }

    getPagination = (type) => {
        const {params} = this.props.wx_material_library
        const {lists} = this.state
        const list = lists[type]
        let total = 0
        let current = 1
        if (list) {
            total = list.total || 0
            current = list.current || 1
        }
        if(total) {
            return <Pagination
                className={`ant-table-pagination ${styles.pagination}`}
                size="middle"
                total={total}
                current={current}
                showQuickJumper={true}
                pageSizeOptions={pageSizeOptions}
                showTotal={total => `共 ${total} 条`}
                pageSize={params.limit}
                showSizeChanger={true}
                onShowSizeChange={this.handleChangeSize}
                onChange={this.goPage}
            />
        }
        return null
    }

    render() {
        const {params, originGroups, groups, groupExpandedKeys, groupSelectedKey} = this.props.wx_material_library
        const {
            listLoading, groupTreeLoading, createGroupLoading, updateGroupLoading,
        } = this.props

        const {
            currentType, lists, tags, record, selectedMaterials,
            imageFileList, videoFileList, fileList, totalFileList,
            tagManagementVisible, batchTagVisible, batchGroupVisible, imageVisible, videoVisible, imageUrl, videoSource,
            groupFormProp,
        } = this.state

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const getTagsOptions = () => {
            let options = []
            tags.forEach((item, index) => {
                options.push(<Option value={item} key={index}>{item}</Option>)
            })
            return options
        }

        const componentProps = {
            selectedMaterials: selectedMaterials,
            onSelectMaterial: this.handleSelectMaterial,
            onBatchDeletion: this.handleBatchDeletion,
            onBatchTagging: this.handleBatchTagging,
            onTagManagement: this.handleShowTagManagement,
            onRemove: this.removeMaterial,
        }

        return (
            <div>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E4%B8%AA%E4%BA%BA%E5%8F%B7/%E5%86%85%E5%AE%B9%E7%AE%A1%E7%90%86.md',
                    }}
                />
                <div className={styles.searchWrap} id="wxMaterialLibraryMain">
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout}
                                label="搜索："
                                colon={false}
                            >
                                <Input placeholder="请输入关键字"
                                    value={params.keyword}
                                    maxLength={titleMaxLength}
                                    onChange={(e)=>{this.handleChange('keyword', e)}}
                                    onPressEnter={this.handleSearch}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="包含标签：" colon={false} className={styles.tagForm}>
                                <Select
                                    optionFilterProp="children"
                                    onChange={(e)=>{this.handleChange('tags', e)}}
                                    placeholder="包含标签"
                                    style={{width: '100%'}}
                                    mode="multiple"
                                    value={params.tags || []}
                                    tokenSeparators={[',']}>
                                    {getTagsOptions()}
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="来源：" colon={false}>
                                <Select placeholder="全部来源"
                                    style={{width: '100%'}}
                                    value={typeof params.source === 'undefined' ? '' : params.source}
                                    onChange={(e)=>{this.handleChange('source', e)}}
                                >
                                    <Option value="">全部</Option>
                                    {
                                        Object.keys(source).map((key)=>{
                                            return <Option key={key} value={parseInt(key, 10)}>{source[key]}</Option>
                                        })
                                    }
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="部门：" colon={false}>
                                <DepartmentSelect
                                    departmentId={params.department_id}
                                    onChange={(value)=>{this.handleChange('department_id', value)}}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="员工：" colon={false}>
                                <UserSelect
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    onChange={(value)=>{this.handleChange('user_id', value)}}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20} className={styles.searchBtn}>
                        <Col span={7}>
                            <Col offset={8}>
                                <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                <Button onClick={this.resetSearch}>重置</Button>
                            </Col>
                        </Col>
                        <Col span={7}>
                            <Checkbox className={styles.mine} checked={params.only_mine === 1}
                                onChange={this.handleCheckChange}
                            >仅查看自己上传的素材</Checkbox>
                        </Col>
                    </Row>
                </div>
                <Row className={styles.main}>
                    <Col span={4}>
                        <div className={styles.group}>
                            <Button
                                onClick={(e)=>{this.onTreeDropdownClick(null, 'create', e)}}
                                className={styles.addGroup}
                                icon="plus"
                                type="dashed"
                            >添加分组</Button>
                            <Spin spinning={groupTreeLoading}>
                                <Tree
                                    onExpand={this.onGroupExpand}
                                    expandedKeys={groupExpandedKeys}
                                    autoExpandParent={false}
                                    className={groupTreeLoading ? `${styles.tree} ant-spin-blur` : styles.tree}
                                    onSelect={this.onGroupSelect}
                                    selectedKeys={[String(groupSelectedKey)]}>
                                    {this.renderTreeNodes(groups)}
                                </Tree>
                            </Spin>
                        </div>
                    </Col>
                    <Col span={20}>
                        <div className={styles.library}>
                            <Tabs animated={false}
                                activeKey={currentType.toString()}
                                onChange={this.handleTabChange}>
                                <TabPane tab={materialType.text.name} key={materialType.text.type.toString()}>
                                    { currentType === materialType.text.type ? <Spin spinning={listLoading}>
                                        {this.getBatch(materialType.text.type)}
                                        <Text {...this.props}
                                            record={record}
                                            category={groupSelectedKey}
                                            list={this.getCurrentData(lists, materialType.text.type)}
                                            {...componentProps}
                                            onCreate={this.handleCreateMaterial}
                                        />
                                        {this.getPagination(materialType.text.type)}
                                    </Spin> : null}
                                </TabPane>
                                <TabPane tab={materialType.image.name} key={materialType.image.type.toString()}>
                                    <Spin spinning={listLoading}>
                                        {this.getBatch(materialType.image.type)}
                                        <Image {...this.props}
                                            record={record}
                                            category={groupSelectedKey}
                                            list={this.getCurrentData(lists, materialType.image.type)}
                                            fileList={imageFileList}
                                            {...componentProps}
                                            onCreate={this.handleCreateMaterial}
                                            onEditOk={this.handleEditOk}
                                            onImagePreview={this.handleShowImagePreview}
                                            onUploadChange={this.handleUploadChange}
                                        />
                                        {this.getPagination(materialType.image.type)}
                                    </Spin>
                                </TabPane>
                                <TabPane tab={materialType.video.name} key={materialType.video.type.toString()}>
                                    <Spin spinning={listLoading}>
                                        {this.getBatch(materialType.video.type)}
                                        <Video {...this.props}
                                            record={record}
                                            category={groupSelectedKey}
                                            list={this.getCurrentData(lists, materialType.video.type)}
                                            fileList={videoFileList}
                                            {...componentProps}
                                            onCreate={this.handleCreateMaterial}
                                            onEditOk={this.handleEditOk}
                                            onVideoPreview={this.handleShowVideoPreview}
                                            onUploadChange={this.handleUploadChange}
                                        />
                                        {this.getPagination(materialType.video.type)}
                                    </Spin>
                                </TabPane>
                                <TabPane tab={materialType.file.name} key={materialType.file.type.toString()}>
                                    <Spin spinning={listLoading}>
                                        {this.getBatch(materialType.file.type)}
                                        <File {...this.props}
                                            record={record}
                                            category={groupSelectedKey}
                                            list={this.getCurrentData(lists, materialType.file.type)}
                                            totalFileList={totalFileList}
                                            fileList={fileList}
                                            {...componentProps}
                                            onCreate={this.handleCreateFileMaterial}
                                            onEditOk={this.handleEditOk}
                                        />
                                        {this.getPagination(materialType.file.type)}
                                    </Spin>
                                </TabPane>
                                <TabPane tab={materialType.voice.name} key={materialType.voice.type.toString()}>
                                    { currentType === materialType.voice.type ? <Spin spinning={listLoading}>
                                        {this.getBatch(materialType.voice.type)}
                                        <Voice {...this.props}
                                            record={record}
                                            list={this.getCurrentData(lists, materialType.voice.type)}
                                            {...componentProps}
                                            onEditOk={this.handleEditOk}
                                        />
                                        {this.getPagination(materialType.voice.type)}
                                    </Spin> : null}
                                </TabPane>
                                <TabPane tab={materialType.webPage.name} key={materialType.webPage.type.toString()}>
                                    { currentType === materialType.webPage.type ? <Spin spinning={listLoading}>
                                        {this.getBatch(materialType.webPage.type)}
                                        <WebPage {...this.props}
                                            record={record}
                                            list={this.getCurrentData(lists, materialType.webPage.type)}
                                            {...componentProps}
                                        />
                                        {this.getPagination(materialType.webPage.type)}
                                    </Spin> : null}
                                </TabPane>
                                <TabPane tab={materialType.miniApp.name} key={materialType.miniApp.type.toString()}>
                                    { currentType === materialType.miniApp.type ? <Spin spinning={listLoading}>
                                        {this.getBatch(materialType.miniApp.type)}
                                        <MiniApp {...this.props}
                                            record={record}
                                            list={this.getCurrentData(lists, materialType.miniApp.type)}
                                            {...componentProps}
                                        />
                                        {this.getPagination(materialType.miniApp.type)}
                                    </Spin> : null}
                                </TabPane>
                                <TabPane tab={materialType.music.name} key={materialType.music.type.toString()}>
                                    { currentType === materialType.music.type ? <Spin spinning={listLoading}>
                                        {this.getBatch(materialType.music.type)}
                                        <Music {...this.props}
                                            record={record}
                                            list={this.getCurrentData(lists, materialType.music.type)}
                                            {...componentProps}
                                        />
                                        {this.getPagination(materialType.music.type)}
                                    </Spin> : null}
                                </TabPane>
                                <TabPane tab={materialType.officialAccount.name} key={materialType.officialAccount.type.toString()}>
                                    { currentType === materialType.officialAccount.type ? <Spin spinning={listLoading}>
                                        {this.getBatch(materialType.officialAccount.type)}
                                        <OfficialAccount {...this.props}
                                            record={record}
                                            list={this.getCurrentData(lists, materialType.officialAccount.type)}
                                            {...componentProps}
                                        />
                                        {this.getPagination(materialType.officialAccount.type)}
                                    </Spin> : null}
                                </TabPane>
                            </Tabs>
                            {this.showEmpty() ?  <div className={styles.empty}>暂无数据</div> : null}
                        </div>
                    </Col>
                </Row>
                <ImagePreview visible={imageVisible}
                    imageUrl={imageUrl}
                    onCancel={this.handleHideImagePreview}
                />
                <VideoPreview visible={videoVisible}
                    source={videoSource}
                    onCancel={this.handleHideVideoPreview}
                />
                {tagManagementVisible ? <TagManagement
                    visible={tagManagementVisible}
                    record={record}
                    onOk={this.handleTagManagementOk}
                    onCancel={this.handleHideTagManagement}
                /> : null}
                {batchTagVisible ? <BatchTag {...this.props}
                    ids={selectedMaterials}
                    visible={batchTagVisible}
                    onOk={this.handleBatchTagOk}
                    onCancel={()=>{this.setModalStatus('batchTagVisible', false)}}
                /> : null}
                {batchGroupVisible ? <BatchGroup {...this.props}
                    ids={selectedMaterials}
                    tree={originGroups}
                    visible={batchGroupVisible}
                    onOk={this.handleBatchGroupOk}
                    onCancel={()=>{this.setModalStatus('batchGroupVisible', false)}}
                /> : null}
                <ModalForm
                    wrappedComponentRef={this.setGroupFormRef}
                    onCancel={this.handleGroupFormCancel}
                    onOk={this.handleGroupFormOk}
                    confirmLoading={createGroupLoading || updateGroupLoading}
                    {...groupFormProp}
                />
            </div>
        )
    }
}
