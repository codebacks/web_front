/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: liyan
 * 创建日期: 18/08/07
 */
import React, {Fragment, PureComponent} from 'react'
import {Modal, Tree, Input, Select, Checkbox, Button, Icon, Spin, Badge} from 'antd'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import _ from 'lodash'
import classNames from 'classnames'
import {AutoSizer, List as VList, CellMeasurerCache, CellMeasurer } from 'react-virtualized'
import config from 'common/config'
import {getAllTreeNodeKeys} from './util'
import styles from './index.less'

const TreeNode = Tree.TreeNode
const Option = Select.Option

const {DefaultAvatar} = config

@connect(({base, departments, users, wechats, loading}) => ({
    base, departments, users, wechats,
    treeLoading: loading.effects['departments/queryTreesCurrent'],
    usersLoading: loading.effects['users/querySub'],
    wechatsLoading: loading.effects['wechats/queryPart'],
    groupLoading: loading.effects['wechats/queryGroup']
}))
export default class extends PureComponent {
    static propTypes = {
        cls: PropTypes.string,
        visible: PropTypes.bool,
        resetOnClose: PropTypes.bool, // 关闭时重置
        disableByQrCode: PropTypes.bool, // 根据二维码禁用
        filterBySerialno: PropTypes.bool, // 根据序列号过滤
        searchOption: PropTypes.array, // 搜索项，请求参数
        onOk: PropTypes.func,
        onCancel: PropTypes.func,
    }

