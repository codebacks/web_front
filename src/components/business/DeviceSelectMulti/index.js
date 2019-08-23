/**
 * 创建用户: liyan
 * 创建日期: 19/05/23
 */
import React, {PureComponent} from 'react'
import {Modal, Tree, Input, Select, Checkbox, Button, Icon, Spin} from 'antd'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import _ from 'lodash'
import classNames from 'classnames'
import {AutoSizer, List as VList, CellMeasurerCache, CellMeasurer} from 'react-virtualized'
import {getAllTreeNodeKeys} from './util'
import styles from './index.less'

const TreeNode = Tree.TreeNode
const Option = Select.Option

@connect(({base, departments, users, device, loading}) => ({
    base, departments, users, device,
    treeLoading: loading.effects['departments/queryTreesCurrent'],
    usersLoading: loading.effects['users/querySub'],
    devicesLoading: loading.effects['device/queryPart'],
    groupLoading: loading.effects['device/queryGroup']
}))
export default class extends PureComponent {
    static propTypes = {
        cls: PropTypes.string,
        visible: PropTypes.bool,
        resetOnClose: PropTypes.bool, // 关闭时重置
        searchOption: PropTypes.array, // 搜索项，请求参数
        onOk: PropTypes.func,
        onCancel: PropTypes.func,
    }

    static defaultProps = {
        cls: '',
        visible: false,
        resetOnClose: false,
        searchOption: [], // ['keyword', 'group_id']
        onOk: () => {},
        onCancel: () => {}
    };

    constructor(props) {
        super(props)
        this.state = this.getInitialState()

        this.measureCache = new CellMeasurerCache({
            fixedWidth: true,
            minHeight: 31, // 考虑折叠情况
        })
        this._measureCallbacks = []

        this._isMounted = false
    }

    componentDidMount() {
        this._isMounted = true
        this.loadData()
    }

    componentWillUnmount() {
        this._isMounted = false
        this.setState(this.getInitialState())
    }

    getInitialState = () => {
        return {
            expandedKeys: [], // 展开的节点
            checkedKeys: [], // checkbox checked key string 已选中的部门
            selectedKeys: [], // selected key string 部门树的selectedKeys
            collapseUsers: [], // 折叠的员工
            depts: [], // 部门树
            devices: [], // 全部设备
            treeNodeKeys: {}, // {id: [ids]} ids包括自身
            availableDevices: [], // 全部可用的设备
            selectedDevices: [], // 选中的设备
            userDevices: {}, // {user_id: [device]} // user下对应的设备
            deptUsers: {}, // {dept_id: [user]}
            deptUsersUnion: {}, // {dept_id: [user]}
            availableUsers: [], // [user]全部可用user
            currentUsers: [], // [user]
            checkedUsers: [],
            deptDevices: {}, // 部门下的设备
            deptDevicesUnion: {}, // {dept_id: [device]}
            companyKey: '0', // 顶级公司部门key string
            deptSelectedDevicesNum: 0, // 部门下选中设备个数
            displayUsers: [], // 展示的users // [user]
            displayDevices: [], // 展示的设备 [device]
            displayCheckedUsers: [], // 展示的选中的users

            params: this.getInitParams(),
            searchParams: this.getInitParams(),
            groups: [], // 设备分组
            searchResult: [], // 搜索的结果
        }
    }

    getInitParams = () => {
        return {
            keyword: undefined, // 序列号/备注/编号
            group_id: undefined, // 设备分组id
            department_id: undefined, // 部门id
            risk_control: 1, // 支持风控的设备
        }
    }

    loadData = () => {
        if(this.hasSearchOption()) {
            this.loadGroup()
        }
        this.loadDepartments()
    }

    loadGroup = () => {
        this.props.dispatch({
            type: 'device/queryGroup',
            callback: (data) => {
                if(this._isMounted) {
                    this.setState({
                        groups: data
                    })
                }
            }
        })
    }

    loadDepartments = () => {
        this.props.dispatch({
            type: 'departments/queryTreesCurrent',
            payload: {},
            callback: (data) => {
                if(this._isMounted) {
                    this.setState({
                        depts: data
                    }, ()=> {
                        const companyKey = data[0].id.toString()
                        this.setState({
                            // 默认选中公司，展开第二级
                            expandedKeys: this.getDefaultExpandedKeys(data),
                            selectedKeys: [companyKey],
                            treeNodeKeys: getAllTreeNodeKeys(data[0]),
                            companyKey: companyKey,
                        },()=>{
                            // 加载全部设备
                            this.loadDevices(this.getInitParams(), (data)=>{
                                this.setState({
                                    devices: data,
                                },()=>{
                                    // 请求公司下的全部员工
                                    this.loadUsers({
                                        department_id: companyKey
                                    },(users)=>{
                                        this.setUserDevices(users)
                                    })
                                })
                            })
                        })
                    })
                }
            }
        })
    };

