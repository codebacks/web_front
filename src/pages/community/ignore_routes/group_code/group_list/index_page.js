/**
 * @Description
 * @author XuMengPeng
 * @date 2018/12/18
 */
import React, {PureComponent} from 'react'
import {Form, Input, Button, Row, Col, Table, Pagination, Modal, Switch, Select, Checkbox, Badge, message, Popover, Alert, Icon, Spin} from 'antd'
import {connect} from "dva/index"
import router from 'umi/router'
import moment from 'moment'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader'
import styles from './index.less'
import config from 'community/common/config'
import EllipsisPopover from 'components/EllipsisPopover'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import GroupSetting from 'community/components/GroupSetting'
import _ from 'lodash'
import {hot} from "react-hot-loader"

import AddGroup from './components/AddGroup'
import UploadQrcode from './components/UploadQrcode'
import AddReplyMember from 'community/components/AddReplyMember'

const FormItem = Form.Item
const Option = Select.Option
const {pageSizeOptions, DateTimeFormat, DateFormat} = config

@hot(module)
@connect(({base, community_groupCodeGroupList, loading}) => ({
    base,
    community_groupCodeGroupList,
    queryLoading: loading.effects['community_groupCodeGroupList/query'],
    statusLoading: loading.effects['community_groupCodeGroupList/setGroupStatus'],
    deleteLoading: loading.effects['community_groupCodeGroupList/deleteGroup'],
    addListLoading: loading.effects['community_groupCodeGroupList/addList'],
}))
@documentTitleDecorator()
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isShowModal: false,
            isShowDeleteModal: false, // 移出
            isShowOutInModal: false, // 移出转入
            inActivityArr: [], // 添加群二次确认弹窗：已加入其他活动的群
            record: null, // 操作的rocord
            group_activity_id: '',
            showUploadQrcode: false,
            sortedInfo: null,
            isShowAlert: false, // 是否显示Alert
        }
    }

    componentDidMount() {
        const { query } = this.props.location
        if(query.group_activity_id) {
            this.setState({
                group_activity_id: query.group_activity_id,
            }, () => {
                this.setShowAlert()
                this.props.dispatch({
                    type: 'community_groupCodeGroupList/queryActivityGroupTop',
                    payload: {
                        group_activity_id: this.state.group_activity_id
                    }
                })
                this.goPage(1)
            })
        }
    };

    componentWillUnmount() {
        this.resetParams()
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChange = (key, e) => {
        let val = ''
        if (key === 'key') {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.community_groupCodeGroupList.params}
        params[key] = val
        if(key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        }else if(key === 'user_id') {
            params['uin'] = undefined
        }
        this.props.dispatch({
            type: 'community_groupCodeGroupList/setParams',
            payload: {
                params: params,
            },
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_groupCodeGroupList.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_groupCodeGroupList/setProperty',
            payload: {params: params},
        })
        this.goPage(1) // 重置个数时回到首页
    }

    goPage = (page) => {
        if(typeof page === 'undefined') {
            page = this.props.community_groupCodeGroupList.current || 1
        }
        this.props.dispatch({
            type: 'community_groupCodeGroupList/query',
            payload: {
                page: page,
                group_activity_id: this.state.group_activity_id,
            },
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_groupCodeGroupList/resetParams',
        })
    }

    resetSortedInfo = () => {
        this.setState({
            sortedInfo: null
        })
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.goPage(1)
            this.resetSortedInfo()
        }, 0)
    }

    addGroup = () => {
        this.setState({
            isShowModal: true,
        }, () => {
            this.props.dispatch({
                type: 'community_groupCodeGroupList/queryModalList',
                payload: {},
            })
        })
    }

    // 群选择的弹窗：关闭重置
    afterCloseReset = () => {
        this.setState({inActivityArr: []})
        this.props.dispatch({
            type: 'community_groupCodeGroupList/resetAddModalParams'
        })
        this.props.dispatch({
            type: 'community_groupCodeGroupList/setProperty',
            payload: {
                selectedRowKeys: [],
                selectedRows: []
            }
        })
    }
    // 发送所选择的群的请求
    dispatchGroupSelected = (callback) => {
        const { selectedRows } = this.props.community_groupCodeGroupList
        if(!selectedRows.length) {
            this.handleCancelModal()
        }else{
            this.props.dispatch({
                type: 'community_groupCodeGroupList/addList',
                payload: {
                    group_activity_id: this.state.group_activity_id,
                },
                callback: () => {
                    callback && callback() // 关闭二次确认的弹窗
                    this.setState({
                        isShowModal: false,
                    }, () => {
                        message.success('添加成功！', 1)
                        this.afterCloseReset()
                        this.goPage(this.props.community_groupCodeGroupList.current || 1)
                    })
                }
            })
        }
    }
    // 群选择弹窗：确认，取消
    handleOkModal = () => {
        const { selectedRows } = this.props.community_groupCodeGroupList
        let inActivityArr = []
        inActivityArr = selectedRows.filter((item, index) => {
            if(item.group_activity_title) {
                return item
            }
        })
        this.setState({
            inActivityArr,
            isShowOutInModal: inActivityArr.length ? true: false
        })
        if(!inActivityArr.length) { // 选择添加的群未有在活动中的群，直接提交请求
            this.dispatchGroupSelected()
        }
    }
    handleCancelModal = () => {
        this.setState({
            isShowModal: false,
        }, () => {
            this.afterCloseReset()
        })
    }

    // 添加群二次确认弹窗：确认，取消
    handleOutInCancel = () => {
        this.setState({
            isShowOutInModal: false
        })
    }
    handleOutInOk = () => {
        this.dispatchGroupSelected(() => {this.handleOutInCancel()})
    }

    switchStatus = (record, e) => {
        this.props.dispatch({
            type: 'community_groupCodeGroupList/switchActivityGroupStatus',
            payload: {
                group_activity_id: this.state.group_activity_id,
                group_activity_chatroom_id: record.id,
                body: {
                    status: e ? 1: 0
                }
            },
            callback: () => {
                this.goPage(this.props.community_groupCodeGroupList.current || 1)
            }
        })
    }

    goToPage = (type, record=null) => {
        switch (type) {
            case 'manage':
                router.push({
                    pathname: `/community/group_code/group_members`,
                    query: {
                        group_activity_id: this.state.group_activity_id,
                        row_id: record.id,
                    }
                })
                break
            case 'chart':
                router.push({
                    pathname: `/community/group_code/activity_group_stat`,
                    query: {
                        group_activity_id: this.state.group_activity_id,
                        group_activity_chatroom_id: record.id,
                    }
                })
                break

        }
    }

    deleteGroup = (record) => {
        this.setState({
            record: record,
            isShowDeleteModal: true,
        })
    }

    handleUploadQrcode = (record) => {
        this.setState({showUploadQrcode: true, record})
    }

    handleCancelUploadQrcode = () => {
        this.setState({showUploadQrcode: false, record: null})
    }

    handleDeleteOk = () => {
        const { group_activity_id, record } = this.state
        this.props.dispatch({
            type: 'community_groupCodeGroupList/deleteGroup',
            payload: {
                group_activity_id: group_activity_id,
                row_id: record.id,
            },
            callback: () => {
                message.success('移出成功！', 1)
                setTimeout(() => {
                    this.handleDeleteCancel()
                    this.goPage(this.props.community_groupCodeGroupList.current || 1)
                }, 1000)
            }
        })
    }
    handleDeleteCancel = () => {
        this.setState({
            isShowDeleteModal: false,
            record: null,
        })
    }

    refresh = () => {
        const {current} = this.props.community_groupCodeGroupList
        this.goPage(current || 1)
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
        const { exception_status } = replier
        switch (exception_status){
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
        const { exception_status, nickname } = replier
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

    handleTableChange = (pagination, filters, sorter) => {
        console.log(pagination, filters, sorter)
        /*const field = sorter.field || ''
        const order = sorter.order || ''
        const sortedInfo = {
            order: sorter.order,
            columnKey: sorter.field,
        }
        let params = {...this.props.community_groupCode.params}
        if (order === 'descend') {
            params['order_by'] = `-${field}`
        } else {
            params['order_by'] = field
        }
        this.props.dispatch({
            type: 'community_groupCode/query',
            payload: {
                params: params,
            },
        })
        this.setState({
            sortedInfo: sortedInfo
        })*/
    }

    renderCodeStatus = (record) => {
        // qrcode_status  二维码状态  # 0:二维码不存在  1:二维码正常 2:二维码过期 3:二维码失效
        let qrcodeStatus = record?.qrcode_status, qrcodeUrl = record?.qrcode_url
        let timestamp = new Date().getTime()
        if(qrcodeUrl) {
            qrcodeUrl.includes('?') ? qrcodeUrl += `&timestamp=${timestamp}` : qrcodeUrl += `?timestamp=${timestamp}`
        }
        switch (qrcodeStatus){
            case 0:
                return <div>
                    <span style={{color: '#4391ff'}} onClick={() => this.handleUploadQrcode(record)}>上传</span>
                </div>
            case 1:
                return <div>
                    <img className={styles.qrcode} src={qrcodeUrl} onClick={() => this.handleUploadQrcode(record)}/>
                </div>
            case 2:
                return <div>
                    <img className={styles.qrcode} src={qrcodeUrl} onClick={() => this.handleUploadQrcode(record)}/>
                    <div style={{marginTop: 4, color: '#ffb507'}}>已过期</div>
                </div>
            case 3:
                return <div>
                    <div style={{color: '#f00'}}>已失效</div>
                </div>
            default:
                return ''
        }
    }

    // AlertStorage的相关设置
    getAlertStorage = () => {
        if(window.localStorage){
            let alertIsFirstStorage = window.localStorage.getItem('groupCode_groupList_alertIsFirst')
            if(alertIsFirstStorage){
                return alertIsFirstStorage
            }
        }else{
            return false
        }
    }
    setAlertStorage = () => {
        if(window.localStorage){
            window.localStorage.setItem('groupCode_groupList_alertIsFirst', true)
        }else{
            return false
        }
    }
    setShowAlert = () => {
        if(!this.getAlertStorage()){
            this.setState({
                isShowAlert: true
            }, () => {
                this.setAlertStorage()
                this.delayHideAlert()
            })
        }
    }
    delayHideAlert = () => {
        setTimeout(() => {
            this.setState({
                isShowAlert: false
            })
        }, 5000)
    }
    toggleAlert = () => {
        this.setState({
            isShowAlert: true
        }, () => {
            this.delayHideAlert()
        })
    }

    renderOutInModalCont = (groupActivityTitle) => {
        let txt = this.state.inActivityArr.map((item, index) => { return item.displayname }).join('，')
        return (
            <>
                <div>已选群中：{txt}</div>
                <div style={{margin: '10px 0',color: '#f00'}}>以上群在已有群活动中，添加到当前活动【{ groupActivityTitle }】中会将该群从原有活动中移出</div>
                <div>移出后当日的群活动数据将不计入统计，是否确认将以上群移出后转入？</div>
            </>
        )
    }

    checkboxChange = (e) => {
        const val = e.target.checked ? 1 : 0
        let content = val ? '当前群活动将启用扫码去重，每个微信号将只允许进群一次，不允许重复进群（即无论以任何方式重复加入群活动下的群，都将会被自动踢出）是否确认开启？'
            : '当前群活动将关闭扫码去重，将允许重复入群，是否确认关闭？'

        Modal.confirm({
            title: '扫码去重',
            content: content,
            onOk: () => {
                return new Promise((resolve) => {
                    this.props.dispatch({
                        type: 'community_groupCodeGroupList/setExcludeScanRepeat',
                        payload: {
                            group_activity_id: this.state.group_activity_id,
                            body: {
                                is_forbidden_repeat_in_group: val,
                            }
                        },
                        callback: (data) => {
                            resolve()
                            message.success(`扫码去重${val ? '已启用': '已关闭'}`)
                            this.props.dispatch({
                                type: 'community_groupCodeGroupList/setStateByPath',
                                payload: {
                                    path: 'top.group_activity.is_forbidden_repeat_in_group',
                                    value: val,
                                },
                            })
                        }
                    })
                })
            },
        })
    }

    render() {
        const { params, total, current, list, top } = this.props.community_groupCodeGroupList
        const { isShowModal, showUploadQrcode, isShowDeleteModal, isShowOutInModal, record, isShowAlert } = this.state
        const { deleteLoading, addListLoading } = this.props

        let sortedInfo = this.state.sortedInfo || {}
        const formItemLayout = { labelCol: {span: 6}, wrapperCol: {span: 16}, }
        const columns = [
            {
                title: '群聊名称',
                dataIndex: 'nickname',
                className: styles.nickname,
                render: (text, record) => {
                    return <EllipsisPopover lines={3} content={text}/>
                },
            },
            {
                title: '群二维码',
                dataIndex: 'qrcode_url',
                className: styles.code,
                align: 'center',
                render: (text, record) => {
                    return this.renderCodeStatus(record)
                },
            },
            {
                title: '群状态',
                dataIndex: 'is_delete',
                className: styles.groupStatus,
                align: 'center',
                render: (text, record) => {
                    return <span>{text === 1? <Badge status="error" text='退出' />
                        : <Badge status="success" text='正常' />}</span>
                },
            },
            {
                title: '邀请确认',
                dataIndex: 'invite_confirm_status',
                className: styles.inviteConfirmStatus,
                align: 'center',
                render: (text, record) => {
                    return text === 1? '开启': '关闭'
                },
            },
            {
                title: '使用状态',
                dataIndex: 'activity_chatroom_status',
                className: styles.activityChatroomStatus,
                render: (text, record) => {
                    return <div>
                        <div>{text === 1 ? '可用': text === 0 ? '不可用': '异常'}</div>
                        {
                            text !== 1 && <div style={{color: '#F00', marginTop: 6}}>{record.activity_chatroom_status_info}</div>
                        }
                    </div>
                },
            },
            {
                title: '操作',
                dataIndex: '',
                className: styles.edit,
                align: 'center',
                render: (text, record) => {
                    return (
                        <div>
                            <div className={styles.canEdit} onClick={() => this.goToPage('manage', record)}>群成员管理</div>
                            <div className={styles.canEdit} onClick={() => this.goToPage('chart', record)}>统计明细</div>
                            <div className={styles.canEdit} onClick={() => this.deleteGroup(record)}>移出</div>
                        </div>
                    )
                },
            },
            {
                title: '群成员数',
                dataIndex: 'member_count',
                className: styles.memberNum,
                align: 'center',
                /*sorter: true,
                sortOrder: sortedInfo.columnKey === 'member_count' && sortedInfo.order,*/
                render: (text, record) => {
                    return <span>{text}</span>
                },
            },
            {
                title: '总进群人数',
                dataIndex: 'in_cnt',
                className: styles.comeInMembers,
                align: 'center',
                render: (text, record) => {
                    return <span>{text}</span>
                },
            },
            {
                title: '群码展示次数',
                dataIndex: 'qr_code_show_count',
                className: styles.codeShowTimes,
                align: 'center',
                render: (text, record) => {
                    return <span className={styles.num} onClick={() => this.goToPage('chart', record)}>{text}</span>
                },
            },
            {
                title: '群主',
                dataIndex: 'owner_nickname',
                className: styles.owner,
                render: (text, record) => {
                    return text
                },
            },
            {
                title: '所属部门',
                dataIndex: 'belong.departments',
                className: styles.deptColumn,
                render: (text, record) => {
                    if(record?.belong?.departments){
                        let departments = record?.belong?.departments
                        let content = ''
                        if(departments && departments.length){
                            content = departments.map((item)=>{
                                return item.name
                            }).join('，')
                            return <Popover placement="topLeft" content={<p className={styles.wholeDept}>{content}</p>} title={null} trigger="hover">
                                <div className={styles.dept}>{content}</div>
                            </Popover>
                        }
                    }
                    return ''
                }
            },
            {
                title: '所属员工',
                dataIndex: 'belong.nickname',
                className: styles.userColumn,
                render: (text, record) => {
                    return record?.belong?.nickname
                }
            },
            {
                title: '所属微信',
                dataIndex: 'belong_wx_nickname',
                className: styles.userColumn,
                render: (text, record) => {
                    return text ? text : record?.belong_wx_id
                }
            },
            {
                title: '在线状态',
                dataIndex: 'im_online_status',
                className: styles.imOnlineStatus,
                align: 'center',
                render: (text, record) => {
                    return <span>{text ? <Badge status="success" text='在线' />
                        :<Badge status="error" text='离线' /> }</span>
                },
            },
            {
                title: '入群问候',
                dataIndex: 'auto_greet',
                className: styles.replierColumn,
                render: (text, record, index) => {
                    const status =  record?.auto_greet?.replier?.status
                    return record?.is_sync ?
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
                                    owner={{username: record?.owner_username}}
                                    auto_greet={record?.auto_greet}
                                    auto_reply={record?.auto_reply}
                                    behavior_manage={record?.behavior_manage}
                                    type={0}
                                    uin={record?.uin}
                                    username={record?.chatroom_id}
                                    fetchOption={{
                                        setting_level: 500,
                                        target_id: top?.group_activity?.id,
                                    }}
                                    refresh={this.refresh}
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
                    return record?.is_sync ?
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
                                    owner={{username: record?.owner_username}}
                                    auto_greet={record?.auto_greet}
                                    auto_reply={record?.auto_reply}
                                    behavior_manage={record?.behavior_manage}
                                    type={1}
                                    uin={record?.uin}
                                    username={record?.chatroom_id}
                                    fetchOption={{
                                        setting_level: 500,
                                        target_id: top?.group_activity?.id,
                                    }}
                                    refresh={this.refresh}
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
                    return record?.is_sync ?
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
                                    owner={{username: record?.owner_username}}
                                    auto_greet={record?.auto_greet}
                                    auto_reply={record?.auto_reply}
                                    behavior_manage={record?.behavior_manage}
                                    type={2}
                                    uin={record?.uin}
                                    username={record?.chatroom_id}
                                    fetchOption={{
                                        setting_level: 500,
                                        target_id: top?.group_activity?.id,
                                    }}
                                    refresh={this.refresh}
                                />
                            </div>
                            {this.getReplierStatusErrorCont(record?.behavior_manage?.replier)}
                            {
                                (record?.behavior_manage?.replier?.exception_status !== -1 && !record?.behavior_manage?.replier?.replier_is_owner) ? (
                                    <div className={styles.abnormal}>回复者非群主，警告后踢人不可用</div>
                                ) : null
                            }
                        </div>
                        : <div>设为工作群后启用</div>
                },
            },
        ]

        return (
            <div>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '群活动',
                                path: '/community/group_code'
                            },
                            {
                                name: '群列表',
                            },
                        ]
                    }
                />
                <div className={styles.groupList}>
                    <div className={styles.activityName}>
                        <span>群活动名称：</span>
                        <EllipsisPopover lines={1} content={top?.group_activity?.title} popoverContentClassName={styles.ellipsis}/>
                        <span onClick={this.toggleAlert}><Icon type='info-circle' className={styles.infoCircle}></Icon></span>
                    </div>
                    <div className={styles.alertWrap} style={{height: isShowAlert ? '78.4px': '0'}}>
                        <Alert message='每个群只能加入一个群活动，将已有群活动的群添加入新活动之后该群会从已有活动中踢出，此时群列表被踢出的群会依然展示在列表中，状态为不可用，请注意提示并手动移出或重新添加' type="info" showIcon />
                        <Alert message='群二维码在群活动启用后会每隔一段时间自动上传，如出现未上传二维码的群，可等待一段时间自动更新，或点击上传发送指令更新或手动上传' type="info" showIcon />
                    </div>
                    <div className={styles.header}>
                        <div className={styles.headerItem}>
                            <div className={styles.num}>{top?.total_chatroom_count}</div>
                            <div>总群数</div>
                        </div>
                        <div className={styles.headerItem}>
                            <div className={styles.num}>{top?.total_group_member_count}</div>
                            <div>群成员数</div>
                        </div>
                        <div className={styles.headerItem}>
                            <div className={styles.num}>{top?.total_in_cnt}</div>
                            <div>总进群人数</div>
                        </div>
                        <div className={styles.headerItem}>
                            <div className={styles.num}>{top?.total_group_code_show_count}</div>
                            <div>群码展示次数</div>
                        </div>
                    </div>
                    <div className={styles.searchWrap}>
                        <Form onSubmit={this.handleSubmit} className="ant-advanced-search-form">
                            <Row gutter={20}>
                                <Col span={8}>
                                    <FormItem {...formItemLayout} label="搜索：" colon={false} >
                                        <Input placeholder="输入群名称" value={params.key} onChange={(e) => this.handleChange('key', e)} />
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem {...formItemLayout} label="群状态：" colon={false}>
                                        <Select placeholder='全部' value={params.chatroom_status} onChange={(e)=>{this.handleChange('chatroom_status', e)}}>
                                            <Option value={undefined}>全部</Option>
                                            <Option value={0}>退出</Option>
                                            <Option value={1}>正常</Option>
                                        </Select>
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem {...formItemLayout} label="邀请确认：" colon={false}>
                                        <Select placeholder='全部' value={params.invite_confirm_status} onChange={(e)=>{this.handleChange('invite_confirm_status', e)}}>
                                            <Option value={undefined}>全部</Option>
                                            <Option value={0}>关闭</Option>
                                            <Option value={1}>开启</Option>
                                        </Select>
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={20}>
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
                            </Row>
                            <Row gutter={20}>
                                <Col span={8}>
                                    <FormItem {...formItemLayout} label="使用状态：" colon={false}>
                                        <Select placeholder='全部' value={params.activity_chatroom_status} onChange={(e)=>{this.handleChange('activity_chatroom_status', e)}}>
                                            <Option value={undefined}>全部</Option>
                                            <Option value={1}>可用</Option>
                                            <Option value={-1}>异常</Option>
                                            <Option value={0}>不可用</Option>
                                        </Select>
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem {...formItemLayout} label="回复者状态：" colon={false}>
                                        <Select placeholder='全部' value={params.replier_status} onChange={(e)=>{this.handleChange('replier_status', e)}}>
                                            <Option value={undefined}>全部</Option>
                                            <Option value={1}>未设置</Option>
                                            <Option value={2}>异常</Option>
                                        </Select>
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={20} className={styles.operateBtn}>
                                <Col span={12}>
                                    <Col offset={4}>
                                        <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                        <Button onClick={this.resetSearch}>重置</Button>
                                    </Col>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                    <div className={styles.addGroup}>
                        <div className={styles.left}>
                            <Button type="primary" onClick={this.addGroup}>添加群</Button>
                            <GroupSetting
                                renderBtn={(setTrue) => {
                                    return (
                                        <Button
                                            onClick={() => {setTrue()}}
                                            className={styles.canEdit}
                                        >群设置</Button>
                                    )
                                }}
                                fetchOption={{
                                    setting_level: 500,
                                    target_id: this.state.group_activity_id,
                                }}
                                newFriendsFetchOption={{
                                    setting_level: 500,
                                    target_id: this.state.group_activity_id,
                                }}
                                autoReplyFetchOption={{
                                    setting_level: 500,
                                    target_id: this.state.group_activity_id,
                                }}
                                actionManageFetchOption={{
                                    categoryType: 1, // 0：群管理，1：群活动（用于区别哪种活动）
                                    target_id: this.state.group_activity_id,
                                }}
                                refresh={this.refresh}
                                record={this.props.location.state?.record}
                            />
                            <Checkbox
                                checked={top?.group_activity?.is_forbidden_repeat_in_group ? true : false}
                                onChange={this.checkboxChange}
                            >扫码去重</Checkbox>
                        </div>
                        <div className={styles.totalStatus}>
                            <div className={styles.statusItem}>
                                <div className={styles.num}>{top?.status_available}</div>
                                <div>可用</div>
                            </div>
                            <div className={styles.statusItem}>
                                <div className={`${styles.num} ${top?.status_unavailable > 0 ? styles.red : ''}`}>{top?.status_unavailable}</div>
                                <div>不可用</div>
                            </div>
                            <div className={styles.statusItem}>
                                <div className={`${styles.num} ${top?.status_unusual > 0 ? styles.red : ''}`}>{top?.status_unusual}</div>
                                <div>异常</div>
                            </div>
                            <div className={styles.statusItem}>
                                <div className={`${styles.num} ${top?.count_no_replier > 0 ? styles.red: ''}`}>{top?.count_no_replier}</div>
                                <div>回复者未设置</div>
                            </div>
                            <div className={styles.statusItem}>
                                <div className={`${styles.num} ${top?.count_replier_anomaly > 0 ? styles.red: ''}`}>{top?.count_replier_anomaly}</div>
                                <div>回复者异常</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.tableWrap}>
                        <Table
                            columns={columns}
                            dataSource={list}
                            size="middle"
                            rowKey={(record, index) => index}
                            pagination={false}
                            loading={this.props.queryLoading}
                            scroll={{x: 1800}}
                            onChange={this.handleTableChange}
                        />
                    </div>
                    {list.length ? (
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
                    ) : (
                        ''
                    )}
                </div>
                <AddGroup
                    visible={isShowModal}
                    onOk={this.handleOkModal}
                    onCancel={this.handleCancelModal}
                />
                {
                    showUploadQrcode && <UploadQrcode
                        {...this.props}
                        visible={showUploadQrcode}
                        record={this.state.record}
                        group_activity_id={this.state.group_activity_id}
                        onCancel={this.handleCancelUploadQrcode}
                        reload={() => {
                            this.goPage(current)
                        }}
                    />
                }
                <Modal
                    title="移出确认"
                    visible={isShowDeleteModal}
                    width={720}
                    onCancel={this.handleDeleteCancel}
                    onOk={this.handleDeleteOk}
                    okButtonProps={{loading: deleteLoading}}
                >
                    <div>当前群：名称{record?.nickname}，该群即将从群活动中移出，移出后当日的群活动数据将不计入统计，是否确认？</div>
                </Modal>
                <Modal
                    title="移出转入确认"
                    visible={isShowOutInModal}
                    width={500}
                    onCancel={this.handleOutInCancel}
                    onOk={this.handleOutInOk}
                    okButtonProps={{loading: addListLoading}}
                >
                    { this.renderOutInModalCont(top?.group_activity?.title) }
                </Modal>
            </div>
        )
    }
}