    static defaultProps = {
        cls: '',
        visible: false,
        resetOnClose: false,
        disableByQrCode: false,
        filterBySerialno: false,
        searchOption: [], // ['query', 'group_id', 'online']
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
            wechats: [], // 全部微信号
            treeNodeKeys: {}, // {id: [ids]} ids包括自身
            availableWeChats: [], // 全部可用的微信号（排除未激活)
            selectedWeChats: [], // 选中的微信号
            userWeChats: {}, // {user_id: [wechat]} // user下对应的微信号
            deptUsers: {}, // {dept_id: [user]}
            deptUsersUnion: {}, // {dept_id: [user]}
            availableUsers: [], // [user]全部可用user
            currentUsers: [], // [user]
            checkedUsers: [],
            deptWeChats: {}, // 部门下的微信号
            deptWeChatsUnion: {}, // {dept_id: [wechat]}
            disabledUsers: [], // 禁用的users
            halfUsers: [], // 半禁用状态users
            companyKey: '0', // 顶级公司部门key string
            selectedWeChatsOfflineNum: 0, // 选中的不在线的微信数
            deptSelectedWeChatsNum: 0, // 部门下选中微信号个数
            displayUsers: [], // 展示的users // [user]
            displayWeChats: [], // 展示的微信号 [wechat]
            displayCheckedUsers: [], // 展示的选中的users

            params: this.getInitParams(),
            searchParams: this.getInitParams(),
            groups: [], // 微信号分组
            searchResult: [], // 搜索的结果
        }
    }

    getInitParams = () => {
        return {
            query: undefined, // 昵称/备注/微信号
            online: undefined, // 是否在线 init 0, 1
            group_id: undefined, // 微信号分组id
            department_id: undefined, // 部门id
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
            type: 'wechats/queryGroup',
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
                            // 加载全部微信号
                            this.loadWeChats({}, (data)=>{
                                this.setState({
                                    wechats: data,
                                },()=>{
                                    // 请求公司下的全部员工
                                    this.loadUsers({
                                        department_id: companyKey
                                    },(users)=>{
                                        this.setUserWeChats(users)
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

    loadWeChats = (payload={}, callback) => {
        this.props.dispatch({
            type: 'wechats/queryPart',
            payload: payload,
            callback: (data) => {
                if(this._isMounted) {
                    this.setState({
                        searchParams: payload
                    })
                    // 过滤搜索结果
                    if (this.props.filterBySerialno) {
                        data = data.filter((v) => {
                            return v.serialno
                        })
                    }
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
        this.props.onOk && this.props.onOk(this.state.selectedWeChats)
    };

    handleCancel = () => {
        this.props.onCancel && this.props.onCancel()
    };

    handleAfterClose = () => {
        if(this.props.resetOnClose) {
            const {companyKey, depts, deptUsersUnion, deptWeChatsUnion} = this.state
            const companyUsers = deptUsersUnion[companyKey] || []
            this.setState({
                expandedKeys: this.getDefaultExpandedKeys(depts), // 默认展开
                checkedKeys: [], // checkbox checked key string 已选中的部门
                selectedKeys: [companyKey], // selected key string 部门树的selectedKeys
                collapseUsers: [], // 折叠的员工
                selectedWeChats: [], // 选中的微信号

                currentUsers: _.cloneDeep(companyUsers), // [user]
                checkedUsers: [],
                selectedWeChatsOfflineNum: 0, // 选中的不在线的微信数
                deptSelectedWeChatsNum: 0, // 部门下选中微信号个数
                displayUsers: companyUsers, // 展示的users // [user]
                displayWeChats: deptWeChatsUnion[companyKey] || [], // 展示的微信号 [wechat]
                displayCheckedUsers: [], // 展示的选中的users

                params: this.getInitParams(),
                searchParams: this.getInitParams(),
                searchResult: [], // 搜索的结果
            }, () => {
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

    getCurrentUsers = (selectedWeChats) => {
        return this.state.availableUsers.filter((user)=>{
            return selectedWeChats.find((v)=>{
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

    getUserIdsFromWeChats = (wechats) => {
        const resultUserIds = wechats.map(v => v.user.id)
        return [...new Set(resultUserIds)]
    }

    onCheck = ({checked: checkedKeys}, {checked, node, event}) => {
        this.setState({
            selectedKeys: [], // 取消节点的selected状态
        })

        const {treeNodeKeys, userWeChats, availableUsers} = this.state
        const eventKey = node.props.eventKey
        const eventChildrenKeys = treeNodeKeys[eventKey]
        const eventUsers =  this.getUsersByKeys(eventChildrenKeys) // eventKey部门下的users

        let checkedUsers = [...this.state.checkedUsers]
        let selectedWeChats = this.state.selectedWeChats

        // 选中部门
        if (checked) {
            for (let i = eventUsers.length - 1; i >= 0; i--) {
                let item = eventUsers[i]
                // 默认全选中users
                checkedUsers = this.addCheckedUser(item.id, [...checkedUsers])
                // 默认全选中微信
                selectedWeChats = this.addSelectedWeChats(userWeChats[item.id], selectedWeChats)
            }
        } else {
            // 取消部门
            const cancelIds = eventUsers.map(v => v.id)

            checkedUsers = checkedUsers.filter((id)=>{
                return !cancelIds.includes(id)
            })
            selectedWeChats = selectedWeChats.filter((v)=>{
                return !cancelIds.includes(v.user.id)
            })
        }

        const selectedUsersIds = this.getUserIdsFromWeChats(selectedWeChats)
        const displayUsers = availableUsers.filter((user)=>{
            return selectedUsersIds.includes(user.id)
        })

        let displayWeChats = []
        selectedUsersIds.forEach((id)=>{
            displayWeChats = displayWeChats.concat(userWeChats[id])
        })

        this.setState({
            checkedKeys: this.getCurrentCheckedKeys(eventKey, checked),
            checkedUsers: checkedUsers,
            selectedWeChats: selectedWeChats,
            displayCheckedUsers: _.cloneDeep(checkedUsers),
            displayUsers: displayUsers,
            displayWeChats: displayWeChats,
            selectedWeChatsOfflineNum: this.getSelectedWeChatsOfflineNum(selectedWeChats),
            currentUsers: this.getCurrentUsers(selectedWeChats)
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
        const {deptUsersUnion, deptWeChatsUnion, selectedWeChats} = this.state
        const deptUsers = deptUsersUnion[selectedKey] || []
        const deptWeChats = deptWeChatsUnion[selectedKey] || []

        // 有搜索值
        if(this.hasSearchOption() && this.hasParams('params')) {
            const {params} = this.state
            const payload = {
                ...params,
                department_id: selectedKey
            }

            this.loadWeChats(payload, (data)=>{
                this.setState({
                    searchResult: data,
                }, ()=>{
                    const resultUserIds = this.getUserIdsFromWeChats(data)
                    const displayUsers = deptUsers.filter((v) => {
                        return resultUserIds.includes(v.id)
                    })

                    this.setState({
                        selectedKeys: selectedKeys,
                        displayUsers: displayUsers,
                        displayWeChats: data,
                        deptSelectedWeChatsNum: this.getDeptSelectedWeChatsNum(selectedKeys, selectedWeChats, data),
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
                displayWeChats: deptWeChats,
                deptSelectedWeChatsNum: this.getDeptSelectedWeChatsNum(selectedKeys, selectedWeChats, deptWeChats)
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

    addSelectedWeChats = (wechats, selectedWeChats) => {
        const {disableByQrCode} = this.props
        if (wechats) {
            wechats.forEach((wechat) => {
                let index = selectedWeChats.findIndex((item) => item.uin === wechat.uin)
                if (index === -1) {
                    if(disableByQrCode && !wechat.qrcode_url){
                        return false // continue
                    }
                    selectedWeChats.push(wechat)
                }
            })
        }
        return selectedWeChats
    };

    deleteSelectedWeChats = (wechats, selectedWeChats) => {
        if (wechats) {
            wechats.forEach((wechat) => {
                let index = selectedWeChats.findIndex((item) => item.uin === wechat.uin)
                if (index > -1) {
                    selectedWeChats.splice(index, 1)
                }
            })
        }
        return selectedWeChats
    };

    getDeptUsers = (users, userWeChats) => {
        let deptUsers = {}
        const availableUsersKeys = Object.keys(userWeChats)
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
        let deptUsersUnion = {}
        const {treeNodeKeys} = this.state
        Object.keys(treeNodeKeys).forEach((key) => {
            const keys = treeNodeKeys[key]
            keys.forEach((k) => {
                if (deptUsers[k] && deptUsers[k].length) {
                    if (!deptUsersUnion[key]) {
                        deptUsersUnion[key] = []
                    }
                    deptUsersUnion[key] = _.unionBy(deptUsersUnion[key], deptUsers[k], 'id')
                }
            })
        })
        return deptUsersUnion
    }

    getDeptWeChats = (deptUsers, userWeChats) => {
        const {treeNodeKeys} = this.state
        let deptWeChats = {}

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

            deptWeChats[key] = []
            users.forEach((user) => {
                deptWeChats[key] = deptWeChats[key].concat(userWeChats[user.id])
            })
        })
        return deptWeChats
    }

    getDeptWeChatsUnion = (deptWeChats) => {
        let deptWeChatsUnion = _.cloneDeep(deptWeChats)
        const {treeNodeKeys} = this.state
        Object.keys(treeNodeKeys).forEach((key)=>{
            const keys = treeNodeKeys[key]
            keys.forEach((k)=>{
                if(deptWeChatsUnion[k] && deptWeChatsUnion[k].length) {
                    if (!deptWeChatsUnion[key]) {
                        deptWeChatsUnion[key] = []
                    }
                    deptWeChatsUnion[key] = _.unionBy(deptWeChatsUnion[key], deptWeChatsUnion[k], 'uin')
                }
            })
        })
        return deptWeChatsUnion
    }

    setUserWeChats = (users) => {
        const {wechats, companyKey} = this.state
        const {disableByQrCode, filterBySerialno} = this.props
        let halfUsers = []
        let userWeChats = {}
        let availableWeChats = []
        for (let i = 0; i < wechats.length; i++) {
            let wechat = wechats[i]
            // 过滤无序列号
            if (filterBySerialno && !wechat.serialno) {
                continue
            }
            availableWeChats.push(wechat)
            let userId = wechat.user.id
            if (!userWeChats[userId]) {
                userWeChats[userId] = []
            }

            // 禁用的微信号排在末尾
            if(disableByQrCode){
                if (wechat.qrcode_url) {
                    userWeChats[userId].unshift(wechat)
                } else {
                    if(halfUsers.indexOf(userId) === -1){
                        halfUsers.push(userId)
                    }
                    userWeChats[userId].push(wechat)
                }
            } else {
                userWeChats[userId].push(wechat)
            }
        }

        if(disableByQrCode){
            let disabledUsers = []
            Object.keys(userWeChats).forEach((key) => {
                let disabledAll = userWeChats[key].every((item) => {
                    return !item.qrcode_url
                })
                if (disabledAll) {
                    disabledUsers.push(parseInt(key, 10))
                }
            })
            this.setState({
                halfUsers: halfUsers,
                disabledUsers: disabledUsers
            })
        }

        const deptUsers = this.getDeptUsers(users, userWeChats)
        const deptUsersUnion = this.getDeptUsersUnion(deptUsers)
        const companyDeptUsers = deptUsersUnion[companyKey] || []

        const deptWeChats = this.getDeptWeChats(deptUsers, userWeChats)
        const deptWeChatsUnion = this.getDeptWeChatsUnion(deptWeChats)

        this.setState({
            availableWeChats: availableWeChats,
            deptUsers: deptUsers,
            deptUsersUnion: deptUsersUnion,
            deptWeChats: deptWeChats,
            deptWeChatsUnion: deptWeChatsUnion,
            userWeChats: userWeChats,
            availableUsers: companyDeptUsers,
            currentUsers: _.cloneDeep(companyDeptUsers),
            displayUsers: companyDeptUsers,
            displayWeChats: deptWeChatsUnion[companyKey],
        })
    };

    handleCheckboxChange = (e, userId) => {
        const checked = e.target.checked
        const {displayWeChats, selectedKeys} = this.state
        let wechats = this.state.userWeChats[userId]
        let checkedUsers = [...this.state.checkedUsers]
        let selectedWeChats = [...this.state.selectedWeChats]
        let displayCheckedUsers = [...this.state.displayCheckedUsers]

        // 有搜索值
        if(this.hasSearchOption() && this.hasParams('searchParams')) {
            const intersection = wechats.filter((item)=> {
                return displayWeChats.find((v) => {
                    return v.uin === item.uin
                })
            })

            // 有搜索出user下的全部微信号
            if(intersection.length && intersection.length === wechats.length) {
                if (checked) {
                    checkedUsers = this.addCheckedUser(userId, [...checkedUsers])
                    displayCheckedUsers = this.addCheckedUser(userId, [...displayCheckedUsers])
                    selectedWeChats = this.addSelectedWeChats(wechats, [...selectedWeChats])
                } else {
                    checkedUsers = this.deleteCheckedUser(userId, [...checkedUsers])
                    displayCheckedUsers = this.deleteCheckedUser(userId, [...displayCheckedUsers])
                    selectedWeChats = this.deleteSelectedWeChats(wechats, [...selectedWeChats])
                }

            } else {
                // 没有搜索出user下的全部微信号
                if(checked) {
                    displayCheckedUsers = this.addCheckedUser(userId, [...displayCheckedUsers])
                    // intersection 微信号交集作为选中的微信
                    selectedWeChats = this.addSelectedWeChats(intersection, [...selectedWeChats])
                    // 如果差集是无法选中的微信号，认为user是选中的
                    const differenceWeChats = wechats.filter((item)=> {
                        return intersection.find((v) => {
                            return v.uin !== item.uin
                        })
                    })

                    if(this.props.disableByQrCode) {
                        const enableWeChats = differenceWeChats.filter((v)=>{
                            return v.qrcode_url
                        })
                        // 剩下微信号中没有可选的微信号
                        if(!enableWeChats.length) {
                            checkedUsers = this.addCheckedUser(userId, [...checkedUsers])
                        }
                    }

                } else {
                    // 如果是取消，肯定也取消了checkedUsers
                    checkedUsers = this.deleteCheckedUser(userId, [...checkedUsers])
                    displayCheckedUsers = this.deleteCheckedUser(userId, [...displayCheckedUsers])
                    selectedWeChats = this.deleteSelectedWeChats(intersection, [...selectedWeChats])
                }
            }

        } else {
            // 没有搜索值
            if (checked) {
                checkedUsers = this.addCheckedUser(userId, [...checkedUsers])
                displayCheckedUsers = this.addCheckedUser(userId, [...displayCheckedUsers])
                selectedWeChats = this.addSelectedWeChats(wechats, [...selectedWeChats])
            } else {
                checkedUsers = this.deleteCheckedUser(userId, [...checkedUsers])
                displayCheckedUsers = this.deleteCheckedUser(userId, [...displayCheckedUsers])
                selectedWeChats = this.deleteSelectedWeChats(wechats, [...selectedWeChats])
            }
        }

        const checkedKeys = this.getCheckedKeys(checkedUsers)

        this.setState({
            checkedUsers: checkedUsers,
            checkedKeys: checkedKeys,
            selectedWeChats: selectedWeChats,
            displayCheckedUsers: displayCheckedUsers,
            selectedWeChatsOfflineNum: this.getSelectedWeChatsOfflineNum(selectedWeChats),
            deptSelectedWeChatsNum: this.getDeptSelectedWeChatsNum(selectedKeys, selectedWeChats, displayWeChats)
        })
    };

    addCheckedUser = (userId, checkedUsers) => {
        const {disableByQrCode} = this.props
        const {disabledUsers} = this.state
        if (disableByQrCode) {
            if (disabledUsers.includes(userId)) {
                return checkedUsers
            }
        }
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

    handleSelect = (e, wechat) => {
        const {disableByQrCode} = this.props
        if (disableByQrCode && !wechat.qrcode_url) {
            return
        }
        let userId = wechat.user.id
        let selectedWeChats = [...this.state.selectedWeChats]
        let {checkedUsers} = this.state
        let index = selectedWeChats.findIndex((item) => item.uin === wechat.uin)
        if (index === -1) {
            selectedWeChats.push(wechat)
            let userWeChat = this.state.userWeChats[wechat.user.id]
            let hasAll = true
            for (let i = 0; i < userWeChat.length; i++) {
                let wechat = userWeChat[i]
                if (!selectedWeChats.some((item) => item.uin === wechat.uin)) {
                    hasAll = false
                }
            }
            if (hasAll) {
                if (!checkedUsers.includes(userId)) {
                    checkedUsers.push(userId)
                }
            }
        } else {
            selectedWeChats.splice(index, 1)
            let idx = checkedUsers.findIndex((item) => item === userId)
            if (idx > -1) {
                checkedUsers.splice(idx, 1)
            }
        }

        const checkedKeys = this.getCheckedKeys(checkedUsers)

        // 更新users的选中状态
        const {displayWeChats, selectedKeys} = this.state
        let displayCheckedUsers = [...this.state.displayCheckedUsers]

        this.setState({
            checkedKeys: checkedKeys,
            checkedUsers: checkedUsers,
            selectedWeChats: selectedWeChats,
            displayCheckedUsers: this.getDisplayCheckedUsers(userId, selectedWeChats, displayCheckedUsers, displayWeChats),
            deptSelectedWeChatsNum: this.getDeptSelectedWeChatsNum(selectedKeys, selectedWeChats, displayWeChats),
            selectedWeChatsOfflineNum: this.getSelectedWeChatsOfflineNum(selectedWeChats),
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

    getDisplayCheckedUsers = (userId, selectedWeChats, displayCheckedUsers, displayWeChats) => {
        let wechats = this.state.userWeChats[userId]
        // 当前user下显示的微信号，计算选中状态时排除禁用的微信号
        const userCurrentWeChats = wechats.filter((item) => {
            if (this.props.disableByQrCode && !item.qrcode_url) {
                return false
            }
            return displayWeChats.find((v) => {
                return v.uin === item.uin
            })
        })

        const userCurrentUins = userCurrentWeChats.map((v) => {
            return v.uin
        })
        const selectedUins = selectedWeChats.map((v) => {
            return v.uin
        })
        const intersection = _.intersection(selectedUins, userCurrentUins)
        if (intersection.length && intersection.length === userCurrentUins.length) {
            displayCheckedUsers = this.addCheckedUser(userId, displayCheckedUsers)
        } else {
            displayCheckedUsers = this.deleteCheckedUser(userId, displayCheckedUsers)
        }
        return displayCheckedUsers
    }

    getSelectedWeChatsOfflineNum = (selectedWeChats) => {
        return selectedWeChats.filter((v)=>{
            return !v.im_online_status
        }).length
    }

    getDeptSelectedWeChatsNum = (selectedKeys, selectedWeChats, displayWeChats, deptWeChatsUnion) => {
        deptWeChatsUnion = deptWeChatsUnion || this.state.deptWeChatsUnion
        let selectedNum = 0
        if (selectedKeys.length && deptWeChatsUnion[selectedKeys[0]] && selectedWeChats.length) {
            const deptWeChats = deptWeChatsUnion[selectedKeys[0]]
            let wechats = []
            if (this.hasSearchOption() && this.hasParams('searchParams')) {
                wechats = deptWeChats.filter((item) => {
                    return displayWeChats.find((v) => {
                        return v.uin === item.uin
                    })
                })
            } else {
                wechats = deptWeChats
            }

            for (let i = 0; i < wechats.length; i++) {
                for (let j = 0; j < selectedWeChats.length; j++) {
                    if (wechats[i].uin === selectedWeChats[j].uin) {
                        selectedNum += 1
                        break
                    }
                }
            }
        }
        return selectedNum
    }

    getDeptWeChatsNum = (selectedKey) => {
        // 只在selectedKey存在时计算
        const {deptWeChatsUnion, searchResult} = this.state
        if(this.hasSearchOption() && this.hasParams('searchParams')) {
            return searchResult.length
        }
        return deptWeChatsUnion[selectedKey] ? deptWeChatsUnion[selectedKey].length : 0
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

    handleSearchCheckboxChange = (key, e) => {
        const checked = e.target.checked
        let params = {...this.state.params}
        params[key] = checked ? 1 : undefined
        this.setState({
            params: params
        }, () => {
            this.handleSearch()
        })
    }

    handlePressEnter = () => {
        const {params} = this.state
        const query = params && params.query || ''
        if(!query || query.trim()) {
            this.handleSearch()
        }
    }

    // 点击搜索和重置时调用
    handleSearch = () => {
        const {params, selectedKeys, companyKey,
            deptUsersUnion, deptWeChatsUnion,
            availableUsers, checkedUsers, selectedWeChats} = this.state
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

            // 搜索微信号
            this.loadWeChats(payload, (data) => {
                this.setState({
                    searchResult: data,
                }, () => {
                    const selectedKey = selectedKeys[0]
                    const resultUserIds = this.getUserIdsFromWeChats(data)
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
                    let displayCheckedUsers = [...this.state.displayCheckedUsers]
                    for (let i = 0; i < displayUsers.length; i++) {
                        const userId = displayUsers[i].id
                        displayCheckedUsers = this.getDisplayCheckedUsers(userId, selectedWeChats, displayCheckedUsers, data)
                    }

                    this.setState({
                        displayUsers: displayUsers,
                        displayWeChats: data,
                        displayCheckedUsers: displayCheckedUsers,
                        deptSelectedWeChatsNum: this.getDeptSelectedWeChatsNum(selectedKeys, selectedWeChats, data)
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
        const displayWeChats = deptWeChatsUnion[currentKey] || []
        // 更新users的选中状态
        const displayCheckedUsers = [...checkedUsers]

        this.setState({
            params: this.getInitParams(),
            searchParams: this.getInitParams(),
            displayUsers: displayUsers,
            displayWeChats: displayWeChats,
            displayCheckedUsers: displayCheckedUsers,
            deptSelectedWeChatsNum: this.getDeptSelectedWeChatsNum(selectedKeys, selectedWeChats, displayWeChats)
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
                if (key ==='department_id' || (!query[key] && query[key] !== 0)) {
                    delete query[key]
                }
            })
            return Object.keys(query).length
        }
        return false
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
            cls, visible, searchOption, disableByQrCode,
            treeLoading, usersLoading, wechatsLoading, groupLoading,
        } = this.props
        const {
            depts, expandedKeys, checkedKeys, selectedKeys,
            userWeChats, availableWeChats, selectedWeChats,
            collapseUsers, disabledUsers, halfUsers,
            selectedWeChatsOfflineNum, deptSelectedWeChatsNum,
            displayUsers, displayWeChats, displayCheckedUsers,
            params, groups,
        } = this.state

        const intersection = disableByQrCode && displayUsers.filter((user)=>{
            return halfUsers.indexOf(user.id) > -1
        })

        const showTip = intersection && intersection.length

        const renderItem = ({ index: idx, key, parent, style }) => {
            let user = displayUsers[idx]

            if(userWeChats[user.id] && userWeChats[user.id].length){
                return <CellMeasurer cache={this.measureCache} key={key} parent={parent} rowIndex={idx}>
                    {({ measure }) => {
                        this._measureCallbacks[idx] = measure
                        return <div key={user.id} style={style}>
                            <div className={styles.user}>
                                <div>
                                    <Checkbox
                                        disabled={disableByQrCode && disabledUsers.includes(user.id)}
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
                                        Object.keys(userWeChats).length && userWeChats[user.id] && userWeChats[user.id].map((userWeChat, index) => {

                                            const find = displayWeChats.find((v)=>{
                                                return v.id === userWeChat.id
                                            })

                                            if (!find) {
                                                return null
                                            }

                                            return <li key={index}
                                                onClick={(e) => this.handleSelect(e, userWeChat)}
                                                className={`${styles.item} ${ disableByQrCode && !userWeChat.qrcode_url ? styles.disabled : ''}
                                                            ${ selectedWeChats.findIndex((selectedWeChat) => selectedWeChat.uin === userWeChat.uin) === -1 ? '' : styles.selected}`}
                                            >
                                                <div className={styles.left}>
                                                    <img src={userWeChat.head_img_url}
                                                        className={styles.avatar}
                                                        onError={(e)=>{e.target.src = DefaultAvatar}}
                                                        rel="noreferrer"
                                                        alt={''}
                                                    />
                                                    {
                                                        searchOption.includes('online') ? <span className={styles.status}>
                                                            {
                                                                userWeChat.im_online_status ? <Badge status={'success'} text={'在线'}/>
                                                                    : <Badge status={'default'} text={'离线'}/>
                                                            }
                                                        </span> : null
                                                    }
                                                </div>
                                                <div className={styles.right}>
                                                    {
                                                        userWeChat.remark ?
                                                            <Fragment>
                                                                <p className={styles.remark}>备注：{userWeChat.remark}</p>
                                                                <p className={styles.nickname}>昵称：{userWeChat.nickname}</p>
                                                            </Fragment>
                                                            :
                                                            <Fragment>
                                                                <p className={styles.nickname}>昵称：{userWeChat.nickname}</p>
                                                                <p className={styles.username}>微信号：{userWeChat.alias || userWeChat.username}</p>
                                                            </Fragment>
                                                    }
                                                </div>
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
                title="选择微信"
                width={980}
                visible={visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                afterClose={this.handleAfterClose}
                okText="确定"
                cancelText="取消"
                wrapClassName={classNames(styles.weChatSelectWrapper, cls)}
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
                                        searchOption.includes('query') ? <div className={styles.formItem}>
                                            <Input
                                                placeholder={'请输入微信昵称/备注/微信号'}
                                                value={params.query}
                                                onChange={(e)=> this.handleChange('query', e)}
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
                                                style={{width: '100%'}}
                                                suffixIcon={groupLoading ? <Icon type={'loading'}/> : null}
                                                value={params.group_id}
                                                onChange={(value) => {this.handleChange('group_id', value)}}
                                            >
                                                <Option value={''}>全部分组</Option>
                                                <Option value={0}>未分组</Option>
                                                {
                                                    groups.map((item) => {
                                                        return <Option key={item.group_id} value={item.group_id}>{item.title}</Option>
                                                    })
                                                }
                                            </Select>
                                        </div> : null
                                    }
                                    {
                                        searchOption.includes('online') ?  <div className={styles.formItem}>
                                            <Checkbox
                                                checked={!!params.online}
                                                onChange={(e) => this.handleSearchCheckboxChange('online', e)}
                                            >只显示在线的微信号</Checkbox>
                                        </div> : null
                                    }
                                    <div className={styles.btns}>
                                        <Button type={'primary'} onClick={this.handleSearch}>搜索</Button>
                                        <Button onClick={this.resetSearchParams}>重置</Button>
                                    </div>
                                </div>
                            </div> : null
                        }
                        <Spin spinning={!!depts.length &&(usersLoading || wechatsLoading)}>
                            <div className={styles.total}>
                                <p className={styles.count}>
                                    已选中<strong className={styles.stress}>{selectedWeChats.length}</strong>个微信
                                    {
                                        this.hasSearchOption() && searchOption.includes('online') ? <Fragment>
                                        ，不在线<strong className={styles.error}>{selectedWeChatsOfflineNum}</strong>个
                                        </Fragment> : null
                                    }
                                </p>
                                <p className={styles.count}>(
                                    {selectedKeys[0]
                                        ? <span>当前部门{this.getDeptWeChatsNum(selectedKeys[0])}个微信号，已选{deptSelectedWeChatsNum}个；</span>
                                        : ''}
                                    全部{availableWeChats.length}个微信号)
                                </p>
                                { disableByQrCode ? <p className={styles.tip}>{ showTip ? '不可选择的微信号，二维码名片未上传，请前往"个人号"上传完善' : ''}</p> : null}
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

