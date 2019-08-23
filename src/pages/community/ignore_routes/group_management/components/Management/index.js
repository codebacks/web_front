import React from 'react'
import {
    Table,
    Button,
    Form,
    Input,
    Select,
    Switch,
    Row,
    Col,
    Pagination,
    Icon,
    Popover,
    message,
    Badge,
    Alert,
    Checkbox,
    Modal,
    Spin,
} from 'antd'
import {connect} from 'dva'
import router from "umi/lib/router"
import documentTitleDecorator from 'hoc/documentTitle'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import DivideSelect from 'components/business/DivideSelect'
import SetDivideModal from 'components/business/SetDivideModal'
import WorkGroupModal from './components/WorkGroupModal'
import AutoReplyModal from './components/AutoReplyModal'
import RemarkEdit from './components/RemarkEdit'
import config from 'community/common/config'
import styles from './index.less'
import AddReplyMember from "community/components/AddReplyMember"
import GroupSetting from 'community/components/GroupSetting'
import GroupHistoryModal from 'components/business/GroupHistoryModal'
import _ from 'lodash'
import moment from 'moment'
import DateRange from "components/DateRange"

const FormItem = Form.Item
const Option = Select.Option

const { pageSizeOptions, DateTimeFormat, DateFormat } = config
// const pageSizeOptions = ['10', '20']

