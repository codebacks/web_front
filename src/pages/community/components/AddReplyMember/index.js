import React, {Component} from 'react'
import {Table, Icon, message} from 'antd'
import {connect} from 'dva'
import {hot} from "react-hot-loader"
import toggleModalWarp from 'hoc/toggleModalWarp'
import PropTypes from "prop-types"
import styles from "./index.less"
import config from "community/common/config"

const {pageSizeOptions} = config

@hot(module)
@toggleModalWarp({
    title: '选择员工微信号',
    width: 800,
    destroyOnClose: true,
    maskClosable: false,
    className: styles.addReplyModal,
})
@connect(({ community_groupManageAddReplyMember, loading }) => ({
    community_groupManageAddReplyMember,
    queryLoading: loading.effects['community_groupManageAddReplyMember/query'],
}))
export default class extends Component {

    static propTypes = {
        owner: PropTypes.object, // 群主
        auto_greet: PropTypes.object,
        auto_reply: PropTypes.object,
        behavior_manage: PropTypes.object,
        type: PropTypes.number,
        uin: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
        username: PropTypes.string,
    }

    static defaultProps = {
        owner: {},
        auto_greet: {},
        auto_reply: {},
        behavior_manage: {},
        type: 0,
        uin: '',
        username: '',
    }

    constructor(props) {
        super(props)
        props.setModalOkFn(this.handleOk)
        // props.setModalOnCancelFn(this.handleCancel)
    }

    componentDidMount() {
        const { type, uin, username } = this.props
        this.props.dispatch({
            type: 'community_groupManageAddReplyMember/query',
            payload: {
                uin: uin,
                username: username,
                type: type,
            },
        })
    }

    typeMapReplier = (type) => {
        const { auto_greet, auto_reply, behavior_manage } = this.props
        switch (type) {
            case 0:
                return auto_greet
            case 1:
                return auto_reply
            case 2:
                return behavior_manage
        }
    }

    handleOk = () => {
        // 判断activeRecord是否与props.record的哪个replier相等，根据type来区分哪种回复者
        const { activeRecord } = this.props.community_groupManageAddReplyMember
        const { type, username, owner, fetchOption } = this.props
        if(activeRecord.username === this.typeMapReplier(type)?.replier?.username) {
            this.props.onModalCancel()
        }else{
            this.props.dispatch({
                type: 'community_groupManageAddReplyMember/setAddReplyMember',
                payload: {
                    chatroom_id: username,
                    body: {
                        uin: activeRecord.uin,
                        type: type,
                        ...fetchOption
                    }
                },
                callback: () => {
                    if(activeRecord.username !== owner.username && type === 2) { // 行为管理非群主
                        message.warning('当前行为管理回复者已设为非群主号，“警告后踢人”设为不可配置', 1)
                    }else{
                        message.success('设置回复者成功', 1)
                    }
                    setTimeout(() => {
                        this.props.onModalCancel()
                        this.props.refresh()
                    }, 1000)
                }
            })
        }
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_groupManageAddReplyMember.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_groupManageAddReplyMember/setProperty',
            payload: {params: params},
        })
        this.goPage(1)
    }

    goPage = (page) => {
        const { record, type } = this.props
        this.props.dispatch({
            type: 'community_groupManageAddReplyMember/query',
            payload: {
                page: page,
                uin: record.from.uin,
                username: record.target.username,
                type: type,
            },
        })
    }

    setReplier = (record) => {
        this.props.dispatch({
            type: 'community_groupManageAddReplyMember/setProperty',
            payload: {activeRecord: record},
        })
    }

    render() {
        const { queryLoading, type } = this.props
        let {params, list, total, current} = this.props.community_groupManageAddReplyMember
        const columns = [
            {
                title: '微信昵称/群昵称/微信号',
                dataIndex: 'nickname',
                key: 'nickname',
                className: styles.nameColumn,
                render: (text, record) => {
                    return <div>
                        <div>{text}</div>
                        <div>{record.remark_name ? record.remark_name: '无'}</div>
                        <div>{record.alias ? record.alias: record.username}</div>
                    </div>
                },
            },
            {
                title: '在线状态',
                dataIndex: 'im_online_status',
                key: 'im_online_status',
                align: 'center',
                render: (text, record) => {
                    return  <span>{text ? '在线': '离线'}</span>
                },
            },
            {
                title: '操作',
                dataIndex: 'option',
                key: 'option',
                className: styles.operation,
                align: 'right',
                render: (text, record) => {
                    const { activeRecord } = this.props.community_groupManageAddReplyMember
                    return (
                        <div>
                            {
                                !!record.is_replier ? <span className={styles.activeTxt}>当前回复者</span>: null
                            }
                            {
                                (activeRecord && activeRecord.username === record.username) ? <Icon className={`${styles.icon} ${styles.active}`} type="check-circle" onClick={() => this.setReplier(record)} />
                                    : <Icon className={`${styles.icon}`} type="check-circle" onClick={() => this.setReplier(record)} />
                            }
                        </div>
                    )
                },
            },
        ]
        return (
            <div className={styles.addReplyMember}>
                <div className={styles.currentReplier}>
                    <span>当前回复者：</span>
                    <span>{this.typeMapReplier(type)?.replier?.nickname ? this.typeMapReplier(type)?.replier?.nickname : this.typeMapReplier(type)?.replier?.username}</span>
                </div>
                <div className={styles.tableWrap} style={{marginBottom: 0}}>
                    <Table
                        columns={columns}
                        dataSource={list}
                        size="middle"
                        loading={queryLoading}
                        rowKey={(record, index) => index}
                        pagination={{
                            total: total,
                            current: current,
                            showQuickJumper: true,
                            pageSizeOptions: pageSizeOptions,
                            showTotal: total => `共 ${total} 条`,
                            pageSize: params.limit,
                            showSizeChanger: true,
                            onShowSizeChange: this.handleChangeSize,
                            onChange: this.goPage,
                        }}
                    />
                </div>
            </div>
        )
    }
}