    getDefaultExpandedKeys = (data) => {
        if(data.length) {
            const parent = data[0]
            let defaultExpandedKeys = [parent.id.toString()]
            parent.children.forEach((item) => {
                defaultExpandedKeys.push(item.id.toString())
            })
            return defaultExpandedKeys
        }
        return []
    }

    loadDevices = (payload={}, callback) => {
        this.props.dispatch({
            type: 'device/queryPart',
            payload: payload,
            callback: (data) => {
                if(this._isMounted) {
                    this.setState({
                        searchParams: payload
                    })
                    callback && callback(data)
                }
            }
        })
    }

    loadUsers = (params, callback) => {
        this.props.dispatch({
            type: 'users/querySub',
            payload: {
                params: params,
            },
            callback: (data) => {
                callback && callback(data)
            }
        })
    };

    handleOk = () => {
        this.props.onOk && this.props.onOk(this.state.selectedDevices)
    };

    handleCancel = () => {
        this.props.onCancel && this.props.onCancel()
    };

    handleAfterClose = () => {
        if(this.props.resetOnClose) {
            const {companyKey, depts, deptUsersUnion, deptDevicesUnion} = this.state
            const companyUsers = deptUsersUnion[companyKey] || []
            this.setState({
                expandedKeys: this.getDefaultExpandedKeys(depts), // 默认展开
                checkedKeys: [], // checkbox checked key string 已选中的部门
                selectedKeys: [companyKey], // selected key string 部门树的selectedKeys
                collapseUsers: [], // 折叠的员工
                selectedDevices: [], // 选中的设备

                currentUsers: _.cloneDeep(companyUsers), // [user]
                checkedUsers: [],
                deptSelectedDevicesNum: 0, // 部门下选中设备个数
                displayUsers: companyUsers, // 展示的users // [user]
                displayDevices: deptDevicesUnion[companyKey] || [], // 展示的设备 [device]
                displayCheckedUsers: [], // 展示的选中的users

                params: this.getInitParams(),
                searchParams: this.getInitParams(),
                searchResult: [], // 搜索的结果
            }, ()=>{
                this.refreshList()
            })
        }
    }

    renderTreeNodes = (data) => {
        if(Array.isArray(data)){
            return data.map((item) => {
                if (item.children) {
                    return (
                        <TreeNode title={item.name} key={item.id} dataRef={item}>
                            {this.renderTreeNodes(item.children)}
                        </TreeNode>
                    )
                }
                return <TreeNode {...item} />
            })
        }
    };

    getUsersByKeys = (keys) => {
        const {deptUsers} = this.state
        let users = []
        keys.forEach((key)=>{
            const items = deptUsers[key]
            if(items && items.length) {
                users = _.unionBy(users, items, 'id')
            }
        })
        return users
    }

    getCurrentUsers = (selectedDevices) => {
        return this.state.availableUsers.filter((user)=>{
            return selectedDevices.find((v)=>{
                return v.user.id === user.id
            })
        })
    }

    getCurrentCheckedKeys = (checkedKey, checked, currentCheckedKeys) => {
        const {checkedKeys, treeNodeKeys} = this.state
        currentCheckedKeys = currentCheckedKeys ?  [...currentCheckedKeys] : [...checkedKeys]
        const childrenKeys = treeNodeKeys[checkedKey]
        childrenKeys.forEach((key)=>{
            const index = currentCheckedKeys.indexOf(key)
            if(checked) {
                if(index === -1) {
                    currentCheckedKeys.push(key)
                }
            } else {
                if(index !== -1) {
                    currentCheckedKeys.splice(index, 1)
                }
            }
        })
        return currentCheckedKeys
    }

    getUserIdsFromDevices = (devices) => {
        const resultUserIds = devices.map(v => v.user.id)
        return [...new Set(resultUserIds)]
    }

