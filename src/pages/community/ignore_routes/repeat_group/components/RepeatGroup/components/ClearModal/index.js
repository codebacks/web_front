import React, {Fragment} from 'react'
import { Modal, message, Checkbox, Table, Pagination, Badge, Popover, Button } from 'antd'
import {connect} from 'dva'
import styles from './index.less'
import _ from "lodash"
import moment from "moment/moment"
import config from "community/common/config"
import EllipsisPopover from "components/EllipsisPopover"

const {pageSizeOptions, DateTimeFormat} = config
const CheckboxGroup = Checkbox.Group

@connect(({base, community_repeatGroup, loading}) => ({
    base, community_repeatGroup,
    queryLoading: loading.effects['community_repeatGroup/queryRepeatGroup'],
}))
export default class extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            selectedRows: [], // 选择操作的行
            selectedRowKeys: [],
        }
    }

    componentDidMount() {};

    componentWillUnmount() {
        this.reset()
    }

    reset = () => {
        this.props.dispatch({
            type: 'community_repeatGroup/resetParams',
        })
    }

    goPage = () => {
        const { record } = this.props
        this.props.dispatch({
            type: 'community_repeatGroup/queryRepeatGroup',
            payload: {wx_id: record.wechat_id},
        })
    }

    onCancel = () => {
        this.setState({
            selectedRows: [],
            selectedRowKeys: [],
        })
        this.props.onCancel()
    }

    onOk = () => {
        this.setState({
            selectedRows: [],
            selectedRowKeys: [],
        })
        this.props.onOk()
    }

    btnClear = () => {
        const { selectedRows } = this.state
        const { record } = this.props
        if(!selectedRows.length){
            message.warn('请先选择要清理的群！')
            return false
        }
        let chatroom_names = ''
        selectedRows.forEach((item, index) => {
            if(index === 0){
                chatroom_names += item.chatroom_name
            }else{
                chatroom_names += `,${item.chatroom_name}`
            }
        })
        this.props.dispatch({
            type: 'community_repeatGroup/clearRepeatGroup',
            payload: {
                wx_id: record.wechat_id,
                body: {
                    chatroom_names: chatroom_names
                }
            },
            callback: () => {
                message.success('执行清理指令已发送，数据更新请等待一小段时间')
                setTimeout(() => {
                    this.onOk()
                }, 1000)
            }
        })
    }


    render() {
        const { clearModalList } = this.props.community_repeatGroup
        const { queryLoading, visible } = this.props

        const columns = [
            {
                title: '群名称',
                dataIndex: 'target.nickname',
                key: 'target.nickname',
                className: styles.groupName,
                render: (text, record) => {
                    return <EllipsisPopover lines={3} content={text ? text : record.target.display_name} />
                },
            },
            {
                title: '所属部门',
                dataIndex: 'from.user.departments.name',
                key: 'from.user.departments.name',
                className: styles.department,
                render: (text, record) => {
                    if(record.from.user && record.from.user.departments) {
                        let departments = record.from.user.departments
                        let content = ''
                        if(departments && departments.length) {
                            content = departments.map((item) => {
                                return item.name
                            }).join('，')
                            return <Popover placement="topLeft" content={<p className={styles.wholeDept}>{content}</p>} title={null} trigger="hover">
                                <div className={styles.dept}>{content}</div>
                            </Popover>
                        }
                    }
                    return ''
                },
            },
            {
                title: '所属员工',
                dataIndex: 'from.user.nickname',
                key: 'from.user.nickname',
                className: styles.user,
                render: (text, record) => {
                    return <span>{text ? text: '无'}</span>
                },
            },
            {
                title: '所属微信',
                dataIndex: 'from.nickname',
                key: 'from.nickname',
                className: styles.uin,
                render: (text, record) => {
                    return <div>{text ? (
                        <>
                            <span>{text}</span>
                            {
                                record.from?.username === record.target?.owner?.username ? <span className={styles.borderFlag}>群主</span> : null
                            }
                        </>
                    ): '无'}</div>
                },
            },
            {
                title: '在线状态',
                dataIndex: 'from.im_online_status',
                key: 'from.im_online_status',
                className: styles.online,
                render: (text, record) => {
                    return text ? <span><Badge status="processing" text='在线' /></span>: <span><Badge status="error" text='离线'/></span>
                },
            },
            {
                title: '状态',
                dataIndex: 'is_quit',
                key: 'is_quit',
                className: styles.isQuit,
                render: (text, record) => {
                    let badge = ''
                    if(text) {
                        badge = <Badge status="success" text='已踢群' />
                    } else if(!record.from.im_online_status || (record.from?.username !== record.target?.owner?.username)) {
                        badge = <Badge status="error" text='不可操作' />
                    } else if(!text){
                        badge = <Badge status="processing" text='未踢群' />
                    }
                    return badge
                },
            },
        ]

        const rowSelection = {
            columnWidth: '8%',
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRowKeys: selectedRowKeys,
                    selectedRows: selectedRows,
                })
            },
            getCheckboxProps: record => ({
                disabled: !record.from.im_online_status,
            }),
        }

        return (
            <Modal
                className={styles.repeatGroupClearModal}
                visible={visible}
                onCancel={this.onCancel}
                onOK={this.onOk}
                width={1000}
                title="重复群详情"
                footer={null}
            >
                <div className={styles.clearBtnWrap}>
                    <Button type="primary" onClick={this.btnClear}>清理</Button>
                    <span style={{marginLeft: 10}}>• 勾选选择想要清理的群，点击清理后将陆续从群中将此用户踢出群，该操作请保证所属微信号的在线状态和群主状态</span>
                </div>
                <div className={styles.tableWrap}>
                    <Table
                        columns={columns}
                        rowSelection={rowSelection}
                        dataSource={clearModalList}
                        size="middle"
                        loading={queryLoading}
                        rowKey={(record, index) => record.chatroom_name}
                        pagination={false}
                        scroll={{ y: 400 }}
                    />
                </div>
            </Modal>
        )
    }
}
