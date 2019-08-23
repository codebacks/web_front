/**
 **@Description:
 **@author: leo
 */

import React, {Component} from 'react'
import {connect} from 'dva'
import {
    Modal,
    Table,
    Pagination,
    Divider,
    // message,
} from 'antd'
import Page from 'components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import Edit from './components/Edit'
import styles from './index.scss'
import moment from 'moment'
import _ from 'lodash'
import ContentHeader from 'business/ContentHeader'

const confirm = Modal.confirm

const verifyStatusMap = {
    0: {
        name: '未确认',
        style: {
            color: '',
        },
    },
    1: {
        name: '已通过',
        style: {
            color: 'green',
        },
    },
    2: {
        name: '已拒绝',
        style: {
            color: 'red',
        },
    },
}

@connect(({setting_auditAccount, loading, base}) => ({
    setting_auditAccount,
    base,
    tableLoading: loading.effects['setting_auditAccount/invitations'],
}))
@documentTitleDecorator({
    title: '审核账号',
})
export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            editProp: {
                visible: false,
            },
        }
    }

    componentDidMount() {
        this.goPage(1)
    }

    goPage = (page, callback) => {
        this.props.dispatch({
            type: 'setting_auditAccount/invitations',
            payload: {page: page},
            callback,
        })
    }

    operatorRemove = (item) => {
        confirm({
            iconType: 'info-circle',
            title: '审核不通过',
            content: '审核不通过该员工将无法登录平台，确定审核不通过？',
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                return new Promise((resolve, reject) => {
                    this.props.dispatch({
                        type: 'setting_auditAccount/noPass',
                        payload: {
                            verify_status: 2,
                            user: item,
                            id: item.id,
                        },
                        callback: () => {
                            this.goPage()
                        },
                    })
                    resolve()
                }).catch((err) => console.log(err))
            },
            onCancel() {

            },
        })
    }

    editCancel = () => {
        const {editProp} = this.state
        this.setState({
            editProp: {
                ...editProp,
                visible: false,
            },
        })
    }

    nextOpen = () => {
        this.goPage(null, () => {
            const item = _.get(this, 'props.setting_auditAccount.invitations').find((item) => {
                return item.verify_status === 0
            })

            if(!item) {
                // message.success('全部审核完成')
                this.editCancel()
                return
            }
            this.props.dispatch({
                type: 'setting_auditAccount/setProperty',
                payload: {
                    userForm: Object.assign({}, item),
                },
            })
            this.props.dispatch({
                type: 'setting_auditAccount/roles',
                payload: {},
            })
            this.setState({
                editProp: {
                    visible: true,
                    title: '审核账号',
                },
            })
        })
    }

    operatorEdit = (item) => {
        this.props.dispatch({
            type: 'setting_auditAccount/setProperty',
            payload: {
                userForm: Object.assign({}, item),
            },
        })
        this.props.dispatch({
            type: 'setting_auditAccount/roles',
            payload: {},
        })
        this.setState({
            editProp: {
                visible: true,
                title: '审核账号',
            },
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.setting_auditAccount.params}
        params.limit = size
        this.props.dispatch({
            type: 'setting_auditAccount/setProperty',
            payload: {params: params},
        })
        this.goPage(1)
    }

    render() {
        const {
            params,
            total,
            current,
            invitations,
        } = this.props.setting_auditAccount

        const columns = [
            {
                title: '申请人',
                dataIndex: 'nickname',
            },
            {
                title: '账号',
                dataIndex: 'username',
            },
            {
                title: '申请人留言',
                dataIndex: 'remark',
                className: styles.remark
            },
            {
                title: '邀请人',
                dataIndex: 'invite_user',
                render: (text, record, index) => {
                    return _.get(text, 'nickname', '')
                },
            },
            {
                title: '申请时间',
                dataIndex: 'create_time',
                render: (text, record, index) => {
                    return moment(text * 1000).format('YYYY-MM-DD HH:mm:ss')
                },
            },
            {
                title: '审核状态',
                dataIndex: 'verify_status',
                render: (text, record, index) => {
                    return <span style={verifyStatusMap[text].style}>{verifyStatusMap[text].name}</span>
                },
            },
            {
                title: '审核人',
                dataIndex: 'verify_user',
                render: (text, record, index) => {
                    return _.get(text, 'nickname', '')
                },
            },
            {
                title: '审核时间',
                dataIndex: 'verify_time',
                render: (text, record, index) => {
                    return text ? moment(text * 1000).format('YYYY-MM-DD HH:mm:ss') : ''
                },
            },
            {
                title: '操作',
                key: 'operator',
                render: (text, record, index) => {
                    if(record.verify_status !== 0) {
                        return null
                    }
                    return (
                        <div>
                            <span
                                className={styles.operatorBtn}
                                onClick={this.operatorEdit.bind(null, text)}
                            >
                                通过
                            </span>
                            <Divider type="vertical"/>
                            <span
                                className={styles.operatorBtn}
                                onClick={this.operatorRemove.bind(null, text)}
                            >
                                不通过
                            </span>
                        </div>
                    )
                },
            },
        ]

        return (
            <Page>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '账号管理',
                                path: '/setting/team_management',
                            },
                            {
                                name: '审核账号'
                            }
                        ]
                    }
                />
                <div className={styles.content}>
                    <div className={styles.table}>
                        <Table
                            columns={columns}
                            dataSource={invitations}
                            rowKey={record => record.id}
                            pagination={false}
                            loading={this.props.tableLoading}
                        />
                        {invitations.length ? (
                            <Pagination
                                className="ant-table-pagination"
                                total={total}
                                current={current}
                                showQuickJumper={true}
                                showTotal={total => `共 ${total} 条`}
                                pageSize={params.limit}
                                showSizeChanger={true}
                                onShowSizeChange={this.handleChangeSize}
                                onChange={this.goPage}
                                pageSizeOptions={['10', '20', '50', '100']}
                            />
                        ) : (
                            ''
                        )}
                    </div>
                </div>
                <Edit
                    goPage={this.goPage}
                    onCancel={this.editCancel}
                    nextOpen={this.nextOpen}
                    {...this.state.editProp}
                    {...this.props}
                />
            </Page>
        )
    }
}