    onCheck = ({checked: checkedKeys}, {checked, node, event}) => {
        this.setState({
            selectedKeys: [], // 取消节点的selected状态
        })

        const {treeNodeKeys, userDevices, availableUsers} = this.state
        const eventKey = node.props.eventKey
        const eventChildrenKeys = treeNodeKeys[eventKey]
        const eventUsers =  this.getUsersByKeys(eventChildrenKeys) // eventKey部门下的users

        let checkedUsers = [...this.state.checkedUsers]
        let selectedDevices = this.state.selectedDevices

        // 选中部门
        if (checked) {
            for (let i = eventUsers.length - 1; i >= 0; i--) {
                let item = eventUsers[i]
                // 默认全选中users
                checkedUsers = this.addCheckedUser(item.id, [...checkedUsers])
                // 默认全选中设备
                selectedDevices = this.addSelectedDevices(userDevices[item.id], selectedDevices)
            }
        } else {
            // 取消部门
            const cancelIds = eventUsers.map(v => v.id)

            checkedUsers = checkedUsers.filter((id)=>{
                return !cancelIds.includes(id)
            })
            selectedDevices = selectedDevices.filter((v)=>{
                return !cancelIds.includes(v.user.id)
            })
        }

        const selectedUsersIds = this.getUserIdsFromDevices(selectedDevices)
        const displayUsers = availableUsers.filter((user)=>{
            return selectedUsersIds.includes(user.id)
        })

        let displayDevices = []
        selectedUsersIds.forEach((id)=>{
            displayDevices = displayDevices.concat(userDevices[id])
        })

        this.setState({
            checkedKeys: this.getCurrentCheckedKeys(eventKey, checked),
            checkedUsers: checkedUsers,
            selectedDevices: selectedDevices,
            displayCheckedUsers: _.cloneDeep(checkedUsers),
            displayUsers: displayUsers,
            displayDevices: _.cloneDeep(selectedDevices),
            currentUsers: this.getCurrentUsers(selectedDevices)
        },()=>{
            this.refreshList()
        })
    };

    onExpand = (expandedKeys) => {
        this.setState({
            expandedKeys: expandedKeys
        })
    }

    onSelect = (value, {node}, extra) => {
        const selectedKey = node.props.eventKey
        const selectedKeys = [selectedKey]
        const {deptUsersUnion, deptDevicesUnion, selectedDevices} = this.state
        const deptUsers = deptUsersUnion[selectedKey] || []
        const deptDevices = deptDevicesUnion[selectedKey] || []

        // 有搜索值
        if(this.hasSearchOption() && this.hasParams('params')) {
            const {params} = this.state
            const payload = {
                ...params,
                department_id: selectedKey
            }

            this.loadDevices(payload, (data)=>{
                this.setState({
                    searchResult: data,
                }, ()=>{
                    const resultUserIds = this.getUserIdsFromDevices(data)
                    const displayUsers = deptUsers.filter((v) => {
                        return resultUserIds.includes(v.id)
                    })
                    this.setState({
                        selectedKeys: selectedKeys,
                        displayUsers: displayUsers,
                        displayDevices: data,
                        deptSelectedDevicesNum: this.getDeptSelectedDevicesNum(selectedKeys, selectedDevices, data)
                    }, ()=>{
                        this.refreshList()
                    })
                })
            })

        } else {
            // 没有搜索栏或无搜索值
            this.setState({
                selectedKeys: selectedKeys,
                displayUsers: deptUsers,
                displayDevices: deptDevices,
                deptSelectedDevicesNum: this.getDeptSelectedDevicesNum(selectedKeys, selectedDevices, deptDevices)
            },()=>{
                this.refreshList()
            })
        }
    }

    handleCollapse = (userId, idx) => {
        let collapseUsers = [...this.state.collapseUsers]
        let index = collapseUsers.findIndex((item) => item === userId)
        if (index === -1) {
            collapseUsers.push(userId)
        } else {
            collapseUsers.splice(index, 1)
        }
        this.setState({
            collapseUsers: collapseUsers,
        },()=>{
            this.recomputeList(idx)
        })
    };

    recomputeList = (idx) => {
        this._measureCallbacks[idx]()
        this.listRef.recomputeRowHeights(idx)
        this.listRef.forceUpdate()
    }

    refreshList = () => {
        this.listRef.scrollToRow(0)
        setTimeout(() => {
            this.measureCache.clearAll()
        }, 0)
    }

