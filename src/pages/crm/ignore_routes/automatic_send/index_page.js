'use strict'

import React from 'react'
import { connect } from 'dva'
import { Table, Pagination, Button, Switch, Divider, Popover , Form, Icon, Popconfirm, message} from 'antd'
// import documentTitleDecorator from 'hoc/documentTitle'
import Page, { DEFAULT_PAGER} from '@/components/business/Page'
import Link  from 'umi/link'
import MessageAccount from '@/pages/crm/components/MessageManage/MessageAccount'
import config from 'crm/common/config'
import documentTitleDecorator from 'hoc/documentTitle'
import numeral from 'numeral'
import router from 'umi/router'
import moment from 'moment'
import styles from './index.less'
const { pageSizeOptions } = config
// const { pageSizeOptions } = config

@connect(({base,atuo_send_message }) => ({
    base,atuo_send_message
}))
@documentTitleDecorator({
    title: '自动发送'
})
@Form.create()
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            loading: false,
            pager: {
                ...DEFAULT_PAGER
            },
            status:'2',
        }
    }
    form = {
        ...DEFAULT_PAGER
    }
    componentDidMount() {
        this.getList()
    }

    getList = (current = this.form.current, pageSize = this.form.pageSize) => {
        let pager = { current, pageSize }
        this.setState({
            loading: true
        })
        this.props.dispatch({
            type: 'atuo_send_message/autoSendList',
            payload: {
                offset: (pager.current - 1) * pager.pageSize,
                limit: pager.pageSize
            },
            callback: (data) => {
                this.setState({
                    loading: false,
                    pager
                })
            }
        })
    }
    ceateAutomatic =()=>{
        router.push('/crm/automatic_send/create_automatic')
    }

    handlePageChange = (page) => {
        this.form.current = page
        this.getList()
    }

    handleChangeSize = (current, size) => {
        this.form.current = 1
        this.form.pageSize = size
        this.getList()
    }

    
    inlineSwitchChange = (value, row) => {
        this.props.dispatch({
            type: 'atuo_send_message/putOpenAutoSend',
            payload:{
                id:row.id,
                status:value ? '1':'2'
            },
            callback:()=>{
                message.success('操作成功')
                this.getList()
            }
        })
    }
    confirm = (row) =>{
        this.props.dispatch({
            type: 'atuo_send_message/deleteAutoSend',
            payload:{
                id:row.id
            },
            callback:()=>{
                message.success('删除成功')
                this.getList()
            }
        })
    }

    render() {
        const { list, total, rule } = this.props.atuo_send_message
        const sendType = {
            1: '营销',
            2: '加粉'
        }
        const columns = [
            {
                title: '任务名称',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: '短信类型',
                dataIndex: 'template_type',
                key: 'template_type',
                render: (type) => sendType[type]
            },
            {
                title: '短信内容',
                width: 300,
                dataIndex: 'content',
                key: 'content',
                render: (text,record) =>
                <Popover placement="top" content={
                    <p className={styles.table__content__popover}>
                        {record.template_configs.sms_content}
                    </p>
                } trigger="hover">
                    <div className={styles.table__content}>{record.template_configs.sms_content}</div>
                </Popover>

            },
            {
                title:'创建人',
                dataIndex:"creator",
                key:"creator"
            },
            {
                title: '发送短信数',
                dataIndex: 'send_count',
                key: 'send_count',
                render: (data) => numeral(data).format('0,0') 
            },
            {
                title: '发送人次',
                dataIndex: 'unique_mobile_count',
                key: 'unique_mobile_count',
                render: (data) => numeral(data).format('0,0') 
            },
            {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                render: (status, row) => <Switch
                    checkedChildren="开启"
                    unCheckedChildren="关闭"
                    checked={status + '' === '1'}
                    onChange={(value) => this.inlineSwitchChange(value, row)}
                />
            },
            {
                title: '操作',
                dataIndex: 'handle',
                key: 'handle',
                render: (data, row) => <div>
                    <Link to={`/crm/automatic_send/autoDetail?id=${row.id}`}  > 详情 </Link>
                    <Divider type="vertical" />
                    <Popconfirm placement="bottomRight" title={"您是否确定删除此模板？"} onConfirm={e => this.confirm(row)} okText="删除" cancelText="取消">
                        <a onClick={e => e.preventDefault()}> 删除 </a>
                    </Popconfirm>
                </div>
                
            }
        ]
        const action =<div>
            1. 数据来源于用户池<br/>
            2. 必须为已下单用户且订单状态为“待发货”<br/>
            3. 手动导入用户池数据没有订单，无法满足事项2
        </div>
        return (
            <Page>
                <Page.ContentHeader
                    title="自动发送"
                    titleHelp = {<Popover placement="bottomLeft" content={action}>
                        <Icon className="hz-text-primary hz-icon-size-default hz-icon-popover" type="question-circle-o"/>
                    </Popover>}
                />
                <MessageAccount />
                <Button type="primary"  style={{margin:'16px auto 0'}}  onClick={this.ceateAutomatic}><Icon type="plus" /> 创建任务</Button>
                <Page.ContentTable>
                    <Table
                        columns={columns}
                        className={styles.autoMatic}
                        dataSource={list}
                        size="middle"
                        rowKey={(record, index) => index}
                        pagination={false}
                        loading={this.state.loading}
                    />
                </Page.ContentTable>

                {total > 0 ? (<Pagination
                    className="ant-table-pagination"
                    total={total}
                    current={this.state.pager.current}
                    showQuickJumper={true}
                    pageSizeOptions={pageSizeOptions}
                    showTotal={total => `共 ${total} 条`}
                    pageSize={this.state.pager.pageSize}
                    showSizeChanger={true}
                    onShowSizeChange={this.handleChangeSize}
                    onChange={this.handlePageChange}
                />) : null}
            </Page>
        )
    }
}
