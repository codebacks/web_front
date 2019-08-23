import React from 'react'
import {Button, Table, Divider, Modal, message} from 'antd'
import styles from './index.less'
import {hot} from 'react-hot-loader'
import {connect} from 'dva/index'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader'
import constants from 'risk_control/common/constants'
import GroupsModal from './components/GroupsModal'

@hot(module)
@connect(({risk_control_devicesGroups, loading}) => ({
    risk_control_devicesGroups,
    tableLoading: loading.effects['risk_control_devicesGroups/details'],
    changeGroupsLoading: loading.effects['risk_control_devicesGroups/changeGroups'],
    createGroupsLoading: loading.effects['risk_control_devicesGroups/createGroups'],
}))
@documentTitleDecorator()
export default class Index extends React.Component {
    componentDidMount() {
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'risk_control_devicesGroups/details',
            payload: {page: page},
        })
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'risk_control_devicesGroups/setStateByPath',
            payload: {
                path: 'params.limit',
                value: size,
            },
        })
        this.goPage(1)
    }

    render() {
        const {
            tableLoading,
            risk_control_devicesGroups,
            changeGroupsLoading,
            createGroupsLoading,
            dispatch,
        } = this.props

        const {list, current, total, params = {}} = risk_control_devicesGroups

        const columns = [
            {
                title: '分组名称',
                dataIndex: 'name',
            },
            {
                title: '分组备注',
                dataIndex: 'remark',
                render: (text, record, index) => {
                    return text
                },
            },
            {
                title: '分组数量',
                dataIndex: 'device_count',
                render: (text, record, index) => {
                    return text
                },
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record, index) => {
                    return (
                        <div className={styles.operator}>
                            <GroupsModal
                                dispatch={dispatch}
                                record={record}
                                goPage={this.goPage}
                                renderBtn={(setTrue) => {
                                    return (
                                        <span
                                            className={styles.operatorBtn}
                                            onClick={setTrue}
                                        >
                                            修改
                                        </span>
                                    )
                                }}
                                modalOption={{
                                    title: '编辑分组',
                                    confirmLoading: changeGroupsLoading,
                                }}
                            />
                            <Divider type="vertical"/>
                            <span
                                className={styles.operatorBtn}
                                onClick={() => {
                                    Modal.confirm({
                                        title: '确定删除本条记录吗?',
                                        okText: '确定',
                                        okType: 'danger',
                                        cancelText: '取消',
                                        onOk: () => {
                                            return new Promise((resolve, reject) => {
                                                dispatch({
                                                    type: 'risk_control_devicesGroups/deleteGroups',
                                                    payload: {
                                                        id: record.id,
                                                    },
                                                    callback: (data) => {
                                                        resolve()
                                                        if(data?.meta?.code === 200) {
                                                            message.success('删除成功')
                                                            this.goPage()
                                                        }
                                                    },
                                                })
                                            })
                                        },
                                    })
                                }}
                            >
                                删除
                            </span>
                        </div>
                    )
                },
            },
        ]

        return (
            <div className={styles.main}>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                />
                <div className={styles.content}>
                    <div className={styles.option}>
                        <GroupsModal
                            dispatch={dispatch}
                            goPage={this.goPage}
                            renderBtn={(setTrue) => {
                                return (
                                    <Button
                                        type="primary"
                                        icon="plus"
                                        onClick={setTrue}
                                    >
                                        创建分组
                                    </Button>
                                )
                            }}
                            modalOption={{
                                title: '创建分组',
                                confirmLoading: createGroupsLoading,
                            }}
                        />
                    </div>
                    <div className={styles.table}>
                        <Table
                            columns={columns}
                            dataSource={list}
                            rowKey={(record) => record.id}
                            loading={tableLoading}
                            pagination={
                                list.length
                                    ? {
                                        total,
                                        current,
                                        showQuickJumper: true,
                                        showTotal: (total) => `共 ${total} 条`,
                                        pageSize: params.limit,
                                        showSizeChanger: true,
                                        onChange: this.goPage,
                                        onShowSizeChange: this.handleChangeSize,
                                        pageSizeOptions: constants.pageSizeOptions,
                                    }
                                    : false
                            }
                        />
                    </div>
                </div>
            </div>
        )
    }
}