    addSelectedDevices = (devices, selectedDevices) => {
        if (devices) {
            devices.forEach((device) => {
                let index = selectedDevices.findIndex((item) => item.id === device.id)
                if (index === -1) {
                    selectedDevices.push(device)
                }
            })
        }
        return selectedDevices
    };

    deleteSelectedDevices = (devices, selectedDevices) => {
        if (devices) {
            devices.forEach((device) => {
                let index = selectedDevices.findIndex((item) => item.id === device.id)
                if (index > -1) {
                    selectedDevices.splice(index, 1)
                }
            })
        }
        return selectedDevices
    };

    getDeptUsers = (users, userDevices) => {
        let deptUsers = {}
        const availableUsersKeys = Object.keys(userDevices)
        for (let i = 0; i < users.length; i++) {
            const user = users[i]
            const userId = user.id
            const departments = user.departments || []

            for (let j = 0; j < departments.length; j++) {
                const departmentId = departments[j]
                if (availableUsersKeys.includes(userId.toString())) {
                    if (!deptUsers[departmentId]) {
                        deptUsers[departmentId] = []
                    }
                    deptUsers[departmentId].push(user)
                }
            }
        }
        return deptUsers
    }

    getDeptUsersUnion = (deptUsers) => {
        let deptUsersUnion = _.cloneDeep(deptUsers)
        const {treeNodeKeys} = this.state
        Object.keys(treeNodeKeys).forEach((key) => {
            const keys = treeNodeKeys[key]
            keys.forEach((k) => {
                if (deptUsersUnion[k] && deptUsersUnion[k].length) {
                    if (!deptUsersUnion[key]) {
                        deptUsersUnion[key] = []
                    }
                    deptUsersUnion[key] = _.unionBy(deptUsersUnion[key], deptUsersUnion[k], 'id')
                }
            })
        })
        return deptUsersUnion
    }

    getDeptDevices = (deptUsers, userDevices) => {
        const {treeNodeKeys} = this.state
        let deptDevices = {}

        Object.keys(deptUsers).forEach((key)=>{
            let users = []
            const nodeKeys = treeNodeKeys[key]

            nodeKeys.forEach((k) => {
                const availableUsers = deptUsers[k]
                if (availableUsers && availableUsers.length) {
                    // 剔除已经存在的user（因user可属于多个部门）
                    users = _.unionBy(users, availableUsers, 'id')
                }
            })

            deptDevices[key] = []
            users.forEach((user) => {
                deptDevices[key] = deptDevices[key].concat(userDevices[user.id])
            })
        })
        return deptDevices
    }

    getDeptDevicesUnion = (deptDevices) => {
        let deptDevicesUnion = _.cloneDeep(deptDevices)
        const {treeNodeKeys} = this.state
        Object.keys(treeNodeKeys).forEach((key)=>{
            const keys = treeNodeKeys[key]
            keys.forEach((k)=>{
                if(deptDevicesUnion[k] && deptDevicesUnion[k].length) {
                    if (!deptDevicesUnion[key]) {
                        deptDevicesUnion[key] = []
                    }
                    deptDevicesUnion[key] = _.unionBy(deptDevicesUnion[key], deptDevicesUnion[k], 'id')
                }
            })
        })
        return deptDevicesUnion
    }

    setUserDevices = (users) => {
        const {devices, companyKey} = this.state
        let userDevices = {}
        let availableDevices = []
        for (let i = 0; i < devices.length; i++) {
            let device = devices[i]
            availableDevices.push(device)
            let userId = device.user.id
            if (!userDevices[userId]) {
                userDevices[userId] = []
            }
            userDevices[userId].push(device)
        }

        const deptUsers = this.getDeptUsers(users, userDevices)
        const deptUsersUnion = this.getDeptUsersUnion(deptUsers)
        const companyDeptUsers = deptUsersUnion[companyKey] || []

        const deptDevices = this.getDeptDevices(deptUsers, userDevices)
        const deptDevicesUnion = this.getDeptDevicesUnion(deptDevices)

        this.setState({
            availableDevices: availableDevices,
            deptUsers: deptUsers,
            deptUsersUnion: deptUsersUnion,
            deptDevices: deptDevices,
            deptDevicesUnion: deptDevicesUnion,
            userDevices: userDevices,
            availableUsers: companyDeptUsers,
            currentUsers: _.cloneDeep(companyDeptUsers),
            displayUsers: companyDeptUsers,
            displayDevices: deptDevicesUnion[companyKey],
        })
    };

