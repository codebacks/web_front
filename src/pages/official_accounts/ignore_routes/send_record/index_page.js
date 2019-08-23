
import React from 'react'
import Page, {  DEFAULT_PAGER_FILTER} from '../../../../components/business/Page'
import {connect} from 'dva'
import DocumentTitle from 'react-document-title'
import { Button, Table, Pagination, Form, Row, Col, Input, DatePicker, Select, Popover, Badge ,Icon} from 'antd'
import styles from './index.less'
import moment from 'moment'
import editData from './../template_settings/setting_details/data'

const Option = Select.Option
const { RangePicker } = DatePicker

const DEFAULT_CONDITION = {
    type: undefined,
    subtype: undefined,
    receive_user_nick: undefined,
    status: undefined,
    date:[]
}

const DEFAULT_PAGER ={
    current:1, pageSize:10
}

@Form.create()
@connect(({template_send_record}) =>({
    template_send_record
}))

export default class extends Page.ListPureComponent {
    state = {
        loading: true,
        sortedInfo: {},
        condition: {...DEFAULT_CONDITION},
        pager: {...DEFAULT_PAGER}
    }
    pager = {...DEFAULT_PAGER}
    form ={...DEFAULT_CONDITION}
    initPage = (isSetHistory = false) => {

        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query, { date: this.momentToDate })
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        const { type, subtype, receive_user_nick, status,date } = condition
        this.form = condition
        this.pager = { ...this.pager, ...pager }
        this.getPageData(pager.current, pager.pageSize, isSetHistory)
        
