import React from 'react'
import {message, Modal, Table} from 'antd'
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
    overrideTitle: '已授权应用',
})
export default class Index extends React.Component {
    componentDidMount() {
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'apps_authorizationManagement/details',
            payload: {page: page, status: 1},
        })
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'apps_authorizationManagement/clearTableList',
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
                title: '授权人',
                dataIndex: 'approve_user_nickname',
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
                                        title: '解除授权',
                                        content: '解除授权后，该应用将不能继续使用，确定要解除授权？',
                                        onOk: () => {
                                            return new Promise((resolve, reject) => {
                                                this.props.dispatch({
                                                    type: 'apps_authorizationManagement/grantApps',
                                                    payload: {
                                                        id: record.id,
                                                        body: {
                                                            status: -1,
                                                        },
                                                    },
                                                    callback: () => {
                                                        message.success('解除授权成功')
                                                        this.goPage()
                                                        resolve()
                                                    },
                                                })
                                            })
                                        },
                                    })
                                }}
                            >
                                解除授权
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