    handleCheckboxChange = (e, userId) => {
        let checked = e.target.checked
        let devices = this.state.userDevices[userId]
        let checkedUsers = [...this.state.checkedUsers]
        let selectedDevices = [...this.state.selectedDevices]
        let displayCheckedUsers = [...this.state.displayCheckedUsers]
        const {displayDevices, selectedKeys} = this.state

        // 有搜索值
        if(this.hasSearchOption() && this.hasParams('searchParams')) {
            const intersection = devices.filter((item)=> {
                return displayDevices.find((v) => {
                    return v.id === item.id
                })
            })

            // 有搜索出user下的全部设备
            if(intersection.length && intersection.length === devices.length) {
                if (checked) {
                    checkedUsers = this.addCheckedUser(userId, [...checkedUsers])
                    displayCheckedUsers = this.addCheckedUser(userId, [...displayCheckedUsers])
                    selectedDevices = this.addSelectedDevices(devices, [...selectedDevices])
                } else {
                    checkedUsers = this.deleteCheckedUser(userId, [...checkedUsers])
                    displayCheckedUsers = this.deleteCheckedUser(userId, [...displayCheckedUsers])
                    selectedDevices = this.deleteSelectedDevices(devices, [...selectedDevices])
                }

            } else {
                // 没有搜索出user下的全部设备
                if(checked) {
                    displayCheckedUsers = this.addCheckedUser(userId, [...displayCheckedUsers])
                    // intersection 设备交集作为选中的设备
                    selectedDevices = this.addSelectedDevices(intersection, [...selectedDevices])
                } else {
                    // 如果是取消，肯定也取消了checkedUsers
                    checkedUsers = this.deleteCheckedUser(userId, [...checkedUsers])
                    displayCheckedUsers = this.deleteCheckedUser(userId, [...displayCheckedUsers])
                    selectedDevices = this.deleteSelectedDevices(intersection, [...selectedDevices])
                }
            }

        } else {
            // 没有搜索值
            if (checked) {
                checkedUsers = this.addCheckedUser(userId, [...checkedUsers])
                displayCheckedUsers = this.addCheckedUser(userId, [...displayCheckedUsers])
                selectedDevices = this.addSelectedDevices(devices, [...selectedDevices])
            } else {
                checkedUsers = this.deleteCheckedUser(userId, [...checkedUsers])
                displayCheckedUsers = this.deleteCheckedUser(userId, [...displayCheckedUsers])
                selectedDevices = this.deleteSelectedDevices(devices, [...selectedDevices])
            }
        }

        const checkedKeys = this.getCheckedKeys(checkedUsers)

        this.setState({
            checkedUsers: checkedUsers,
            checkedKeys: checkedKeys,
            selectedDevices: selectedDevices,
            displayCheckedUsers: displayCheckedUsers,
            deptSelectedDevicesNum: this.getDeptSelectedDevicesNum(selectedKeys, selectedDevices, displayDevices)
        })
    };

    addCheckedUser = (userId, checkedUsers) => {
        if(checkedUsers.indexOf(userId) === -1){
            checkedUsers.push(userId)
        }
        return checkedUsers
    };

    deleteCheckedUser = (userId, checkedUsers) => {
        let index = checkedUsers.findIndex((item) => {
            return item === userId
        })
        if (index > -1) {
            checkedUsers.splice(index, 1)
        }
        return checkedUsers
    };

    handleSelect = (e, device) => {
        let userId = device.user.id
        let selectedDevices = [...this.state.selectedDevices]
        let {checkedUsers, displayDevices, selectedKeys} = this.state
        let index = selectedDevices.findIndex((item) => item.id === device.id)
        if (index === -1) {
            selectedDevices.push(device)
            let userDevice = this.state.userDevices[device.user.id]
            let hasAll = true
            for (let i = 0; i < userDevice.length; i++) {
                let device = userDevice[i]
                if (!selectedDevices.some((item) => item.id === device.id)) {
                    hasAll = false
                }
            }
            if (hasAll) {
                if (!checkedUsers.includes(userId)) {
                    checkedUsers.push(userId)
                }
            }
        } else {
            selectedDevices.splice(index, 1)
            let idx = checkedUsers.findIndex((item) => item === userId)
            if (idx > -1) {
                checkedUsers.splice(idx, 1)
            }
        }

        const checkedKeys = this.getCheckedKeys(checkedUsers)

        // 更新users的选中状态
        let displayCheckedUsers = [...this.state.displayCheckedUsers]

        this.setState({
            checkedKeys: checkedKeys,
            checkedUsers: checkedUsers,
            selectedDevices: selectedDevices,
            displayCheckedUsers: this.getDisplayCheckedUsers(userId, selectedDevices, displayCheckedUsers, displayDevices),
            deptSelectedDevicesNum: this.getDeptSelectedDevicesNum(selectedKeys, selectedDevices, displayDevices)
        })
    };