@connect(({base, community_group_management, loading, community_group_messages}) => ({
    base, community_group_management, community_group_messages,
    queryLoading: loading.effects['community_group_management/query'],
    groupDetailLoading: loading.effects['community_group_management/groupDetail'],
    updateLoading: loading.effects['community_group_management/update'],
    taskIdLoading: loading.effects['community_group_management/exportTask'],
    checkWorkGroupLoading: loading.effects['community_group_management/checkWorkGroup'],
    setWorkGroupLoading: loading.effects['community_group_management/setWorkGroup'],
    getAllUsersLoading: loading.effects['community_group_management/getAllUsers'],
}))
@documentTitleDecorator({
    overrideTitle: '群管理',
})
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            record: null,
            sortedInfo: {
                order: 'descend',
                columnKey: 'target.create_time',
            }, // 默认创建时间降序
            exportLoading: false, // 导出loading
            hadClickAll: false, // 是否第一次点击全选
        }
    }

    componentDidMount() {
        this._isMounted = true
        this.props.dispatch({
            type: 'community_group_management/statisticsAndGroupDivideOptions',
        })
        this.goPage(1)
    };

    componentWillUnmount() {
        this._isMounted = false
        this.resetParams()
    }

    getAllUsers = () => {
        this.props.dispatch({
            type: 'community_group_management/getAllUsers',
        })
        this.setState({
            hadClickAll: true
        })
    }

    handleSearch = () => {
        this.getAllUsers()
        this.goPage(1)
    }
    handleChange = (key, e) => {
        let val = ''
        if(key === 'query') {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.community_group_management.params}
        params[key] = val
        if(key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        }else if(key === 'user_id') {
            params['uin'] = undefined
        }
        this.props.dispatch({
            type: 'community_group_management/setParams',
            payload: {
                params: params,
            },
        })
    }
    handleChangeSize = (current, size) => {
        let params = {...this.props.community_group_management.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_group_management/setProperty',
            payload: {params: params},
        })
        this.goPage(1) // 重置个数时回到首页
    }
    goPage = (page) => {
        this.props.dispatch({
            type: 'community_group_management/query',
            payload: {page: page},
        })
    }
    handleShowRemarkEdit = (record) => {
        this.setState({showRemarkEdit: true, record: record})
    }

    handleOkRemarkEdit = (record, index) => {
        this.handleCancelRemarkEdit()
        this.recordRefresh(record, index)
    }

    onChangeRemarkEditVisible = (visible) => {
        this.setState({showRemarkEdit: visible,})
    }

    handleCancelRemarkEdit = () => {
        this.setState({showRemarkEdit: false})
    }

    goMembers = (record) => {
        router.push({
            pathname: `/community/group_management/group_members`,
            query: {
                uin: record.from.uin,
                username: record.target.username,
            },
            state: {
                record: record,
            },
        })
    }
    update = (record, e) => {
        // 退出
        if(record.target.status === -1) {
            message.warning('您已退出该群，不支持设为工作群')
            return
        }
        this.setState({
            updateRecord: record,
        })
        this.props.dispatch({
            type: 'community_group_management/update',
            payload: {
                uin: record.from.uin,
                username: record.target.username,
                body: {
                    is_sync: e,
                },
            },
            callback: () => {
                record.target.is_sync = e
                this.setState({
                    record: record,
                })
            },
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_group_management/resetParams',
        })
        this.props.dispatch({
            type: 'community_group_management/resetCheckAllParams',
        })
        this.createTime.setDate(null, null)
        this.resetSortedInfo()
    }

    recordRefresh = (record, index) => {
        this.props.dispatch({
            type: 'community_group_management/groupDetail',
            payload: {
                uin: record?.from?.uin,
                username: record?.target?.username,
                index,
            }
        })
    }

    refresh = (record, index) => {
        const { current } = this.props.community_group_management
        this.goPage(current || 1)
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.getAllUsers()
            this.goPage(1)
        }, 0)
    }

    showSmartStatus = (status = 0, type = 0) => {
        const statusMap = {
            '0': '关闭',
            '1': '开启',
        }
        const typeMap = {
            '0': '默认',
            '1': '自定义',
        }
        return `${statusMap[status]}(${typeMap[type]})`
    }

    CheckboxChange = (type, e) => {
        const val = e.target.checked
        let params = {...this.props.community_group_management.params}
        params[type] = val ? 1 : undefined
        this.props.dispatch({
            type: 'community_group_management/setParams',
            payload: {
                params: params,
            },
        })
        setTimeout(() => {
            this.getAllUsers()
            this.goPage(1)
        }, 100)
    }

    getStatusTxt = (status) => {
        let txt = ''
        switch(status) {
            case 0:
                txt = '关闭'
                break
            case 1:
                txt = '自定义'
                break
            case 2:
                txt = '全局'
                break
            case 3:
                txt = '模板'
                break
            // 没有default
        }
        return txt
    }

    getReplierStatusCont = (replier) => {
        let cont = ''
        const {exception_status} = replier
        switch(exception_status) {
            case -1:
                cont = <span className={`${styles.replier} ${styles.red}`}>未设置</span>
                break
            case 0:
                cont = <span className={styles.replier}> {replier?.nickname}</span>
                break
            case 1:
            case 2:
                cont = <span className={`${styles.replier} ${styles.red}`}>异常</span>
                break
        }
        return cont
    }

    getReplierStatusErrorCont = (replier) => {
        let reasonTxt = '', cont = null
        const {exception_status, nickname} = replier
        if(exception_status === 1 || exception_status === 2) {
            exception_status === 1 ? reasonTxt = '回复者离线' : reasonTxt = '回复者退群'
            cont = <>
                <div className={styles.abnormal}>原回复者：{nickname}</div>
                <div className={styles.abnormal}>
                    <span>原因：</span>
                    <span>{reasonTxt}</span>
                </div>
            </>
        }
        return cont
    }

    handleSwitchChange = (e, record) => {
        if(e && (record?.auto_greet?.replier?.exception_status === -1)) {
            message.warning('检测到回复者未配置，首次配置已设置回复人为所属微信号')
        }
    }

    handleChangeCreateDate = (startValue, endValue) => {
        let params = {...this.props.community_group_management.params}
        if (startValue) {
            params.create_time_start = moment(startValue).format(DateFormat) + ' 00:00:00'
        } else {
            params.create_time_start = ''
        }
        if (endValue) {
            params.create_time_end = moment(endValue).format(DateFormat) + ' 23:59:59'
        } else {
            params.create_time_end = ''
        }
        this.props.dispatch({
            type: 'community_group_management/setParams',
            payload: {params: params}
        })
    }

    handleTableChange = (pagination, filters, sorter) => {
        const field = sorter.field || '', order = sorter.order || ''
        const sortedInfo = {
            order: sorter.order,
            columnKey: sorter.field,
        }
        let params = {...this.props.community_group_management.params}
        let val = _.last(field.split('.'))
        if (order === 'descend') {
            params['order_by'] = `-${val}`
        } else {
            params['order_by'] = val
        }
        this.props.dispatch({
            type: 'community_group_management/query',
            payload: {
                params,
                page: 1
            },
        })
        this.setState({sortedInfo})
    }
    resetSortedInfo = () => {
        this.setState({
            sortedInfo: null
        })
    }

    // 导出列表
    handleExport = () => {
        this.getExportId()
    }
    getExportBody = () => {
        const body = _.cloneDeep(this.props.community_group_management.params)
        if (body.hasOwnProperty('offset')) {
            delete body['offset']
        }
        if (body.hasOwnProperty('limit')) {
            delete body['limit']
        }
        return body
    }
    getExportId = () => {
        const body = this.getExportBody()
        this.props.dispatch({
            type: 'community_group_management/exportTask',
            payload: {body},
            callback: (data) => {
                this.setState({exportLoading: true})
                this.getExportStatus(data.task_id)
            }
        })
    }
    getExportStatus = (taskId) => {
        this.props.dispatch({
            type: 'community_group_management/exportStatus',
            payload: {taskId},
            callback: (response) => {
                if (this._isMounted) {
                    if (response.status >= 200 && response.status < 300) {
                        response.json().then((res) => {
                            if (res.data.status) {
                                this.setState({exportLoading: false})
                                this.exportExcel(taskId)
                            } else {
                                this.timer = setTimeout(() => {
                                    this.getExportStatus(taskId)
                                }, 1000)
                            }
                        }).catch((err) => {
                            console.error(err)
                            this.setState({exportLoading: false})
                        })
                    } else {
                        this.setState({exportLoading: false})
                    }
                }
            }
        })
    }
    exportExcel = (taskId) => {
        const url = `http://public.51zan.com/chatroom_export/${taskId}/群管理数据导出.xlsx`
        let a = document.createElement('a')
        // a.download = `群列表数据导出-${moment().format(DateFormat)}.xlsx`
        a.href = url
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    setDivide = (setTrue) => {
        const { selectedRowKeys } = this.props.community_group_management
        if(!selectedRowKeys.length) {
            message.warning('请先选择需要分组的群!')
        }else{
            let chatrooms = selectedRowKeys.map((item) => {
                let itemArr = item.split(',')
                return {
                    uin: itemArr[0],
                    chatroomname: itemArr[1],
                }
            })
            this.props.dispatch({
                type: 'community_group_management/checkWorkGroup',
                payload: {
                    body: {chatrooms}
                },
            })
            setTrue()
        }
    }

    setDivideModalOk = (id, selectedRowKeys) => {
        let chatrooms = selectedRowKeys.map((item, index) => {
            return item.split(',')[1]
        })
        this.props.dispatch({
            type: 'community_group_management/setGroupDivide',
            payload: {
                id,
                body: {chatrooms}
            },
            callback: () => {
                message.success('设置分组成功！')
                this.props.dispatch({
                    type: 'community_group_management/resetWorkGroupInfo',
                })
                this.refresh()
            }
        })
    }

    setWorkGroup = (setTrue) => {
        const { selectedRowKeys } = this.props.community_group_management
        if(!selectedRowKeys.length) {
            message.warning('请先选择设置工作群的群!')
        }else{
            let chatrooms = selectedRowKeys.map((item) => {
                let itemArr = item.split(',')
                return {
                    uin: itemArr[0],
                    chatroomname: itemArr[1],
                }
            })
            this.props.dispatch({
                type: 'community_group_management/checkWorkGroup',
                payload: {
                    body: {chatrooms}
                },
            })
            setTrue()
        }
    }

    confirmWorkGroupModalOk = () => {
        const { setWorkGroupLoading } = this.props
        const { workGroupInfo: { isSetWorkGroup } } = this.props.community_group_management

        Modal.confirm({
            title: '提示',
            content: (
                <div>
                    <p>即将执行批量设置工作群的操作，批量操作请谨慎审核所选数据</p>
                    <p>确认执行？</p>
                </div>
            ),
            okButtonProps: {
                icon: setWorkGroupLoading ? "loading" : null,
            },
            onOk: ()=> {
                return this.setWorkGroupModalOk(isSetWorkGroup)
            },
        })
    }

    setWorkGroupModalOk = (isSetWorkGroup) => {
        const { selectedRowKeys } = this.props.community_group_management
        let chatrooms = selectedRowKeys.map((item) => {
            let itemArr = item.split(',')
            return {
                uin: itemArr[0],
                chatroomname: itemArr[1],
            }
        })

        return new Promise((resolve, reject) => {
            this.props.dispatch({
                type: 'community_group_management/setWorkGroup',
                payload: {
                    body: {
                        chatrooms,
                        is_sync: isSetWorkGroup,
                    }
                },
                callback: (data) => {
                    resolve()
                    if(data?.meta?.code === 200) {
                        message.success('设置工作群成功！')
                        this.props.dispatch({
                            type: 'community_group_management/resetWorkGroupInfo',
                        })
                        Modal.info({
                            title: '提示',
                            content: (
                                <div>
                                    <p>设置批量处理中，服务器将陆续完成所有执行操作</p>
                                    <p>执行时间根据数据量大小会有一定延迟，请耐心等待一小段时间再刷新</p>
                                </div>
                            ),
                            onOk: ()=> {
                                this.refresh()
                            },
                        })
                    }
                }
            })
        })

    }

    setAutoReply = (setTrue) => {
        const { selectedRowKeys } = this.props.community_group_management
        if(!selectedRowKeys.length) {
            message.warning('请先选择设置自动回复的群!')
        }else{
            let chatrooms = selectedRowKeys.map((item) => {
                let itemArr = item.split(',')
                return {
                    uin: itemArr[0],
                    chatroomname: itemArr[1],
                }
            })
            /*this.props.dispatch({
                type: 'community_group_management/checkWorkGroup',
                payload: {
                    body: {chatrooms}
                },
            })*/
            setTrue()
        }
    }

    setAutoReplyModalOk = () => {
        console.log('setAutoReplyModalOk:')
    }

    allCheckChange = (e)=>{
        const checked = e.target.checked
        const { hadClickAll } = this.state

        if(!hadClickAll) {
            this.props.dispatch({
                type: 'community_group_management/getAllUsers',
                callback: () => {
                    this.handleAllCheck(checked)
                    this.setState({
                        hadClickAll: true
                    })
                }
            })
        }else{
            this.handleAllCheck(checked)
        }
    }

    handleAllCheck = (checked) => {
        if(checked){
            const {allUsers} = this.props.community_group_management
            this.props.dispatch({
                type: 'community_group_management/setProperty',
                payload: {
                    selectedRowKeys: allUsers.map((item) => {
                        return `${item.uin},${item.chatroomname}`
                    }),
                },
            })
            this.props.dispatch({
                type: 'community_group_management/setAllChecked',
            })
        }else{
            this.props.dispatch({
                type: 'community_group_management/setProperty',
                payload: {
                    selectedRowKeys: [],
                },
            })
            this.props.dispatch({
                type: 'community_group_management/setAllChecked',
            })
        }
    }

    onSelectChange = (selectedRowKeys)=>{ // selectedRowKeys为群的：'${record.from.uin},${record.target.username}' 组合
        this.props.dispatch({
            type: 'community_group_management/setProperty',
            payload: {
                selectedRowKeys,
            },
        })
        this.props.dispatch({
            type: 'community_group_management/setAllChecked',
        })
    }

    render() {
        const { exportLoading } = this.state
        const {
            params, list, total, current, count_open_sync,
            count_retreat_group, count_no_replier, count_replier_anomaly,
            selectedRowKeys, groupDivideOptions, groupDivideOptionsHasAll,
            indeterminate, checkAll, workGroupInfo: { checkWorkGroupInfo },
        } = this.props.community_group_management
        const { queryLoading, groupDetailLoading, updateLoading, taskIdLoading, setWorkGroupLoading, checkWorkGroupLoading, getAllUsersLoading=false } = this.props

        let sortedInfo = this.state.sortedInfo || {}
        const columns = [
            {
                title: '群名称',
                dataIndex: 'target.nickname',
                key: 'target.nickname',
                className: styles.nicknameColumn,
                render: (text, record) => {
                    return <div style={{width: '100px'}}><span>{text ? text : record.target.display_name}</span></div>
                },
            },
            {
                title: '群主',
                dataIndex: 'target.owner.nickname',
                key: 'target.owner.nickname',
                className: styles.groupOwner,
                render: (text, record) => {
                    return <div>
                        <div className={styles.name}>微信昵称：{text}</div>
                        <div className={styles.name}>微信号：{record?.target?.owner?.alias ? record?.target?.owner?.alias: record?.target?.owner?.username}</div>
                        {
                            record.target.owner?.is_staff ? <div className={styles.flagTag}>员工号</div> : null
                        }
                    </div>
                },
            },
            {
                title: '成员数',
                dataIndex: 'target.member_count',
                key: 'target.member_count',
                className: styles.countColumn,
                align: 'center',
                render: (text, record, index) => {
                    return (record.target.is_sync && record.target.status === 0) ?
                        <span className={styles.number} onClick={() => {this.goMembers(record)}}>{text}</span>
                        : <span>{text}</span>
                },
            },
            {
                title: () => {
                    return (
                        <span>
                            设为工作群
                            <Popover
                                placement="top"
                                content={
                                    <div style={{width: '270px'}}>工作群授权数决定可开启数量上限，开启后聊天记录同步并可进行群设置等配置，请保持手机激活和在线状态</div>
                                }
                                title={null}
                            >
                                <Icon className={styles.questionCircle} type="question-circle-o"/>
                            </Popover>
                        </span>
                    )
                },
                dataIndex: 'target.is_sync',
                key: 'target.is_sync',
                className: styles.syncColumn,
                render: (text, record) => {
                    return (
                        <Switch
                            checkedChildren="开启"
                            unCheckedChildren="关闭"
                            loading={updateLoading && _.get(this.state.record, 'target.username') === record.target.username && _.get(this.state.record, 'from.uin') === record.from.uin}
                            checked={record.target.is_sync && record.target.status === 0}
                            onChange={(e) => this.update(record, e)}
                        />
                    )
                },
            },
            {
                title: '状态',
                dataIndex: 'target.status',
                key: 'target.status',
                className: styles.statusColumn,
                render: (text, record) => {
                    return record.target.status === 0 ?
                        <span className={styles.statusItem}><Badge status="success"/>正常</span> :
                        <span className={styles.statusItem}><Badge status="error"/>退出</span>
                },
            },
            {
                title: '操作',
                dataIndex: 'option',
                key: 'option',
                className: styles.operation,
                render: (text, record, index) => {
                    return (
                        <div>
                            <div className={`${styles.record} ${(record.target.is_sync && record.target.status === 0) ? '' : styles.disabled}`}>
                                {
                                    (record.target.is_sync && record.target.status === 0) ?
                                        <GroupHistoryModal
                                            {...this.props}
                                            renderBtn={(setTrue) => {
                                                return (
                                                    <span onClick={() => {
                                                        setTrue()
                                                    }}>聊天记录</span>
                                                )
                                            }}
                                            record={record}
                                            fromUin={record?.from?.uin}
                                            toUsername={record?.target?.username}
                                        />
                                        : <span>聊天记录</span>
                                }
                            </div>
                            <div className={`${styles.record} ${(record.target.is_sync && record.target.status === 0) ? '' : styles.disabled}`}>
                                {
                                    (record.target.is_sync && record.target.status === 0) ?
                                        <GroupSetting
                                            renderBtn={(setTrue) => {
                                                return (
                                                    <span
                                                        onClick={() => {
                                                            setTrue()
                                                        }}
                                                    >
                                                        群设置
                                                    </span>
                                                )
                                            }}
                                            handleSwitchChange={(e) => {
                                                this.handleSwitchChange(e, record)
                                            }}
                                            fetchOption={{
                                                setting_level: 0,
                                                chatroom_id: record.target.username,
                                            }}
                                            newFriendsFetchOption={{
                                                setting_level: 0,
                                                chatroom_id: record.target.username,
                                            }}
                                            autoReplyFetchOption={{
                                                setting_level: 0,
                                                chatroom_id: record.target.username,
                                            }}
                                            actionManageFetchOption={{
                                                categoryType: 0, // 0：群管理，1：群活动（用于区别哪种活动）
                                                chatroom_id: record.target.username,
                                            }}
                                            refresh={() => this.recordRefresh(record, index)}
                                            record={record}
                                        />
                                        : <span>群设置</span>
                                }
                            </div>
                            <div className={`${styles.record} ${(record.target.is_sync && record.target.status === 0) ? '' : styles.disabled}`}>
                                {
                                    (record.target.is_sync && record.target.status === 0) ?
                                        <div className={styles.record} onClick={() => {this.goMembers(record)}}>成员管理</div>
                                        : <span>成员管理</span>

                                }
                            </div>

                        </div>
                    )
                },
            },
            {
                title: '所属部门',
                dataIndex: 'department',
                className: styles.deptColumn,
                render: (text, record, index) => {
                    if(record.from.user && record.from.user.departments) {
                        let departments = record.from.user.departments
                        let content = ''
                        if(departments && departments.length) {
                            content = departments.map((item) => {
                                return item.name
                            }).join('，')
                            return <Popover
                                placement="topLeft"
                                content={<p className={styles.wholeDept}>{content}</p>}
                                title={null}
                                trigger="hover"
                            >
                                <div className={styles.dept}>{content}</div>
                            </Popover>
                        }
                    }
                    return ''
                },
            },
            {
                title: '所属员工',
                dataIndex: 'user.nickname',
                className: styles.forWx,
                render: (text, record, index) => {
                    if(record.from.user) {
                        return record.from.user.nickname
                    }
                },
            },
            {
                title: '所属微信',
                dataIndex: 'from.nickname',
                className: styles.forWx,
                render: (text, record) => {
                    return(
                        <>
                            <div>{record.from.remark ? record.from.remark : text}</div>
                            {
                                record.target.owner?.username === record.from?.username ? <div className={styles.flagTag}>群主</div> : null
                            }
                        </>
                    )
                },
            },
            {
                title: '公告',
                dataIndex: 'target.notice.content',
                key: 'target.notice.content',
                className: styles.noticeColumn,
                render: (text, record, index) => {
                    if(text) {
                        return <Popover
                            placement="topLeft"
                            content={<p className={styles.wholeNotice}>{text}</p>}
                            title={null}
                            trigger="hover"
                        >
                            <div className={styles.notice}>{text}</div>
                        </Popover>
                    }
                },
            },
            {
                title: '群分组',
                dataIndex: 'target.grouping',
                key: 'target.grouping',
                className: styles.groupDivide,
                render: (text, record) => {
                    return <span>{ text?.title ? text?.title : '未分组'}</span>
                },
            },
            {
                title: '入群问候',
                dataIndex: 'auto_greet',
                className: styles.replierColumn,
                render: (text, record, index) => {
                    const status =  record?.auto_greet?.replier?.status
                    return record.target.is_sync ?
                        <div className={styles.replierColumnWrapper}>
                            <div>
                                <span>状态：</span>
                                <span>{this.getStatusTxt(status)}</span>
                            </div>

                            <div className={styles.replierWrapper}>
                                <AddReplyMember
                                    renderBtn={(setTrue) => {
                                        return (
                                            <div onClick={() => {
                                                setTrue()
                                            }}>
                                                <span>回复者: </span>
                                                {this.getReplierStatusCont(record?.auto_greet?.replier)}
                                            </div>
                                        )
                                    }}
                                    owner={record?.target?.owner}
                                    auto_greet={record?.auto_greet}
                                    auto_reply={record?.auto_reply}
                                    behavior_manage={record?.behavior_manage}
                                    type={0}
                                    uin={record?.from?.uin}
                                    username={record?.target?.username}
                                    fetchOption={{
                                        setting_level: 0,
                                        chatroom_id: record.target.username,
                                    }}
                                    refresh={() => this.recordRefresh(record, index)}
                                />
                            </div>
                            {this.getReplierStatusErrorCont(record?.auto_greet?.replier)}
                        </div>
                        : <div>设为工作群后启用</div>
                },
            },
            {
                title: '自动回复',
                dataIndex: 'auto_reply',
                className: styles.replierColumn,
                render: (text, record, index) => {
                    const status =  record?.auto_reply?.replier?.status
                    return record.target.is_sync ?
                        <div className={styles.replierColumnWrapper}>
                            <div>
                                <span>状态：</span>
                                <span>{this.getStatusTxt(status)}</span>
                            </div>
                            <div className={styles.replierWrapper}>
                                <AddReplyMember
                                    renderBtn={(setTrue) => {
                                        return (
                                            <div onClick={() => {
                                                setTrue()
                                            }}>
                                                <span>回复者: </span>
                                                {this.getReplierStatusCont(record?.auto_reply?.replier)}
                                            </div>
                                        )
                                    }}
                                    owner={record?.target?.owner}
                                    auto_greet={record?.auto_greet}
                                    auto_reply={record?.auto_reply}
                                    behavior_manage={record?.behavior_manage}
                                    type={1}
                                    uin={record?.from?.uin}
                                    username={record?.target?.username}
                                    fetchOption={{
                                        setting_level: 0,
                                        chatroom_id: record.target.username,
                                    }}
                                    refresh={() => this.recordRefresh(record, index)}
                                />
                            </div>
                            {this.getReplierStatusErrorCont(record?.auto_reply?.replier)}
                        </div>
                        : <div>设为工作群后启用</div>
                },
            },
            {
                title: '行为管理',
                dataIndex: 'behavior_manage',
                className: styles.replierColumn,
                render: (text, record, index) => {
                    const status =  record?.behavior_manage?.replier?.status
                    return record.target.is_sync ?
                        <div className={styles.replierColumnWrapper}>
                            <div>
                                <span>状态：</span>
                                <span>{this.getStatusTxt(status)}</span>
                            </div>
                            <div className={styles.replierWrapper}>
                                <AddReplyMember
                                    renderBtn={(setTrue) => {
                                        return (
                                            <div onClick={() => {
                                                setTrue()
                                            }}>
                                                <span>回复者: </span>
                                                {this.getReplierStatusCont(record?.behavior_manage?.replier)}
                                            </div>
                                        )
                                    }}
                                    owner={record?.target?.owner}
                                    auto_greet={record?.auto_greet}
                                    auto_reply={record?.auto_reply}
                                    behavior_manage={record?.behavior_manage}
                                    type={2}
                                    uin={record?.from?.uin}
                                    username={record?.target?.username}
                                    fetchOption={{
                                        setting_level: 0,
                                        chatroom_id: record.target.username,
                                    }}
                                    refresh={() => this.recordRefresh(record, index)}
                                />
                            </div>
                            {this.getReplierStatusErrorCont(record?.behavior_manage?.replier)}
                            {record?.behavior_manage?.replier?.exception_status !== -1 && !record?.behavior_manage?.replier?.replier_is_owner ?
                                <div className={styles.abnormal}>回复者非群主，警告后踢人不可用</div> : null}
                        </div>
                        : <div>设为工作群后启用</div>
                },
            },
            {
                title: '备注',
                dataIndex: 'target.remark',
                key: 'target.remark',
                className: styles.remarkColumn,
                render: (text, record, index) => {
                    return <div style={{cursor: 'pointer'}}>
                        <RemarkEdit
                            {...this.props}
                            record={record}
                            visible={this.state.showRemarkEdit && this.state.record.target.username === record.target.username && this.state.record.from.uin === record.from.uin
                            }
                            onCancel={this.handleCancelRemarkEdit}
                            onOk={() => this.handleOkRemarkEdit(record, index)}
                            onChangeVisible={this.onChangeRemarkEditVisible}
                        />
                        {text ?
                            <span
                                className={styles.remark}
                                onClick={() => {
                                    this.handleShowRemarkEdit(record)
                                }}
                            >
                                {text}
                            </span>
                            : <Icon
                                className={styles.edit}
                                type="edit"
                                onClick={() => {
                                    this.handleShowRemarkEdit(record)
                                }}
                            />
                        }
                    </div>
                },
            },
            {
                title: '创建时间',
                dataIndex: 'target.create_time',
                className: styles.createTime,
                sorter: true,
                sortOrder: sortedInfo.columnKey === 'target.create_time' && sortedInfo.order,
                render: (text, record, index) => {
                    return moment(text * 1000).format(DateTimeFormat)
                }
            },
        ]
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        }

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
        }
        const timeFormItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 18},
        }

        return (
            <div className={styles.container}>
                <Alert
                    className={styles.alert}
                    message="“设为工作群”开关设为启用状态后，将开启群设置和聊天记录查看，禁用状态下不可查看聊天记录和进行群配置，如群状态为退出，则工作群设为禁用状态"
                    type="info"
                    showIcon
                />
                <div className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={8}>
                            <FormItem
                                {...formItemLayout}
                                label="搜索："
                                colon={false}
                            >
                                <Input
                                    placeholder="输入群名称、备注"
                                    value={params.query}
                                    onChange={(e) => {
                                        this.handleChange('query', e)
                                    }}
                                    onPressEnter={this.handleSearch}/>
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="所属部门：" colon={false}>
                                <DepartmentSelect
                                    departmentId={params.department_id}
                                    onChange={(value) => {
                                        this.handleChange('department_id', value)
                                    }}
                                />
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="所属员工：" colon={false}>
                                <UserSelect
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    onChange={(value) => {
                                        this.handleChange('user_id', value)
                                    }}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="所属微信：" colon={false}>
                                <WeChatSelectSingle
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    uin={params.uin}
                                    onChange={(value) => {
                                        this.handleChange('uin', value)
                                    }}
                                />
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="群状态：" colon={false}>
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    style={{width: '100%'}}
                                    value={params.status}
                                    onChange={(e) => {
                                        this.handleChange('status', e)
                                    }}
                                    placeholder="全部状态"
                                >
                                    <Option value="">全部状态</Option>
                                    <Option value="0">正常</Option>
                                    <Option value="-1">退出</Option>
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="工作群状态：" colon={false}>
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    style={{width: '100%'}}
                                    value={params.is_sync}
                                    onChange={(e) => {
                                        this.handleChange('is_sync', e)
                                    }}
                                    placeholder="全部状态"
                                >
                                    <Option value="">全部状态</Option>
                                    <Option value="1">开启</Option>
                                    <Option value="0">未开启</Option>
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="回复者状态：" colon={false}>
                                <Select
                                    style={{width: '100%'}}
                                    value={params.replier_status}
                                    onChange={(e) => {
                                        this.handleChange('replier_status', e)
                                    }}
                                    placeholder="全部"
                                >
                                    <Option value={''}>全部</Option>
                                    <Option value={1}>未设置</Option>
                                    <Option value={2}>异常</Option>
                                    {/*<Option value={3}>全部异常</Option>*/}
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem className={styles.createTime} {...formItemLayout} label="创建时间：" colon={false}>
                                <DateRange
                                    ref={(node) => this.createTime = node}
                                    startPlaceholder="不限"
                                    endPlaceholder="不限"
                                    maxToday={true}
                                    startValue={params.create_time_start ? moment(params.create_time_start, DateFormat) : ''}
                                    endValue={params.create_time_end ? moment(params.create_time_end, DateFormat) : ''}
                                    onChange={this.handleChangeCreateDate}
                                />
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="群分组：" colon={false}>
                                <DivideSelect
                                    placeholder='全部分组'
                                    cls={styles.divideSelect}
                                    selectedId={params.grouping_id}
                                    data={groupDivideOptionsHasAll}
                                    onChange={(value) => {this.handleChange('grouping_id', value)}}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20} className={styles.operateBtn}>
                        <Col span={8}>
                            <Col offset={6}>
                                <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                <Button onClick={this.resetSearch}>重置</Button>
                            </Col>
                        </Col>
                        <Col span={8}>
                            <Col offset={6} style={{marginTop: 8, padding: 0}}>
                                <Checkbox
                                    checked={params.is_owner ? true : false}
                                    onChange={(e) => this.CheckboxChange('is_owner', e)}
                                >显示所属微信号是群主的群</Checkbox>
                            </Col>
                        </Col>
                    </Row>
                </div>
                <div className={styles.totalStatus}>
                    <div className={styles.leftBtns}>
                        <div className={styles.selectedCount}>满足条件共 {total || 0} 个</div>
                        <Spin spinning={getAllUsersLoading}>
                            <Checkbox
                                onChange={this.allCheckChange}
                                disabled={queryLoading}
                                indeterminate={indeterminate}
                                checked={checkAll}
                            >全选</Checkbox>
                        </Spin>
                        <WorkGroupModal
                            {...this.props}
                            renderBtn={(setTrue) => {
                                return (
                                    <Button onClick={() => {this.setWorkGroup(setTrue)}}>设置工作群</Button>
                                )
                            }}
                            onOk={this.confirmWorkGroupModalOk}
                            modalOption={{
                                confirmLoading: setWorkGroupLoading,
                            }}
                        />
                        <SetDivideModal
                            {...this.props}
                            renderBtn={(setTrue) => {
                                return (
                                    <Button onClick={() => {this.setDivide(setTrue)}}>设置分组</Button>
                                )
                            }}
                            type='group'
                            selectedRows={selectedRowKeys}
                            data={groupDivideOptions}
                            onOk={this.setDivideModalOk}
                            checkWorkGroupInfo={checkWorkGroupInfo}
                            checkWorkGroupLoading={checkWorkGroupLoading}
                        />
                        {/*<AutoReplyModal
                            {...this.props}
                            renderBtn={(setTrue) => {
                                return (
                                    <Button onClick={() => {this.setAutoReply(setTrue)}}>自动回复</Button>
                                )
                            }}
                            onOk={this.setAutoReplyModalOk}
                            // modalOption={{
                            //     confirmLoading: setWorkGroupLoading,
                            // }}
                        />*/}
                        <Button
                            icon={taskIdLoading || exportLoading ? "loading" : null}
                            onClick={this.handleExport}
                            disabled={taskIdLoading || exportLoading}
                            className={styles.export}
                        >导出数据</Button>
                    </div>
                    <div className={styles.rightStatus}>
                        <div className={styles.statusItem}>
                            <div className={styles.num}>{count_open_sync}</div>
                            <div className={styles.txt}>工作群</div>
                        </div>
                        <div className={styles.statusItem}>
                            <div className={`${styles.num} ${styles.red}`}>{count_retreat_group}</div>
                            <div className={styles.txt}>退出</div>
                        </div>
                        {/*<div className={styles.statusItem}>
                            <div className={`${styles.num} ${styles.red}`}>{count_no_replier}</div>
                            <div className={styles.txt}>回复者未设置</div>
                        </div>
                        <div className={styles.statusItem}>
                            <div className={`${styles.num} ${styles.red}`}>{count_replier_anomaly}</div>
                            <div className={styles.txt}>回复者异常</div>
                        </div>*/}
                    </div>
                </div>
                <div className={styles.tableWrap}>
                    <Table
                        columns={columns}
                        rowSelection={rowSelection}
                        dataSource={list}
                        size="middle"
                        loading={queryLoading || groupDetailLoading}
                        rowKey={record => `${record?.from?.uin},${record?.target?.username}`}
                        pagination={false}
                        scroll={{x: 1600}}
                        onChange={this.handleTableChange}
                    />
                    {list.length ?
                        <Pagination
                            className="ant-table-pagination"
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
                        : ''}
                </div>
            </div>
        )
    }
}