        this.props.form.setFieldsValue({type, subtype,receive_user_nick,status,date})
    }

    getPageData = ( current = 1, pageSize = this.pager.pageSize, isSetHistory = true) => {
        let pager = { current, pageSize }
        let date = this.momentToStr(this.form.date)
        if( isSetHistory ){
            this.history({ ...this.form, ...{ date: date.join(',') } }, pager)
        }

        this.setState({
            loading: true
        })
        
        this.props.dispatch({
            type: 'template_send_record/messageHistories',
            payload: {
                offset: (pager.current - 1 ) * pager.pageSize,
                limit: pager.pageSize,
                begin_at: date[0],
                end_at: date[1],
                type: this.form.type,
                subtype: this.form.subtype,
                receive_user_nick: this.form.receive_user_nick,
                status: this.form.status,
            },
            callback: (data) => {
                this.setState({
                    loading: false,
                    pager
                })
            }
        })
    }
    momentToStr = (value) => {
        if (Array.isArray(value) && value.length === 2) {
            return [
                moment(value[0]).format('YYYY-MM-DD'),
                moment(value[1]).format('YYYY-MM-DD')
            ]
        }
        return [,]
    }
    momentToDate = (value) => {
        value = value.split && value.split(',')
        if (Array.isArray(value) && value.length === 2) {
            return [
                moment(value[0]),
                moment(value[1])
            ]
        }
        return [,]
    }


    searchData = () => {
        this.getPageData()
    }

    handleChangePage= (page) => {
        this.pager.current = page
        this.getPageData(this.pager.current)
    }

    handleListPageChangeSize = (current, size) => {
        this.pager.pageSize = size
        this.getPageData(1, this.pager.pageSize)
    }

    /* 事件处理 */
    onSubmit = (e) => {
        e.preventDefault()
        this.searchData()
    }

    onReset = () => {
        this.props.form.resetFields()
        this.form ={...DEFAULT_CONDITION}
        this.searchData()
    }

    popoverHover = (id) =>{
        if(id){
            this.setState({
                detailId:id
            })
        }
        
    }
    timeFormat = (str)=>{
        if(!str) return str
        return moment(str).format('MM月DD日')
    }

    detailContent =  (detail,id) => {
        if(id !== detail.id){
            return null
        }
        let data = {}
        editData && editData.forEach(item =>{
            if(item.subtype ===  detail.template_message_subtype + ''){
                data = item
            }
        })
        let content  = {}
        if( typeof detail.content ==='object'){
            content = detail.content 
        }

        const innerProjectList = data.inner && data.inner.map((pro, index)=><div className={styles.contentEditorName} key={index}> <b>{pro.column}：</b><span>{content['keyword'+(index+1)]}</span></div>)

        return <div className={styles.popover_content} onMouseEnter={e => this.popoverHover(detail.id)} onMouseLeave={e => this.popoverHover(null)}>
            <div className={styles.popover_content_title}>{content.name}</div>
            <p>{this.timeFormat(content.time)}</p>
            <pre>{content.first}</pre>
            {innerProjectList}
            <pre>{content.remark}</pre>
            {
                content.url? <a href={ content.url} className={styles.popover_content_bottom}>详情 <Icon type="right" /> </a> : null
            }
            
        </div>
    }

    render () {
        const { getFieldDecorator } = this.props.form
        const { list, total } = this.props.template_send_record
        const { current, pageSize } = this.state.pager

        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '80px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const letftFormItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '46px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }

        const longItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '96px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        
        const subtyp = {
            1:'订单支付成功通知',
            2:'订单发货通知',
            3:'订单配送通知',
            4:'订单签收通知',
            5:'购买评价提醒'
        }

        const columns = [
            {
                title: '发送时间',
                dataIndex: 'created_at'
            },
            {
                title: '模板名称',
                dataIndex: 'template_message_subtype',
                render: (text, record) => <div>{subtyp[text]}</div>
            },
            {
                title: '接收人昵称',
                dataIndex: 'receive_user_nick'
            },
            {
                title: '状态',
                dataIndex: 'status',
                render: (text, record) => {
                    return (
                        <div>{text +'' === '1'?<Badge status="success" text="成功" />:<Badge status="error" text="失败" />}</div>
                    )
                }
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record) => {
                    return (
                        <Popover key={record.id} 
                            placement="bottomRight"
                            onMouseEnter={e => this.popoverHover(record.id)}
                            onMouseLeave={e => this.popoverHover(null)}
                            content={this.detailContent(record,this.state.detailId)} 
                            trigger="hover">
                            <a href='javascript:;' onClick={e => e.preventDefault() }>详情</a>
                        </Popover>
                    )
                }
            },
        ]

        return (
            <DocumentTitle title='发送记录'>
                <Page>
                    <Page.ContentHeader
                        title='发送记录'
                        helpUrl='http://newhelp.51zan.cn/manual/content/%E5%85%AC%E4%BC%97%E5%8F%B7/%E6%A8%A1%E6%9D%BF%E6%B6%88%E6%81%AF.md'
                    />
                    <Page.ContentAdvSearch hasGutter={false}>
                        <Form onSubmit={this.onSubmit}>
                            <Row>
                                <Col span={8}>
                                    <Form.Item label='分类' {...letftFormItemLayout}>
                                        {getFieldDecorator('type',{})(
                                            <Select allowClear placeholder='所有' onChange={value=> this.form.type = value}>
                                                <Option value="1">订单通知</Option>
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label='模板名称' {...formItemLayout}>
                                        {getFieldDecorator('subtype',{})(
                                            <Select allowClear placeholder='所有' onChange={value=> this.form.subtype = value}>
                                                <Option value="1">订单支付成功通知</Option>
                                                <Option value="2">订单发货通知</Option>
                                                <Option value="3">订单配送通知</Option>
                                                <Option value="4">订单签收通知</Option>
                                                <Option value="5">购买评价提醒</Option>
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label='接收人昵称' {...longItemLayout}>
                                        {getFieldDecorator('receive_user_nick',{})(
                                            <Input placeholder='请输入' onChange={e=> this.form.receive_user_nick = e.target.value}/>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <Form.Item label='状态' {...letftFormItemLayout}>
                                        {getFieldDecorator('status',{})(
                                            <Select allowClear placeholder='所有' onChange={ value => this.form.status = value}>
                                                <Option value='1'>成功</Option>
                                                <Option value='2'>失败</Option>
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label='发送时间' {...formItemLayout}>
                                        {getFieldDecorator('date',{})(
                                            <RangePicker onChange={value=> this.form.date = value}/>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Button type='primary' icon="search" style={{marginLeft: '80px'}} htmlType='submit'>搜索</Button>
                            <Button style={{marginLeft: '16px',width: '82px'}} onClick={this.onReset}>重置</Button>
                        </Form>
                    </Page.ContentAdvSearch>
                    
                    <Table
                        className={styles.table}
                        columns={columns}
                        dataSource={list}
                        onChange={this.onTableChange}
                        loading={this.state.loading}
                        pagination={false}
                        rowKey={(record, index) => index}
                    />
                    {parseFloat(total) ?
                        <Pagination
                            className="ant-table-pagination"
                            current={current}
                            total={parseFloat(total)}
                            showTotal={(total) => `共 ${total} 条`}
                            showQuickJumper={true} 
                            showSizeChanger={true}  
                            pageSize={pageSize} 
                            pageSizeOptions= {['10', '20', '50', '100']}
                            onShowSizeChange={this.handleListPageChangeSize}
                            onChange={this.handleChangePage} />
                        : null
                    }
                </Page>
            </DocumentTitle>
        )
    }
}