    getCheckedKeys = (checkedUsers) => {
        const {deptUsers} = this.state
        let checkedKeys = [...this.state.checkedKeys]
        if(!checkedUsers.length) {
            checkedKeys  = []
        } else {
            Object.keys(deptUsers).forEach((key)=>{
                const ids = deptUsers[key].map((v)=>{
                    return v.id
                })
                const intersection = _.intersection(ids, checkedUsers)
                const index = checkedKeys.indexOf(key)

                if (intersection.length && intersection.length === ids.length) {
                    if (index === -1) {
                        checkedKeys.push(key)
                    }
                } else {
                    if(index !== -1) {
                        checkedKeys.splice(index, 1)
                    }
                }
            })
        }
        return checkedKeys
    }

    getDisplayCheckedUsers = (userId, selectedDevices, displayCheckedUsers, displayDevices) => {
        let devices = this.state.userDevices[userId]
        const userCurrentDevices = devices.filter((item) => {
            return displayDevices.find((v) => {
                return v.id === item.id
            })
        })
        const userCurrentIds = userCurrentDevices.map((v) => {
            return v.id
        })
        const selectedIds = selectedDevices.map((v) => {
            return v.id
        })
        const intersection = _.intersection(selectedIds, userCurrentIds)
        if (intersection.length && intersection.length === userCurrentIds.length) {
            displayCheckedUsers = this.addCheckedUser(userId, displayCheckedUsers)

        } else {
            displayCheckedUsers = this.deleteCheckedUser(userId, displayCheckedUsers)
        }
        return displayCheckedUsers
    }

    getDeptSelectedDevicesNum = (selectedKeys, selectedDevices, displayDevices, deptDevicesUnion) => {
        deptDevicesUnion = deptDevicesUnion || this.state.deptDevicesUnion
        let selectedNum = 0
        if (selectedKeys.length && deptDevicesUnion[selectedKeys[0]] && selectedDevices.length) {
            const deptDevices = deptDevicesUnion[selectedKeys[0]]
            let devices = []
            if (this.hasSearchOption() && this.hasParams('searchParams')) {
                devices = deptDevices.filter((item) => {
                    return displayDevices.find((v) => {
                        return v.id === item.id
                    })
                })
            } else {
                devices = deptDevices
            }

            for (let i = 0; i < devices.length; i++) {
                for (let j = 0; j < selectedDevices.length; j++) {
                    if (devices[i].id === selectedDevices[j].id) {
                        selectedNum += 1
                        break
                    }
                }
            }
        }
        return selectedNum
    }

    handleChange = (key, e) => {
        let params = {...this.state.params}
        let value = ''
        if(e && e.target) {
            value = e.target.value || undefined
        } else {
            value = e
        }
        params[key] = value
        this.setState({
            params: params
        })
    }

    handlePressEnter = () => {
        const {params} = this.state
        const keyword = params && params.keyword || ''
        if(!keyword || keyword.trim()) {
            this.handleSearch()
        }
    }

