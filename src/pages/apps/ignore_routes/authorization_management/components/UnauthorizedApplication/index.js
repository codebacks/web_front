import React from 'react'
import {Modal, Table, message} from 'antd'
import styles from './index.less'
import {hot} from 'react-hot-loader'
import {connect} from 'dva/index'
import documentTitleDecorator from 'hoc/documentTitle'
import constants from 'apps/common/constants'
import {appType} from '../../help'
import moment from 'moment'

@hot(module)
@connect(({apps_authorizationManagement, loading}) => ({
    apps_authorizationManagement,
    tableLoading: loading.effects['apps_authorizationManagement/details'],
}))
@documentTitleDecorator({
    overrideTitle: '待授权应用',
})
export default class Index extends React.Component {
    componentDidMount() {
        this.goPage(1)
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'apps_authorizationManagement/clearTableList',
        })
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'apps_authorizationManagement/details',
            payload: {page: page, status: 0},
        })
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'apps_authorizationManagement/setStateByPath',
            payload: {
                path: 'params.limit',
                value: size,
            },
        })
        this.goPage(1)
    }

    render() {
        const {tableLoading, apps_authorizationManagement} = this.props

        const {list, current, total, params = {}} = apps_authorizationManagement

        const columns = [
            {
                title: '应用名称',
                dataIndex: 'name',
            },
            {
                title: '类型',
                dataIndex: 'type',
                render: (text, record, index) => {
                    return appType[text]
                },
            },
            {
                title: '开发者',
                dataIndex: 'nickname',
                render: (text, record, index) => {
                    return text
                },
            },
            {
                title: '申请人',
                dataIndex: 'apply_user_nickname',
                render: (text, record, index) => {
                    return text
                },
            },
            {
                title: '时间',
                dataIndex: 'update_time',
                render: (text, record, index) => {
                    if (text) {
                        return moment(text * 1000).format(constants.DateTimeFormat)
                    }
                    return ''
                },
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record, index) => {
                    return (
                        <div className={styles.operator}>
                            <span
                                className={styles.operatorBtn}
                                onClick={() => {
                                    Modal.confirm({
                                        title: '授权',
                                        content: '授权该应用访问您的数据？',
                                        okText: '授权',
                                        onOk: () => {
                                            return new Promise((resolve, reject) => {
                                                this.props.dispatch({
                                                    type: 'apps_authorizationManagement/grantApps',
                                                    payload: {
                                                        id: record.id,
                                                        body: {
                                                            status: 1,
                                                        },
                                                    },
                                                    callback: () => {
                                                        message.success('授权成功')
                                                        this.goPage()
                                                        resolve()
                                                    },
                                                })
                                            })
                                        },
                                    })
                                }}
                            >
                                授权
                            </span>
                        </div>
                    )
                },
            },
        ]

        return (
            <div className={styles.main}>
                <div className={styles.content}>
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
