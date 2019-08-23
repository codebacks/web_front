/** @description 重复好友
 * @author liyan
 * @date 2018/12/27
 */
import React, {Component} from 'react'
import {Popover, Modal, Table, Button, message, Alert, Divider} from 'antd'
import {connect} from 'dva'
import moment from 'moment'
import ContentHeader from 'components/business/ContentHeader'
import documentTitleDecorator from 'hoc/documentTitle'
import config from 'wx/common/config'
import Helper from 'wx/utils/helper'
import Profile from 'wx/components/Friends/Profile'
import HistoryModal from 'components/business/HistoryModal'
import styles from './index.scss'

const confirm = Modal.confirm

const {pageSizeOptions, DateTimeFormat, DefaultAvatar} = config

const reasonType = 2 // 僵尸好友
const deleteStatus = {
    normal: {
        status: 0,
        text: '正常'
    },
    fail: {
        status: 3,
        text: '删除失败'
    },
    processing: {
        status: 1,
        text: '删除中'
    }
}

@connect(({ base, wx_friends_zombie, wx_messages, messages, loading }) => ({
    base,
    wx_friends_zombie, wx_messages, messages,
    loadingFriends: loading.effects['wx_friends_zombie/list'],
    removeLoading: loading.effects['wx_friends_zombie/batchRemove']
}))
@documentTitleDecorator()
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedRowKeys: [],
            profileVisible: false,
            historyVisible: false,
        }
    }

    componentDidMount() {
        this.handleSearch()
    }

    onSelectChange = (selectedRowKeys) => {
        // console.log(selectedRowKeys)
        this.setState({ selectedRowKeys })
    }

    handleBatchRemove = () => {
        const {selectedRowKeys} = this.state
        if (!selectedRowKeys.length) {
            message.warning('请先选择需要删除的行')
            return
        }
        confirm({
            title: '确认删除？',
            content: `确定删除${selectedRowKeys.length}个好友？`,
            okText: '确定',
            okButtonProps: {
                icon: this.props.removeLoading ? "loading" : null,
            },
            okType: 'danger',
            cancelText: '取消',
            onOk: () => {
                const {list} = this.props.wx_friends_zombie
                const selectedData = list.filter((v)=>{
                    return selectedRowKeys.includes(v.target.id)
                })
                const deleteList = selectedData.map((v) => {
                    return {
                        [v.from.uin]: v.target.username
                    }
                })
                const payload = {
                    reason: reasonType,
                    body: {
                        delete_list: deleteList
                    }
                }
                // console.log('payload', payload)
                this.batchRemove(payload)
            },
            onCancel: () => {},
        })
    }

    batchRemove = (payload) => {
        this.props.dispatch({
            type: 'wx_friends_zombie/batchRemove',
            payload: payload,
            callback: (msg) => {
                this.onSuccess(msg)
            }
        })
    }

    onSuccess = (msg) => {
        if (msg) {
            this.info(msg)
        } else {
            this.reload()
        }
    }

    info = (text) => {
        Modal.info({
            title: '提示',
            content: (
                <div>{text}</div>
            ),
            onOk: () => {
                this.reload()
            },
        })
    }

    reload = () => {
        const {current} = this.props.wx_friends_zombie
        this.goPage(current)
        this.clearSelection()
    }

    clearSelection = () => {
        this.setState({
            selectedRowKeys: []
        })
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'wx_friends_zombie/list',
            payload: {page: page}
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.wx_friends_zombie.params}
        params.limit = size
        this.props.dispatch({
            type: 'wx_friends_zombie/setParams',
            payload: {params: params},
        })
        this.goPage(1)
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleShowProfile = (record) => {
        this.setState({
            profileVisible: true,
            record: record
        })
    }

    handleHideProfile = () => {
        this.setState({
            profileVisible: false,
            record: {}
        })
    }

    handleShowHistory = (record) => {
        this.setState({
            historyVisible: true,
            record: record
        })
    }

    handleHideHistory = () => {
        this.setState({
            historyVisible: false,
            record: {}
        })
    }

    getStatusText = (status) => {
        const keys = Object.keys(deleteStatus)
        const key = keys.find((k) => {
            return deleteStatus[k].status === status
        })
        if (key) {
            return deleteStatus[key].text
        }
        return ''
    }

    render() {
        const columns = [
            {
                title: '头像',
                dataIndex: 'target.head_img_url',
                render: (text, record) => {
                    return <img src={Helper.getWxThumb(text)} className={styles.avatar}
                        onError={(e) => {e.target.src = DefaultAvatar}}
                        rel="noreferrer"
                        alt=""
                    />
                }
            },
            {
                title: '微信备注',
                dataIndex: 'target.remark_name',
                className: styles.weChatColumn,
                render: (text, record, index) =>{
                    if(text){
                        return text
                    }else {
                        return record.target.nickname
                    }
                }
            },
            {
                title: '微信号',
                dataIndex: 'target.username',
                className: styles.weChatColumn,
                render: (text, record) => {
                    return record.target.alias || record.target.username
                }
            },
            {
                title: '微信昵称',
                dataIndex: 'target.nickname',
                className: styles.weChatColumn,
                render: (text) => {
                    return <span style={{whiteSpace: 'pre-wrap'}}>{text}</span>
                }
            },
            {
                title: '标签',
                dataIndex: 'target.contact_labels',
                className: styles.deptColumn,
                render: (text, record, index) => {
                    if(record.target.contact_labels.length){
                        const labels =  record.target.contact_labels.map((item)=>{
                            return item.name
                        }).join('、')
                        return <Popover placement="topLeft" content={<p className={styles.wholeDept}>{labels}</p>} title={null} trigger="hover">
                            <div className={styles.dept}>{labels}</div>
                        </Popover>
                    }
                }
            },
            {
                title: '所属部门',
                dataIndex: 'department',
                className: styles.deptColumn,
                render: (text, record, index) => {
                    if(record.from.user && record.from.user.departments){
                        let departments = record.from.user.departments
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
                dataIndex: 'user.nickname',
                className: styles.userColumn,
                render: (text, record, index) => {
                    if(record.from.user){
                        return record.from.user.nickname
                    }
                }
            },
            {
                title: '所属微信',
                dataIndex: 'from.nickname',
                className: styles.userColumn,
                render: (nickname, record) => {
                    const remark = record.from && record.from.remark
                    return remark || nickname
                }
            },
            {
                title: '来源',
                dataIndex: 'target.source',
                className: styles.sourceColumn,
                render: (text, record) => {
                    return Helper.getFriendSource(record.target.source)
                }
            },
            {
                title: '好友创建时间',
                dataIndex: 'target.add_time',
                className: styles.timeColumn,
                render: (text, record) => {
                    if (record.target.create_time) {
                        return moment(record.target.create_time * 1000).format(DateTimeFormat)
                    } else {
                        return '未知'
                    }
                }
            },
            {
                title: '状态',
                dataIndex: 'is_deleting',
                className: styles.column,
                render: (status) => {
                    return this.getStatusText(status)
                }
            },
            {
                title: '操作',
                dataIndex: 'operation',
                className: styles.column,
                render: (text, record) => {
                    return <div className={styles.operation}>
                        <span className={styles.stress} onClick={() => {
                            this.handleShowProfile(record)
                        }}>详情</span>
                        <Divider type="vertical" />
                        <span className={styles.stress} onClick={()=>{
                            this.handleShowHistory(record)
                        }}
                        >聊天记录</span>
                    </div>
                }
            }
        ]

        const {params, list, total, current} = this.props.wx_friends_zombie
        const {loadingFriends} = this.props
        const {selectedRowKeys, profileVisible, historyVisible, record} = this.state

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            getCheckboxProps: (record) => ({
                disabled: record.is_deleting === deleteStatus.processing.status,
            }),
        }

        return (
            <div>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E4%B8%AA%E4%BA%BA%E5%8F%B7/%E6%99%BA%E8%83%BD%E6%B8%85%E7%B2%89.md',
                    }}
                />
                <div className={styles.zombieWrapper}>
                    <Alert className={styles.alert} message='智能检测僵尸好友，可批量清粉。僵尸好友：被对方删除后，给对方发送消息，收到"好友开启了朋友验证..."的提示的好友' type="info" showIcon />
                    <div className={styles.btnWrap}>
                        <div className={styles.left}>
                            <Button type="primary"
                                disabled={!list.length}
                                onClick={this.handleBatchRemove}>批量删除</Button>
                            <span>删除好友有一定的延时，为保证数据准确，建议隔天再查看数据</span>
                        </div>
                        <div className={styles.right}>删除中的好友不可再次选择</div>
                    </div>

                    <div className={styles.tableWrap}>
                        <Table
                            rowSelection={rowSelection}
                            columns={columns}
                            dataSource={list}
                            size="middle"
                            loading={loadingFriends}
                            rowKey={record => record.target.id}
                            pagination={
                                list.length ? {
                                    size: 'middle',
                                    total: total,
                                    current: current,
                                    showQuickJumper: true,
                                    pageSizeOptions: pageSizeOptions,
                                    showTotal: total => `共${total}条`,
                                    pageSize: params.limit,
                                    showSizeChanger: true,
                                    onShowSizeChange: this.handleChangeSize,
                                    onChange: this.goPage,
                                } : false
                            }
                        />
                    </div>
                    {profileVisible ? <Profile {...this.props}
                        profileVisible={profileVisible}
                        record={record}
                        onCancel={this.handleHideProfile}
                    /> : null}
                    {historyVisible ? <HistoryModal {...this.props}
                        visible={historyVisible}
                        record={record}
                        fromUin={record.from.uin}
                        toUsername={record.target.username}
                        onCancel={this.handleHideHistory}
                    /> : null}
                </div>
            </div>
        )
    }
}