    // 点击搜索和重置时调用
    handleSearch = () => {
        const {params, selectedKeys, companyKey, deptUsersUnion, deptDevicesUnion, availableUsers} = this.state
        let payload = {...params}

        // 有搜索值
        if (this.hasSearchOption() && this.hasParams('params')) {
            // 有selectedKey
            if (selectedKeys.length) {
                const selectedKey = selectedKeys[0]
                // 有选中具体的部门（不包括公司）
                if (selectedKey && selectedKey !== companyKey) {
                    payload = {
                        ...payload,
                        department_id: selectedKey
                    }
                }
            }

            // 搜索设备
            this.loadDevices(payload, (data) => {
                this.setState({
                    searchResult: data,
                }, () => {
                    const selectedKey = selectedKeys[0]
                    const resultUserIds = this.getUserIdsFromDevices(data)
                    let users = []

                    if (selectedKeys.length) {
                        users = deptUsersUnion[selectedKey] || []
                    } else {
                        users = availableUsers
                    }
                    const displayUsers = users.filter((v) => {
                        return resultUserIds.includes(v.id)
                    })

                    // 更新users的选中状态
                    let selectedDevices = [...this.state.selectedDevices]
                    let displayCheckedUsers = [...this.state.displayCheckedUsers]
                    for (let i = 0; i < displayUsers.length; i++) {
                        const userId = displayUsers[i].id
                        displayCheckedUsers = this.getDisplayCheckedUsers(userId, selectedDevices, displayCheckedUsers, data)
                    }

                    this.setState({
                        displayUsers: displayUsers,
                        displayDevices: data,
                        displayCheckedUsers: displayCheckedUsers,
                        deptSelectedDevicesNum: this.getDeptSelectedDevicesNum(selectedKeys, selectedDevices, data)
                    }, () => {
                        this.refreshList()
                    })
                })
            })

            return
        }
        // 没有搜索值，不需要搜索，显示当前部门下的数据（默认显示公司部门下的数据）
        const currentKey = selectedKeys.length ? selectedKeys[0] : companyKey
        const displayUsers = deptUsersUnion[currentKey] || []
        const displayDevices = deptDevicesUnion[currentKey] || []
        const {checkedUsers, selectedDevices} = this.state
        // 更新users的选中状态
        const displayCheckedUsers = [...checkedUsers]

        this.setState({
            params: this.getInitParams(),
            searchParams: this.getInitParams(),
            displayUsers: displayUsers,
            displayDevices: displayDevices,
            displayCheckedUsers: displayCheckedUsers,
            deptSelectedDevicesNum: this.getDeptSelectedDevicesNum(selectedKeys, selectedDevices, displayDevices),
        }, () => {
            this.refreshList()
        })
    }

    hasSearchOption = () => {
        return this.props.searchOption.length
    }

    hasParams = (field) => {
        const params = this.state[field] || {}
        let query = window.JSON.parse(window.JSON.stringify(params))
        if(Object.keys(query).length) {
            Object.keys(query).forEach((key) => {
                if (key === 'department_id' || key === 'risk_control' || (!query[key] && query[key] !== 0)) {
                    delete query[key]
                }
            })
            return Object.keys(query).length
        }
        return false
    }

    getDeptDevicesNum = (selectedKey) => {
        // 只在selectedKey存在（部门select）时计算
        const {deptDevicesUnion, searchResult} = this.state
        if(this.hasSearchOption() && this.hasParams('searchParams')) {
            return searchResult.length
        }
        return deptDevicesUnion[selectedKey] ? deptDevicesUnion[selectedKey].length : 0
    }

    resetSearchParams = () => {
        this.setState({
            params: this.getInitParams(),
            searchParams: this.getInitParams(),
        }, () =>{
            this.handleSearch()
        })
    }

    setRef = (el) => {
        this.listRef = el
    }

