/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/8
 */
import React from 'react'
import {
    Col,
    Row,
    Button,
    Table,
    Pagination,
    Icon,
    Popover,
    Form,
    Input,
    Select,
    notification,
    message,
    Modal,
    Badge,
    Menu,
    Dropdown,
    Switch,
    Checkbox
} from 'antd'
import {connect} from 'dva'
import {router} from 'umi'
import moment from 'moment'
import _ from 'lodash'
import qs from 'qs'
import documentTitleDecorator from "hoc/documentTitle"
import ContentHeader from 'business/ContentHeader'
import Helper from 'wx/utils/helper'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import config from 'wx/common/config'
import SwitchUser from './SwitchUser'
import Login from './Login'
import Edit from './Edit'
import RemarkEdit from './RemarkEdit'
import UploadQrcode from './components/UploadQrcode'
import AutoPass from './AutoPass'
import Toggle from 'components/Toggle'
import NewFriends from './NewFriends'
import BatchSwitchUser from './components/BatchSwitchUser'
import BatchSetReplyConfig from './components/BatchSetReplyConfig'
// import AutoReply from './AutoReply'
import AutoReplyModal from './components/AutoReplyModal'
import API from 'wx/common/api/wechats'
import DivideSelect from 'components/business/DivideSelect'
import SetDivideModal from 'components/business/SetDivideModal'
import RemoveWeChatModal from './components/RemoveWeChatModal'

import styles from './index.scss'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm
const {pageSizeOptions, DateTimeFormat, DefaultAvatar} = config
const timeOver = 300000 // 间隔5分钟
const uploadDBKey = 'uploadDBKey_'
const storage = window.localStorage

@documentTitleDecorator()
@connect(({base, wx_wechats, oem, loading}) => ({
    base,
    wx_wechats,
    oem,
    detailLoading: loading.effects['wx_weChatsAutoPass/detail'],
    wechatUpdateLoading: loading.effects['wx_weChatsAutoPass/wechatUpdate'],
    autoReplyOneUpdateLoading: loading.effects['wx_weChatsAutoReply/autoReplyOneUpdate'],
    queryLoading: loading.effects['wx_wechats/query'],
    allCheckChangeLoading: loading.effects['wx_wechats/allCheckChange'],
    queryStatLoading: loading.effects['wx_wechats/queryStat'],
}))
class Wechat extends React.Component {
    constructor(props) {
        super()
        this.state = {
            loginModalVisible: false,
            record: null,
            logoutLoading: [],
            showSwitchUser: false,
            remark: '',
            remarkEditLoading: false,
            uploadLoading: {},
            showUploadQrcode: false,
            autoPassModal: {
                visible: false,
            },
            removeWeChatModal: {
                visible: false,
            },
            params: {},
        }
        this.autoPassRef = React.createRef()
    }

    componentDidMount() {
        this.loadStat()
        this.loadData()
        this.props.dispatch({type: 'wx_wechats/getDivideOptions'})
    }

    componentWillUnmount() {
        this.resetParams()
        this.props.dispatch({
            type: 'wx_wechats/setProperty',
            payload: {selectedRowKeys: []},
        })
    }

