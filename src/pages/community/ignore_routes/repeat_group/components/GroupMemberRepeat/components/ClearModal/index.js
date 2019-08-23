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

@connect(({base, community_groupMemberRepeat, loading}) => ({
    base, community_groupMemberRepeat,
    queryLoading: loading.effects['community_groupMemberRepeat/queryDetail'],
    clearLoading: loading.effects['community_groupMemberRepeat/clear'],
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
            type: 'community_groupMemberRepeat/resetParams',
        })
    }

    goPage = () => {
        const { record } = this.props
        this.props.dispatch({
            type: 'community_groupMemberRepeat/queryDetail',
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
            message.warn('请先选择要清理的员工号！')
            return false
        }
        let usernames = ''
        selectedRows.forEach((item, index) => {
            if(index === 0){
                usernames += item.username
            }else{
                usernames += `,${item.username}`
            }
        })
        this.props.dispatch({
            type: 'community_groupMemberRepeat/clear',
            payload: {
                chatroomname: record.chatroomname,
                body: {
                    usernames: usernames
                }
            },
            callback: () => {
                message.success('执行清理指令已发送，数据更新请等待一小段时间')
                this.onOk()
            }
        })
    }


    render() {
        const { clearModalList } = this.props.community_groupMemberRepeat
        const { queryLoading, clearLoading, visible, record } = this.props

        const columns = [
            {
                title: '员工号信息',
                dataIndex: 'nickname',
                key: 'nickname',
                className: styles.staffInfo,
                render: (text, record) => {
                    return (
                        <>
                            <div className={styles.staffInfoItem}>{text} / {record?.remark}</div>
                            <div className={styles.staffInfoItem}>{record?.alias || record?.username}</div>
                            {
                                record?.is_owner ? (
                                    <div className={styles.staffInfoItem}>
                                        <span className={styles.groupOwnerFlag}>群主</span>
                                    </div>
                                ) : null
                            }
                        </>
                    )

                },
            },
            {
                title: '所属部门',
                dataIndex: 'user.departments.name',
                key: 'user.departments.name',
                className: styles.department,
                render: (text, record) => {
                    if(record.user && record.user.departments) {
                        let departments = record.user.departments
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
                dataIndex: 'user.nickname',
                key: 'user.nickname',
                className: styles.user,
                render: (text, record) => {
                    return <span>{text ? text: '无'}</span>
                },
            },
            {
                title: '在线状态',
                dataIndex: 'im_online_status',
                key: 'im_online_status',
                className: styles.online,
                render: (text, record) => {
                    return text ? (
                        <span>
                            <Badge status="processing" text='在线' />
                        </span>
                    )
                        : (
                            <span>
                                <Badge status="error" text='离线'/>
                            </span>
                        )
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
                disabled: !!record.is_owner || !record?.im_online_status,
            }),
        }

        return (
            <Modal
                className={styles.clearModal}
                visible={visible}
                onCancel={this.onCancel}
                onOK={this.onOk}
                width={1000}
                title="员工号详情"
                footer={null}
            >
                <div className={styles.clearBtnWrap}>
                    <div className={styles.clearBtnWrapLeft}>
                        <span>群名称：</span>
                        <EllipsisPopover content={record?.target?.nickname || record?.target?.display_name} lines={1} ellipsisClassName={styles.groupName}/>
                    </div>
                    <div className={styles.clearBtnWrapRight}>
                        <span style={{marginRight: 14}}>• 勾选选择想要清理的员工，点击后员工执行退群操作，离线状态不可选中</span>
                        <Button type="primary" onClick={this.btnClear} loading={clearLoading}>清理</Button>
                    </div>
                </div>
                <div className={styles.tableWrap}>
                    <Table
                        columns={columns}
                        rowSelection={rowSelection}
                        dataSource={clearModalList}
                        size="middle"
                        loading={queryLoading}
                        rowKey={(record, index) => record.username}
                        pagination={false}
                        scroll={{ y: 400 }}
                    />
                </div>
            </Modal>
        )
    }
}