    render() {
        const {
            cls, visible,  searchOption,
            treeLoading, usersLoading, devicesLoading, groupLoading,
        } = this.props
        const {
            depts, expandedKeys, checkedKeys, selectedKeys,
            userDevices, availableDevices, selectedDevices,
            collapseUsers,
            deptSelectedDevicesNum,
            displayUsers, displayDevices, displayCheckedUsers,
            params, groups,
        } = this.state

        const renderItem = ({ index: idx, key, parent, style }) => {
            let user = displayUsers[idx]
            if(userDevices[user.id] && userDevices[user.id].length){
                return <CellMeasurer cache={this.measureCache} key={key} parent={parent} rowIndex={idx}>
                    {({ measure }) => {
                        this._measureCallbacks[idx] = measure
                        return <div key={user.id} style={style}>
                            <div className={styles.user}>
                                <div>
                                    <Checkbox
                                        checked={displayCheckedUsers.includes(user.id)}
                                        onChange={(e) => this.handleCheckboxChange(e, user.id)}>
                                        <span className={styles.name}>{user.nickname || user.username}</span>
                                    </Checkbox>
                                    <span className={styles.collapse}
                                        onClick={() => this.handleCollapse(user.id, idx)}>
                                        {collapseUsers.includes(user.id) ? '展开' : '折叠'}
                                    </span>
                                </div>
                                <ul className={`${styles.list} ${collapseUsers.includes(user.id) ? styles.inactive : ''}`}>
                                    {
                                        Object.keys(userDevices).length && userDevices[user.id] && userDevices[user.id].map((userDevice, index) => {

                                            const find = displayDevices.find((v)=>{
                                                return v.id === userDevice.id
                                            })

                                            if(!find) {
                                                return null
                                            }

                                            return <li key={index}
                                                onClick={(e) => this.handleSelect(e, userDevice)}
                                                className={`${styles.item}
                                                            ${ selectedDevices.findIndex((selectedDevice) => selectedDevice.id === userDevice.id) === -1 ? '' : styles.selected}`}
                                            >
                                                <p className={styles.number}>编号：{userDevice.number}</p>
                                                <p className={styles.serialno}>序列号：{userDevice.serialno}</p>
                                                <p className={styles.remark}>备注：{userDevice.remark}</p>
                                            </li>
                                        })
                                    }
                                </ul>
                            </div>
                        </div>}}
                </CellMeasurer>
            }
        }

        return (
            <Modal
                centered
                maskClosable={false}
                title={<h3>选择设备<span className={styles.subTitle}>仅支持使用新方案的note5/note7设备</span></h3>}
                width={980}
                visible={visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                afterClose={this.handleAfterClose}
                okText="确定"
                cancelText="取消"
                wrapClassName={classNames(styles.deviceSelectWrapper, cls)}
            >
                <div className={styles.content}>
                    <Spin spinning={treeLoading}>
                        <div className={styles.sidebar}>
                            <Tree
                                checkable
                                checkStrictly
                                checkedKeys={checkedKeys}
                                expandedKeys={expandedKeys}
                                selectedKeys={selectedKeys}
                                onCheck={this.onCheck}
                                onExpand={this.onExpand}
                                onSelect={this.onSelect}
                            >
                                {this.renderTreeNodes(depts)}
                            </Tree>
                        </div>
                    </Spin>
                    <div className={styles.main}>
                        {
                            this.hasSearchOption() ? <div className={styles.search}>
                                <div className={styles.row}>
                                    {
                                        searchOption.includes('keyword') ? <div className={styles.formItem}>
                                            <Input
                                                placeholder={'请输入序列号/备注/编号'}
                                                value={params.keyword}
                                                onChange={(e)=> this.handleChange('keyword', e)}
                                                onPressEnter={this.handlePressEnter}
                                            />
                                        </div> : null
                                    }
                                    {
                                        searchOption.includes('group_id') ? <div className={styles.formItem}>
                                            <Select
                                                allowClear
                                                showSearch
                                                placeholder={'请选择分组'}
                                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                optionFilterProp="children"
                                                suffixIcon={groupLoading ? <Icon type={'loading'}/> : null}
                                                style={{width: '100%'}}
                                                onChange={(value) => {this.handleChange('group_id', value)}}
                                                value={params.group_id}
                                            >
                                                {
                                                    groups.map((item) => {
                                                        return <Option key={item.id} value={item.id}>{item.name}</Option>
                                                    })
                                                }
                                            </Select>
                                        </div> : null
                                    }
                                    <div className={styles.btns}>
                                        <Button type={'primary'} onClick={this.handleSearch}>搜索</Button>
                                        <Button onClick={this.resetSearchParams}>重置</Button>
                                    </div>
                                </div>
                            </div> : null
                        }
                        <Spin spinning={!!depts.length &&(usersLoading || devicesLoading)}>
                            <div className={styles.total}>
                                <p className={styles.count}>
                                    已选中<strong className={styles.stress}>{selectedDevices.length}</strong>个设备
                                </p>
                                <p className={styles.count}>(
                                    {selectedKeys[0]
                                        ? <span>当前部门{this.getDeptDevicesNum(selectedKeys[0])}个设备，已选{deptSelectedDevicesNum}个；</span>
                                        : ''}
                                    全部{availableDevices.length}个设备)
                                </p>
                            </div>
                            <div className={styles.users}>
                                <AutoSizer>
                                    {({ width, height }) => (
                                        <VList
                                            ref={this.setRef}
                                            width={width}
                                            height={height}
                                            overscanRowCount={10}
                                            deferredMeasurementCache={this.measureCache}
                                            rowCount={displayUsers.length}
                                            rowHeight={this.measureCache.rowHeight}
                                            rowRenderer={renderItem}
                                            className={styles.scrollList}
                                        />
                                    )}
                                </AutoSizer>
                            </div>
                        </Spin>
                    </div>
                </div>
            </Modal>
        )
    }
}

