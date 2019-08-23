'use strict'

import React, {Fragment} from 'react'
import { Modal, message, Checkbox, Table, Pagination, Badge, Popover } from 'antd'
import {connect} from 'dva'
import styles from './index.less'
import _ from "lodash"
import moment from "moment/moment"
import config from "wx/common/config"
import EllipsisPopover from "components/EllipsisPopover"

const {pageSizeOptions, DateTimeFormat} = config
const CheckboxGroup = Checkbox.Group

@connect(({base, community_groupNoticeRecord, loading}) => ({
    base, community_groupNoticeRecord,
    queryLoading: loading.effects['community_groupNoticeRecord/queryDetailList'],
}))
export default class extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        console.log('NoticeRecordModal-didmount')
    };

    componentWillUnmount() {
        this.reset()
    }

    reset = () => {
        this.props.dispatch({
            type: 'community_groupNoticeRecord/resetParams',
        })
    }

    handleStatusChange = (values) => {
        let modalParams = {...this.props.community_groupNoticeRecord.modalParams}
        let status = {...modalParams.status}
        modalParams.status = values
        this.props.dispatch({
            type: 'community_groupNoticeRecord/setProperty',
            payload: {
                modalParams: modalParams,
            },
        })
        this.goPage(1)
    }

    handleChangeSize = (current, size) => {
        let modalParams = {...this.props.community_groupNoticeRecord.modalParams}
        modalParams.limit = size
        this.props.dispatch({
            type: 'community_groupNoticeRecord/setProperty',
            payload: {modalParams: modalParams},
        })
        this.goPage(1) // 重置个数时回到首页
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'community_groupNoticeRecord/queryDetailList',
            payload: {
                page: page,
                task_id: _.get(this.props, 'record.id'),
            },
        })
    }

    onCancel = () => {
        this.props.onCancel()
    }

    // 0: '未修改', 1: '已修改', -1: '失败', 2: '执行中', -2: '已取消'
    getStatusBadge = (status) => {
        switch (status) {
            case 0:
                return <Badge status="warning" text="未修改"/>
            case 1:
                return <Badge status="success" text="已修改"/>
            case -1:
                return <Badge status="error" text="失败"/>
            case 2:
                return <Badge status="processing" text="执行中"/>
            case -2:
                return <Badge status="default" text="已取消"/>
        }
    }

    reExecute = (record) => {
        const { id } = record
        this.props.dispatch({
            type: 'community_groupNoticeRecord/reExecute',
            payload: {
                task_id: _.get(this.props, 'record.id'),
                detail_id: id
            },
            callback: this.goPage.bind(this, 1)
        })

    }


    render() {
        const { modalList, modalParams, modalTotal, modalCurrent } = this.props.community_groupNoticeRecord
        const { queryLoading, visible, record } = this.props

        const columns = [
            {
                title: '群名称',
                dataIndex: 'target.nickname',
                key: 'target.nickname',
                className: styles.groupName,
                render: (text, record) => {
                    return text ? <EllipsisPopover lines={3} content={text} /> : <EllipsisPopover lines={3} content={record.target.display_name} />
                },
            },
            {
                title: '群主',
                dataIndex: 'target.owner.display_name',
                key: 'target.owner.display_name',
                className: styles.owner,
                render: (text, record) => {
                    return text ? text : record.target.owner.nickname
                },
            },
            {
                title: '所属部门',
                dataIndex: 'target.user.departments.name',
                key: 'target.user.departments.name',
                className: styles.department,
                render: (text, record) => {
                    if(record.target.user && record.target.user.departments) {
                        let departments = record.target.user.departments
                        let content = ''
                        if(departments && departments.length) {
                            content = departments.map((item) => {
                                return item.name
                            }).join('，')
                            return <Popover placement="topLeft" content={<p className={styles.wholeDept}>{content}</p>}
                                title={null} trigger="hover">
                                <div className={styles.dept}>{content}</div>
                            </Popover>
                        }
                    }
                    return ''
                },
            },
            {
                title: '所属员工',
                dataIndex: 'target.user.nickname',
                key: 'target.user.nickname',
                className: styles.user,
                render: (text, record) => {
                    return text ? text: '-'
                },
            },
            {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                className: styles.status,
                render: (text, record) => {
                    return <div>
                        {this.getStatusBadge(text)}
                    </div>
                },
            },
            {
                title: '反馈时间',
                dataIndex: 'feedback_time',
                key: 'feedback_time',
                className: styles.feedTime,
                render: (text, record) => {
                    return record.execute_time ? moment(record.execute_time*1000).format(DateTimeFormat): '-'
                    // return record.execute_time ? record.execute_time: '-'
                }
            },
            {
                title: '操作',
                dataIndex: 'edit',
                key: 'edit',
                className: styles.edit,
                render: (text, record) => {
                    return <div>
                        {
                            record.status === -1 ? (<p onClick={() => this.reExecute(record)}>重新执行</p>)
                                : (<p className={styles.disabled}>重新执行</p>)
                        }

                    </div>
                },
            },
        ]

        return (
            <Modal
                className={styles.noticeRecordModal}
                visible={visible}
                onCancel={this.onCancel}
                width={1000}
                title="结果明细"
                footer={null}
            >
                <div style={{marginBottom: 6}}>编号：{record?.id}</div>
                <CheckboxGroup value={modalParams.status} onChange={this.handleStatusChange}>
                    <Checkbox value={1}>已修改</Checkbox>
                    <Checkbox value={-1}>失败</Checkbox>
                    <Checkbox value={0}>未修改</Checkbox>
                    <Checkbox value={2}>执行中</Checkbox>
                    <Checkbox value={-2}>已取消</Checkbox>
                </CheckboxGroup>
                <div className={styles.tableWrap}>
                    {
                        modalList.length ?
                            <Fragment>
                                <Table columns={columns}
                                    dataSource={modalList}
                                    size="middle"
                                    loading={queryLoading}
                                    rowKey={(record, index) => index}
                                    pagination={false}
                                />
                                <Pagination
                                    className="ant-table-pagination"
                                    total={modalTotal}
                                    current={modalCurrent}
                                    showQuickJumper={true}
                                    pageSizeOptions={pageSizeOptions}
                                    showTotal={modalTotal => `共 ${modalTotal} 条`}
                                    pageSize={modalParams.limit}
                                    showSizeChanger={true}
                                    onShowSizeChange={this.handleChangeSize}
                                    onChange={this.goPage}
                                />
                            </Fragment>
                            : ''}
                </div>

            </Modal>
        )
    }
}