    loadData = (params) => {
        params = params || {...this.props.wx_wechats.params}
        this.setState({
            params: params,
        })
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'wx_wechats/query',
            payload: {page: page},
        })
    }

    goAuthorization = () => {
        router.push('/wx/wechats/authorization')
    }

    loadStat = () => {
        this.props.dispatch({
            type: 'wx_wechats/queryStat',
            payload: {},
        })
    }

    handleSearch = () => {
        this.loadData()
    }

    reload = () => {
        this.props.dispatch({
            type: 'wx_wechats/query',
            payload: {},
        })
    }

    handleShowRemove = (record) => {
        confirm({
            title: '移除微信号',
            content: '移除微信号后，该微信号的数据将被永久删除，无法恢复，请谨慎选择',
            okButtonProps: {
                type: 'danger'
            },
            okText: '继续移除',
            onOk: () => {
                this.handleShowRemoveWeChatModal(record)
            },
            onCancel: () => {
            },
        })
    }

    handleRemove = (record) => {
        this.props.dispatch({
            type: 'wx_wechats/remove',
            payload: {uin: record.uin},
            callback: () => {
                this.goPage(this.props.wx_wechats.current)
            },
        })
    }

    handleShowRemoveWeChatModal = (record) => {
        this.setState({
            record: record,
            removeWeChatModal: {
                visible: true
            }
        })
    }

    handleCancelRemoveWeChatModal = () => {
        this.setState({
            removeWeChatModal: {
                visible: false
            }
        })
    }

    removeWeChatOk = () => {
        this.handleCancelRemoveWeChatModal()
        this.goPage(this.props.wx_wechats.current)
    }

    handleSwitch = (record) => {
        this.setState({showSwitchUser: true, record: record})
    }

    handleCancelSwitch = () => {
        this.setState({showSwitchUser: false, record: null})
        this.goPage(this.props.wx_wechats.current)
    }

    handleKeyWordChange(val) {
        let params = {...this.props.wx_wechats.params}
        params.query = val
        this.props.dispatch({
            type: 'wx_wechats/setProperty',
            payload: {params: params},
        })
    }

    handleBindTip = (record) => {
        this.setState({record: record})
        this.props.dispatch({
            type: 'wx_wechats/setProperty',
            payload: {loginModal: true},
        })
    }

    handleAddLogin = (record) => {
        this.props.dispatch({
            type: 'wx_wechats/queryStat',
            payload: {},
            callback: (data = {}) => {
                const valid_count = _.get(data, 'valid_count', 0)
                if (valid_count > 0) {
                    this.setState({record: record})
                    this.props.dispatch({
                        type: 'wx_wechats/setProperty',
                        payload: {loginModal: true},
                    })
                }else {
                    const oemConfig = _.get(this, 'props.oem.oemConfig')
                    if (oemConfig.id === 'siyuguanjia') {
                        Modal.confirm({
                            title: '新增微信号',
                            content: '暂无可用微信号授权数，请先购买',
                            okText: '去购买',
                            onOk() {
                                router.push('/setting/version_information/stewardversion?type=100')
                            },
                        })
                    }else if (oemConfig.id === 'huzan') {
                        Modal.confirm({
                            title: '新增微信号',
                            content: '暂无可用微信号授权数，请联系客服人员',
                        })
                    }
                }
            },
        })
    }

    handleCancelEdit = () => {
        this.setState({showEdit: false})
        const {current} = this.props.wx_wechats
        this.goPage(current || 1)
    }

    handleShowRemarkEdit = (record) => {
        this.setState({showRemarkEdit: true, record: record})
    }

    handleCancelRemarkEdit = () => {
        this.setState({showRemarkEdit: false})
        const {current} = this.props.wx_wechats
        this.goPage(current || 1)
    }

    onChangeRemarkEditVisible = (visible) => {
        this.setState({showRemarkEdit: visible,})
    }

    refresh = () => {
        const {current} = this.props.wx_wechats
        this.goPage(current || 1)
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.wx_wechats.params}
        params.limit = size
        this.props.dispatch({
            type: 'wx_wechats/setProperty',
            payload: {params: params},
        })
        this.goPage(1) //重置个数时回到首页
    }

    handleChange = (key, e) => {
        let val = ''
        if(e && e.target) {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.wx_wechats.params}
        params[key] = val
        if(key === 'department_id') {
            params['user_id'] = undefined
        }
        this.props.dispatch({
            type: 'wx_wechats/setProperty',
            payload: {params: params},
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'wx_wechats/resetParams',
        })
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.goPage(1)
        }, 0)
    }

    enabled = (key) => {
        // 间隔5分钟
        const time = storage.getItem(key)
        if ((Helper.getTimestamp() - +time) > timeOver) {
            return true
        }else {
            return Helper.getTimestamp() - +time
        }
    }
    // 发指侌
    handleSendSync = (wechat) => {
        const uin = wechat.uin
        const key = `${uploadDBKey}${uin}`
        const res = this.enabled(key)
        if (res === true) {
            storage.setItem(`${uploadDBKey}${uin}`, Helper.getTimestamp())
            this.props.dispatch({
                type: 'wx_wechats/notifications',
                payload: {
                    body: {
                        uin,
                        type: 'sync_db',
                    },
                },
                callback: () => {
                    message.success('同步指令已发送成功!')
                },
            })
        }else {
            let t = Math.ceil((timeOver - res) / 1000)
            notification.warning({
                message: '操作提示',
                description: `下次发送指令还需等待${t}秒`,
            })
            this.reload()

        }
    }

    handleUploadQrcode = (record) => {
        this.setState({showUploadQrcode: true, record})
    }

    handleCancelUploadQrcode = () => {
        this.setState({showUploadQrcode: false, record: {}})
    }

    autoPassModalCancel = () => {
        this.setState({
            autoPassModal: {
                visible: false,
            },
        })
    }

    autoPassModalOk = () => {
        if (this.autoPassRef) {
            this.autoPassRef.current.handleSubmit(() => {
                this.autoPassModalCancel()
                const {current} = this.props.wx_wechats
                this.goPage(current || 1)
            })
        }
    }

    autoPassModalOpen = (record) => {
        this.setState({
            autoPassModal: {
                visible: true,
            },
        })
        this.props.dispatch({
            type: 'wx_weChatsAutoPass/setDataForRecord',
            payload: record,
        })
    }

    getAutoRelyStatus = ({status = 0, wx_setting_type = 0} = {}) => {
        const statusMap = {
            '0': '关闭',
            '1': '开启',
        }
        const typeMap = {
            '0': '全局',
            '1': '自定义',
            '2': '模板',
        }
        return `${statusMap[status]}(${typeMap[wx_setting_type]})`
    }

    showSmartStatus = ({status = 0, wx_setting_type = 0} = {}) => {
        const statusMap = {
            '0': '关闭',
            '1': '开启',
        }
        const typeMap = {
            '0': '默认',
            '1': '自定义',
        }
        return `${statusMap[status]}(${typeMap[wx_setting_type]})`
    }

    getExportUrl = (params) => {
        const accessToken = this.props.base.accessToken
        let query = _.cloneDeep(params)
        delete query.limit
        delete query.offset
        return `${API.weChatExport.url}?${qs.stringify(query)}&access_token=${accessToken}&t=${new Date().getTime()}`
    }

    getUins = () => {
        const {selectedRowKeys, allUsers} = this.props.wx_wechats
        const uins = []
        selectedRowKeys.forEach((key) => {
            const item = allUsers.find(item => item.id === key)
            if (item) {
                uins.push(Number(item.uin))
            }
        })
        return uins
    }

    setDivideModalOk = (id, selectedRowKeys) => {
        let uins = this.getUins()
        this.props.dispatch({
            type: 'wx_wechats/setWechatDivide',
            payload: {
                id,
                body: {uins}
            },
            callback: () => {
                message.success('设置分组成功！')
                this.refresh()
            }
        })
    }

    setBatchOperate = (type, setTrue) => {
        const { selectedRowKeys } = this.props.wx_wechats
        let msg = ''
        switch(type) {
            case 'SetDivideModal':
                msg = '请先选择需要分组的微信号!'
                break
            case 'BatchSetReplyConfig':
                msg = '请先选择需要设置自动回复的微信号!'
                break
            case 'BatchSwitchUser':
                msg = '请先选择需要转给他人的微信号!'
                break
        }
        if(!selectedRowKeys.length) {
            message.warning(msg)
        }else{
            setTrue()
        }
    }

    handleAutoReplyModalOk = () => {
        this.goPage(this.props.wx_wechats.current || 1)
    }

    onSelectChange = (selectedRowKeys)=>{
        this.props.dispatch({
            type: 'wx_wechats/setProperty',
            payload: {
                selectedRowKeys,
            },
        })
        this.props.dispatch({
            type: 'wx_wechats/setAllChecked',
        })
    }

    allCheckChange = (e)=>{
        const checked = e.target.checked

        if(checked){
            const {allUsers} = this.props.wx_wechats
            this.props.dispatch({
                type: 'wx_wechats/setProperty',
                payload: {
                    selectedRowKeys: allUsers.map((item) => {
                        return item.id
                    }),
                },
            })
            this.props.dispatch({
                type: 'wx_wechats/setAllChecked',
            })
        }else{
            this.props.dispatch({
                type: 'wx_wechats/setProperty',
                payload: {
                    selectedRowKeys: [],
                },
            })
            this.props.dispatch({
                type: 'wx_wechats/setAllChecked',
            })
        }
    }

    render() {
        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }
        const {
            showUploadQrcode, autoPassModal, params: stateParams,
            record,
            removeWeChatModal,
        } = this.state
        const {
            detailLoading,
            queryLoading,
            wx_wechats,
            wechatUpdateLoading,
            queryStatLoading,
            autoReplyOneUpdateLoading,
            oem,
            allCheckChangeLoading,
            base,
        } = this.props
        const {
            params, list, total, current, loginModal, switchLoading,
            selectedRowKeys, wechatDivideOptions, wechatDivideOptionsHasAll,
            indeterminate, checkAll,
        } = wx_wechats
        const tableLoading = queryLoading
        const getBindBtn = (record) => {
            return <div>
                <span>已绑定</span>
                <div className={styles.bindTip}
                    onClick={() => {
                        this.handleBindTip(record)
                    }}>重新绑定
                </div>
            </div>
        }

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        }

        const isBasicVersion = _.get(base, 'initData.company.product_version.id') === 10
        // const isSiyuguanjia = _.get(oem, 'oemConfig.id') === 'siyuguanjia'

        const {initData} = this.props.base
        const isCreator = _.get(initData, 'user.is_creator') // 创建者标识

        const columns = [
            {
                title: '微信号信息',
                dataIndex: 'msg',
                width: 270,
                render: (text, record, index) => {
                    return (
                        <div className={styles.msg}>
                            <div className={styles.head}>
                                <img
                                    className={styles.head}
                                    src={Helper.getWxThumb(record.head_img_url).replace('http:', '')}
                                    onError={(e) => {
                                        e.target.src = DefaultAvatar
                                    }}
                                    rel="noreferrer"
                                    alt=""
                                />
                            </div>
                            <div>
                                <div>
                                    <span style={{whiteSpace: 'pre-wrap'}}>{record.nickname}</span>
                                </div>
                                <div>
                                    {record.mobile}
                                </div>
                                <div>
                                    {record.alias || record.username}
                                </div>
                            </div>
                        </div>
                    )
                },
            },
            {
                title: '分组',
                dataIndex: 'group',
                key: 'group',
                className: styles.divide,
                render: (text, record) => {
                    return <span>{ text ? text : '未分组'}</span>
                },
            },
            {

                title: () => {
                    return (
                        <span>
                            二维码名片
                            <Popover
                                placement="top"
                                content={
                                    <div style={{width: '270px'}}
                                    >
                                        为了您可参与新码营销活动、使用二维码水印，请尽快上传二维码名片
                                    </div>
                                }
                                title={null}
                            >
	                            <Icon className={styles.questionCircle} type="question-circle-o"/>
	                        </Popover>
                        </span>
                    )
                },
                dataIndex: 'qrcode_url',
                width: 105,
                render: (text, record, index) => {
                    return <div>
                        {text ?
                            <img className={styles.qrcode} src={text} onClick={() => this.handleUploadQrcode(record)}/>
                            : <span className={styles.switch} onClick={() => this.handleUploadQrcode(record)}>上传</span>
                        }
                    </div>

                },
            },
            {
                title: '绑定设备',
                dataIndex: 'is_app',
                width: 80,
                render: (text, record, index) => {
                    return getBindBtn(record)
                },
            },
            {
                title: '智能管理',
                dataIndex: 'management',
                width: 80,
                render: (text, record, index) => {
                    return (
                        <div className={styles.management}>
                            <div>
                                好友问候：
                                <Toggle>
                                    {(
                                        {
                                            setTrue,
                                            status,
                                            setFalse,
                                        },
                                    ) => (
                                        <>
                                            <span
                                                className={styles.bindTip}
                                                onClick={setTrue}
                                            >
                                                {this.showSmartStatus(record.auto_greet)}
                                            </span>
                                            <NewFriends
                                                record={record}
                                                refresh={this.refresh}
                                                modalOption={{
                                                    visible: status,
                                                    onCancel: () => {
                                                        this.refresh()
                                                        setFalse()
                                                    },
                                                    maskClosable: false,
                                                    width: '80%',
                                                    destroyOnClose: true,
                                                    title: '好友问候',
                                                }}
                                            />
                                        </>
                                    )}
                                </Toggle>
                            </div>
                            <div>
                                自动通过：
                                <span
                                    className={styles.bindTip}
                                    onClick={() => {
                                        this.autoPassModalOpen(record)
                                    }}
                                >
                                    {this.showSmartStatus(record.auto_confirm)}
                                </span>
                            </div>
                            {/*<div>
                                自动回复：
                                <Toggle>
                                    {(
                                        {
                                            setTrue,
                                            status,
                                            setFalse,
                                        },
                                    ) => (
                                        <>
                                            <span
                                                className={styles.bindTip}
                                                onClick={() => {
                                                    this.props.dispatch({
                                                        type: 'wx_weChatsAutoReply/setStateByPath',
                                                        payload: {
                                                            path: 'status',
                                                            value: Boolean(_.get(record, 'auto_reply.status', 0)),
                                                        },
                                                    })
                                                    setTrue()
                                                }}
                                            >
                                                {this.getAutoRelyStatus(record.auto_reply)}
                                            </span>
                                            <AutoReply
                                                record={record}
                                                refresh={this.refresh}
                                                modalOption={{
                                                    confirmLoading: autoReplyOneUpdateLoading,
                                                    visible: status,
                                                    onCancel: setFalse,
                                                    maskClosable: false,
                                                    width: '50%',
                                                    destroyOnClose: true,
                                                    title: '自动回复',
                                                }}
                                            />
                                        </>
                                    )}
                                </Toggle>
                            </div>*/}
                            <div>
                                自动回复：
                                <AutoReplyModal
                                    renderBtn={(setTrue) => <span
                                        className={styles.bindTip}
                                        onClick={() => {
                                            this.props.dispatch({
                                                type: 'wx_weChatsAutoReply/setStateByPath',
                                                payload: {
                                                    path: 'status',
                                                    value: Boolean(_.get(record, 'auto_reply.status', 0)),
                                                },
                                            })
                                            setTrue()
                                        }}
                                    >
                                        {this.getAutoRelyStatus(record.auto_reply)}
                                    </span>}
                                    uin={record.uin}
                                    onOk={this.handleAutoReplyModalOk}
                                    modalOption={{
                                        confirmLoading: autoReplyOneUpdateLoading,
                                    }}
                                />
                            </div>
                        </div>
                    )
                },
            },
            {
                title: '手机序列号',
                dataIndex: 'serialno',
                className: styles.minWidth,
                render: (text, record, index) => {
                    const end_time = _.get(record, 'auth.end_time')
                    const id = _.get(record, 'auth.id')
                    if (typeof end_time !== 'undefined' && (typeof id !== 'undefined')) {
                        const endTime = Math.floor((end_time * 1000 - new Date().getTime()) / (1000 * 60 * 60 * 24))
                        return (
                            <div className={styles.auth}>
                                <div>{text}</div>
                                <div>编号：{id}</div>
                                {(() => {
                                    if (endTime < 0) {
                                        return <div className={styles.endTime}>已到期</div>
                                    }else if (endTime <= 30) {
                                        return <div className={styles.endTime}>{endTime}天到期</div>
                                    }

                                    return null
                                })()}
                            </div>
                        )
                    }else {
                        return text
                    }
                },
            },
            {
                title: '版本号',
                dataIndex: 'version',
                className: styles.minWidth,
            },
            {
                title: '最后同步时间',
                dataIndex: 'last_sync_db_time',
                width: 120,
                render: (text, record, index) => {
                    if (text) {
                        return <div>{moment(text * 1000).format(DateTimeFormat)}</div>
                    }
                    return ''
                },
            },
            {
                title: '在线状态',
                dataIndex: 'im_online_status',
                className: styles.minWidth,
                render: (text, record, index) => {
                    if (text) {
                        return <Badge status="success" text="在线"/>
                    }
                    return <Badge status="default" text="离线"/>
                },
            },
            {
                title: '所属部门',
                dataIndex: 'user.departments',
                className: styles.deptColumn,
                render: (text, record, index) => {
                    let departments = text
                    let content = ''
                    if(departments && departments.length) {
                        content = departments.map((item) => {
                            return item.name
                        }).join('，')
                        return <Popover placement="topLeft" content={<p className={styles.wholeDept}>{content}</p>}
                            title={null}
                            trigger="hover">
                            <div className={styles.dept}>{content}</div>
                        </Popover>
                    }
                    return ''
                },
            },
            {
                title: '所属员工',
                dataIndex: 'user.nickname',
                className: styles.userColumn,
            },
            {
                title: ()=>{
                    return (
                        <span>
                            备注
                            <Popover
                                placement="top"
                                content={
                                    <div
                                        style={{width: '270px'}}
                                    >
                                        设置备注后，仅限系统内部使用，在所属微信处优先显示该备注
                                    </div>
                                }
                                title={null}
                            >
	                            <Icon className={styles.questionCircle} type="question-circle-o"/>
                            </Popover>
                        </span>
                    )
                },
                dataIndex: 'remark',
                className: styles.remarkColumn,
                render: (text, record, index) => {
                    return <div className={styles.remark}>
                        <RemarkEdit {...this.props}
                            record={record}
                            visible={this.state.showRemarkEdit && this.state.record.id === record.id}
                            onCancel={this.handleCancelRemarkEdit}
                            onChangeVisible={this.onChangeRemarkEditVisible}/>
                        {text ?
                            <Popover placement="topLeft" content={<div style={{maxWidth: '200px'}}>{text}</div>}><span
                                className={styles.edit}
                                onClick={() => {
                                    this.handleShowRemarkEdit(record)
                                }}>{text}</span></Popover>
                            : <Icon className={styles.edit}
                                type="edit"
                                onClick={() => {
                                    this.handleShowRemarkEdit(record)
                                }}/>
                        }
                    </div>

                },
            },
            {
                title: '操作',
                dataIndex: 'option',
                width: 100,
                render: (text, record, index) => {
                    const menu = <Menu>
                        <Menu.Item>
                            <span className={styles.switch} key="switch"
                                onClick={() => {
                                    this.handleSwitch(record)
                                }}
                            >
	                    {switchLoading ? <Icon type="loading"/> : '转给他人'}
	                </span>
                        </Menu.Item>
                        <Menu.Item>
                            <span className={styles.switch} key="sync"
                                onClick={() => {
                                    this.handleSendSync(record)
                                }}
                            >
	                    {switchLoading ? <Icon type="loading"/> : '同步数据'}
	                </span>
                        </Menu.Item>
                        {
                            isCreator ? <Menu.Item disabled={record.im_online_status}>
                                <span className={styles.switch}
                                    onClick={record.im_online_status ? ()=> {} : () => this.handleShowRemove(record)}
                                >移除微信号</span>
                            </Menu.Item> : null
                        }
                    </Menu>
                    return <Dropdown overlay={menu}>
                        <a className="ant-dropdown-link">更多 <Icon type="down"/></a>
                    </Dropdown>
                },
            },
        ]

        return (
            <div>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                        description: '统一管理员工绑定的个人微信号',
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E4%B8%AA%E4%BA%BA%E5%8F%B7/%E5%BE%AE%E4%BF%A1%E5%8F%B7%E7%AE%A1%E7%90%86.md',
                    }}
                />
                <div className={styles.wechat}>
                    <div className={styles.searchWrap}>
                        <Form className="ant-advanced-search-form">
                            <Row gutter={20}>
                                <Col span={7}>
                                    <FormItem {...formItemLayout} label="搜索：" colon={false}>
                                        <Input value={params.query}
                                            onChange={(e) => {
                                                this.handleChange('query', e)
                                            }}
                                            onPressEnter={this.handleSearch}
                                            placeholder="微信号/微信昵称/手机号"/>
                                    </FormItem>
                                </Col>
                                <Col span={7}>
                                    <FormItem {...formItemLayout} label="所属部门：" colon={false}>
                                        <DepartmentSelect
                                            departmentId={params.department_id}
                                            onChange={(value) => {
                                                this.handleChange('department_id', value)
                                            }}
                                        />
                                    </FormItem>
                                </Col>
                                <Col span={7}>
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
                                <Col span={7}>
                                    <FormItem {...formItemLayout}
                                        label="备注："
                                        colon={false}
                                    >
                                        <Input value={params.remark}
                                            onChange={(e) => {
                                                this.handleChange('remark', e)
                                            }}
                                            onPressEnter={this.handleSearch}
                                            placeholder="备注"/>
                                    </FormItem>
                                </Col>
                                <Col span={7}>
                                    <FormItem {...formItemLayout}
                                        label="在线状态："
                                        colon={false}
                                    >
                                        <Select value={params.online} onChange={(value) => {
                                            this.handleChange('online', value)
                                        }}>
                                            <Option value="">全部【状态】</Option>
                                            <Option value={1}>在线</Option>
                                            <Option value={0}>离线</Option>
                                        </Select>
                                    </FormItem>
                                </Col>
                                <Col span={7}>
                                    <FormItem {...formItemLayout} label="分组：" colon={false}>
                                        <DivideSelect
                                            placeholder='全部分组'
                                            cls={styles.divideSelect}
                                            selectedId={params.group_id}
                                            data={wechatDivideOptionsHasAll}
                                            onChange={(value) => {this.handleChange('group_id', value)}}
                                        />
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row className={styles.searchBtn} gutter={20}>
                                <Col span={7}>
                                    <Col offset={8}>
                                        <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                        <Button onClick={this.resetSearch}>重置</Button>
                                    </Col>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                    <div className={styles.addWrap}>
                        <div className={styles.leftWrap}>
                            <Button onClick={this.handleAddLogin}
                                type="primary"
                                icon="plus"
                            >新增微信号</Button>
                            <SetDivideModal
                                renderBtn={(setTrue) => {
                                    return (
                                        <Button onClick={ () => {this.setBatchOperate('SetDivideModal', setTrue)}}>设置分组</Button>
                                    )
                                }}
                                type='wechat'
                                selectedRows={selectedRowKeys}
                                data={wechatDivideOptions}
                                onOk={this.setDivideModalOk}
                            />
                            <BatchSetReplyConfig
                                refresh={this.refresh}
                                renderBtn={(setTrue) => {
                                    return (
                                        <Button
                                            className={styles.batchBtn}
                                            onClick={() => {this.setBatchOperate('BatchSetReplyConfig', setTrue)}}
                                        >
                                            自动回复
                                        </Button>
                                    )
                                }}
                            />
                            <BatchSwitchUser
                                refresh={this.refresh}
                                renderBtn={(setTrue) => {
                                    return (
                                        <Button
                                            className={styles.batchBtn}
                                            onClick={() => {this.setBatchOperate('BatchSwitchUser', setTrue)}}
                                        >
                                            转给他人
                                        </Button>
                                    )
                                }}
                            />
                        </div>
                        <div className={styles.rightWrap}>
                            <Checkbox
                                onChange={this.allCheckChange}
                                disabled={allCheckChangeLoading || queryLoading}
                                indeterminate={indeterminate}
                                checked={checkAll}
                            >
                                全选
                            </Checkbox>
                            <a target="_blank"
                                rel="noopener noreferrer"
                                href={this.getExportUrl(stateParams)}
                                className={styles.export}
                            >下载在线状态</a>
                            <div className={styles.status}>
                                {
                                    isBasicVersion
                                        ? (
                                            <div
                                                className={`${styles.item} ${styles.basicVersion}`}
                                                onClick={this.goAuthorization}>
                                                <h5>
                                                    {Helper.getIn(this.props.wx_wechats, 'stat.total_count')}
                                                </h5>
                                                <p>总授权数</p>
                                            </div>
                                        )
                                        :
                                        (
                                            <div className={`${styles.item}`}>
                                                <h5>
                                                    {Helper.getIn(this.props.wx_wechats, 'stat.total_count')}
                                                </h5>
                                                <p>总授权数</p>
                                            </div>
                                        )
                                }

                                <div className={styles.item}>
                                    <h5>{Helper.getIn(this.props.wx_wechats, 'stat.used_count')}</h5>
                                    <p>总使用</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.wechatWrap}>
                        <div>
                            <Table
                                columns={columns}
                                rowSelection={rowSelection}
                                dataSource={list}
                                size="middle"
                                loading={tableLoading}
                                rowKey={record => record.id}
                                pagination={false}
                            />
                            {list.length ? <Pagination
                                className="ant-table-pagination"
                                total={total}
                                current={current}
                                showQuickJumper={true}
                                pageSizeOptions={pageSizeOptions}
                                showTotal={total => `共${total}条`}
                                pageSize={params.limit}
                                showSizeChanger={true}
                                onShowSizeChange={this.handleChangeSize}
                                onChange={this.goPage}
                            />
                                : ''}
                        </div>
                    </div>

                    {this.state.showSwitchUser ? <SwitchUser {...this.props}
                        record={record}
                        visible={this.state.showSwitchUser}
                        onCancel={this.handleCancelSwitch}/>
                        : ''}
                    {loginModal ? <Login {...this.props} reload={this.handleSearch} record={record}/>
                        : ''}
                    {this.state.showEdit ? <Edit {...this.props}
                        record={record}
                        visible={this.state.showEdit}
                        onCancel={this.handleCancelEdit}/>
                        : ''}
                </div>
                {showUploadQrcode && <UploadQrcode {...this.props} visible={showUploadQrcode} record={record}
                    onCancel={this.handleCancelUploadQrcode} reload={() => {
                        this.goPage(current)
                    }}/>}
                <Modal
                    title="自动通过"
                    width={800}
                    destroyOnClose={true}
                    visible={autoPassModal.visible}
                    onOk={this.autoPassModalOk}
                    maskClosable={false}
                    onCancel={this.autoPassModalCancel}
                    okButtonProps={{loading: detailLoading || wechatUpdateLoading}}
                >
                    <AutoPass
                        getLeoRef={this.autoPassRef}
                    />
                </Modal>
                <RemoveWeChatModal
                    visible={removeWeChatModal.visible}
                    record={record}
                    onOk={this.removeWeChatOk}
                    onCancel={this.handleCancelRemoveWeChatModal}
                />
            </div>
        )
    }
}

Wechat.propTypes = {}

export default Wechat
// 请为当前微信设置微信号，短信加好友，<br/>需要将微信号在短信中发送给客户，设置完成后，<br/>在电脑重新登录此微信，并重启电脑客户端，<br/>在此看到微信号，此微信才可以做为短信加好友的被添加微信使用。
