/**
 **@time: 2018/8/9
 **@Description:
 **@author: wangchunting
 */

import React, { Component } from 'react'
import { connect } from 'dva'
import { Button, Table, Divider, Modal, Icon } from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import Page from '@/components/business/Page'
import DocumentTitle from 'react-document-title'
import Pay from './modal/Pay'


@connect(({ setting_pay, base }) => ({
    setting_pay, base
}))
@documentTitleDecorator()
export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentID: '',
            editID: '',
            showEditDialog: false,
            loading: false
        }
    }

    //初始化执行
    componentDidMount() {
        this.getListData()
        //token
        this.props.dispatch({
            type: 'setting_pay/getToken',
            payload: {
                type: 'document',
            },
        })
    }

    //初始化,获取列表数据
    getListData = () => {
        this.props.dispatch({
            type: 'setting_pay/payList',
            payload: {},
        })
    }

    // 删除数据
    showDeleteConfirm = (item) => {
        Modal.confirm({
            title: "确认要删除吗？",
            content: '删除后，与支付相关的功能将无法使用，是否确定删除?',
            okText: '确定',
            cancelText: '取消',
            iconType: 'exclamation-circle',
            onOk: () => {
                this.getDeleteData(item.id)
            },
            onCancel: () => {
            },
        })
    }

    getDeleteData = (id) => {
        this.props.dispatch({
            type: "setting_pay/remove",
            payload: {
                id: id
            },
            callback: () => {
                Modal.success({
                    title: '系统提示',
                    content: '删除成功',
                    onOk: () => {
                        this.getListData()
                    }
                })
            }
        })
    }

    // 修改数据
    showEditConfirm = (item) => {
        this.setState({
            currentID: item.id,
            showEditDialog: true
        }, () => {

        })

    }

    //添加数据
    showConfirm = () => {
        this.setState({
            currentID: '',
            showEditDialog: true
        }, () => {
            this.props.dispatch({
                type: 'setting_pay/resetModel',
                payload: {}
            })
        })
    }

    addCompletedHandler = (result) => {
        this.setState({
            currentID: '',
            showEditDialog: false
        })

        if (result === 'ok') {
            this.getListData()
        }
    }

    render() {
        const { payData, documentToken } = this.props.setting_pay
        // table
        const columns = [{
            title: '商户号',
            dataIndex: 'key',
        }, {
            title: '更新时间',
            dataIndex: 'update_time',
        }, {
            title: '使用中',
            dataIndex: 'used_info',
        }, {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <span>
                    <a href="javascript:;" onClick={() => this.showEditConfirm(record)}>编辑</a>
                    <Divider type="vertical" />
                    <a href="javascript:;" onClick={() => this.showDeleteConfirm(record)} type="dashed">删除</a>
                </span>
            ),
        }]

        // header
        const action = (
            <div>
                <Button type="primary" onClick={this.showConfirm}><Icon type="plus" />添加配置</Button>
                <span className="hz-page-content-action-description" style={{ fontSize: 12, color: '#999' }}>
                发小红包、虎赞小店及相关支付，需为公众号、小程序添加相应支付配置
                </span>
            </div>
        )

        return (
            <DocumentTitle title="支付设置">
                <Page>
                    <Page.ContentHeader
                        title='支付设置'
                        helpUrl="http://newhelp.51zan.cn/manual/content/%E7%B3%BB%E7%BB%9F%E8%AE%BE%E7%BD%AE/%E6%8E%88%E6%9D%83.md"
                        action={action}
                    />
                    <Pay
                        key={this.state.currentID}
                        visible={this.state.showEditDialog}
                        onAddCompleted={this.addCompletedHandler}
                        documentToken={documentToken}
                        projectId={this.state.currentID}
                        {...this.props}
                    ></Pay>
                    <Table
                        pagination={false}
                        columns={columns}
                        dataSource={payData}
                        loading={this.state.loading}
                        rowKey="id"
                    />
                </Page>
            </DocumentTitle>
        )
    }
}
