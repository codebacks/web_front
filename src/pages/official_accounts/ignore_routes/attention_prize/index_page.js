/* eslint-disable jsx-a11y/anchor-is-valid */
'use strict'

import React, { Fragment } from 'react'
import { connect } from 'dva'
import { Table, Pagination, Button, Form, Row, Col, Input, Icon, message, Divider, Select,Modal,  DatePicker } from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import moment from 'moment'
import Link from 'umi/link'
import UserSelect from 'components/business/UserSelect'
import Statistics from './Statistics'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import styles from './index.less'

const { RangePicker } = DatePicker
const Option = Select.Option

const pageSizeOptions = ['10', '20', '50', '100']

const DEFAULT_CONDITION = {
    title: '',
    status: undefined,
    creator_id: undefined,
    begin_at:'',
    end_at:''
}

@connect(({ base,attention_prize }) => ({base, attention_prize }))

@documentTitleDecorator({ title: '关注有礼' })
@Form.create()
export default class extends Page.ListPureComponent {
    constructor(props) {
        super()
        this.state = {
            loading: false,
            user_id: undefined,
            activity_path:'/setting/authorization/subscription',
            btnText: '授权公众号',
            condition: {...DEFAULT_CONDITION},
            pager: {...DEFAULT_PAGER},
            visible: false,
        }
    }
    componentDidMount() {
        super.componentDidMount()
        this.props.dispatch({
            type: 'attention_prize/subData',
            payload: {},
            callback: (data) => {
                if (data && data[0]) {
                    this.setState({activity_path:'attention_prize/activity', btnText: '创建活动'})
                }
            }
        })
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        const { title, status, end_at,begin_at, creator_id } = condition
        this.getPageData(condition, pager, isSetHistory)
        this.props.form.setFieldsValue({ 
            title,
            status:status?parseInt(status):undefined,
            date:end_at && begin_at ? [moment(begin_at),moment(end_at)] : []
        })
        this.setState({ user_id:creator_id? parseInt(creator_id):undefined})
    }

    edit = (id) => {
        this.setState({
            model: {
                visible: true,
                id: id
            }
        })
    }
    onCancel = () => {
        this.setState({
            model: {
                visible: false,
                id: null
            }
        })
    }

    getPageData = (condition, pager, isSetHistory = true,callback) => {
        if( isSetHistory ){
            this.history(condition, pager)
        }
        this.setState({
            condition:{...condition} ,
            pager: pager,
            loading: true
        })
        let payload = {
            title: condition.title,
            status: condition.status,
            begin_at:condition.end_at,
            end_at: condition.begin_at,
            offset: (pager.current - 1)*pager.pageSize,
            limit: pager.pageSize,
            creator_id:condition.creator_id
        }
        this.props.dispatch({
            type: 'attention_prize/attentionPrizeList',
            payload,
            callback: (data) => {
                this.setState({
                    loading: false
                })
            }
        })

    }
    handleSearch = () => {
        this.props.form.validateFields((err, values) => {
            if(!err){
                const pager = {
                    pageSize : this.state.pager.pageSize,
                    current : DEFAULT_PAGER.current
                }
                let begin_time = '', end_time = ''
                if (values.date && values.date.length !== 0) {
                    begin_time = values.date[0].format('YYYY-MM-DD')
                    end_time = values.date[1].format('YYYY-MM-DD')
                }
                const condition = {
                    ...this.state.condition,
                    ...{    
                        title: values.title,
                        status:  values.status,
                        begin_at: begin_time,
                        end_at: end_time,
                        creator_id:values.creator_id
                    }
                }
                
                this.getPageData(condition ,pager)
            }
        })
        
    }
    userSelectChange = (value) => {
        this.setState({
            user_id: value
        })
    }


    confirm = (id) => {
        this.props.dispatch({
            type: 'attention_prize/deleteAttentionPrize',
            payload: { id },
            callback: () => {
                message.success('删除成功')
                this.handleSearch()
            }
        })
    }
    handleClick = (e,row)=>{
        e.preventDefault()
        this.props.dispatch({
            type: 'attention_prize/recordAttentionPrize',
            payload: { id:row.id },
            callback: (data) => {
                if(data){
                    this.setState({visible:true})
                }
            }
        })
    }
    onCancel = ()=>{
        this.setState({visible:false})
    }
    onReset = () => {
        this.props.form.resetFields()
        this.setState({
            user_id:undefined
        })
        this.handleSearch()
    }
    render() {
        const confirm = Modal.confirm
        const { list, total } = this.props.attention_prize
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '70px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            }
        }
        const activity_status = [{
            value: '',
            text: '全部'
        },
        {
            value: 1,
            text: '未开始'
        }, {
            value: 2,
            text: '进行中'
        }, {
            value: 3,
            text: '已结束'
        }]
        const options = activity_status.map((item, index) => <Option key={index} value={item.value} >{item.text}</Option>)
        const columns = [{
            title: '公众号',
            dataIndex: 'app_name',
            key: 'app_name',
        }, {
            title: '活动名称',
            dataIndex: 'title',
            key: 'title',
        }, {
            title: '活动时间',
            dataIndex: 'begin_at',
            key: 'begin_at',
            render:(text,row)=> {
                return <span>{row.begin_at.substr(0,10)}~{row.end_at.substr(0,10)}</span> 
            }
        }, {
            title: '最后编辑时间',
            dataIndex: 'last_modify_at',
            key: 'last_modify_at'
        }, {
            title: '创建人',
            dataIndex: 'creator',
            key: 'creator'
        }, {
            title: '活动状态',
            dataIndex: 'status',
            key: 'status',
            render: (text,record,index) => {
                let o = activity_status.find && activity_status.find(item => text === item.value)
                return o && o.text
            }
        }, {
            title: '操作',
            dataIndex: 'handle',
            key: 'handle',
            render: (_d, row) => <Fragment>
                {
                    row.status + '' !== '1' ? <span><a onClick={e => this.handleClick(e, row)} className={styles.spilt_icon}>统计</a><Divider type="vertical" /> </span>: null
                }
                <Link to={`/official_accounts/attention_prize/activity?id=${row.id}`} className={styles.spilt_icon}>编辑</Link>
                <Divider type="vertical" />
                <a href="javascript:;" onClick={()=>{ 
                    confirm({
                        title: '确认删除',
                        content: '确认删除该活动？',
                        onOk:()=> {
                            this.confirm(row.id)
                        },
                        onCancel() {
                            
                        }
                    })}}>删除</a>
            </Fragment>
        }]

        const { getFieldDecorator } = this.props.form
        // const { qrcode_type } = this.props
        // const content = <div style={{maxWidth:360}}>
        //     <p>1. 公众号推广主要利用参数二维码将粉丝引流到公众号，应用场景为线上、线下的活动，例如，粉丝卡、海报等；</p>
        //     <p>2. 粉丝扫描参数二维码时，可提供关注公众号、推送相关事件等功能，例如图文、活动等引导性信息；</p>
        // </div>

        // const titleHelp = <Popover content={content} placement="bottomLeft" title="" trigger="hover">
        //     <Icon className="hz-text-primary hz-icon-size-default hz-icon-popover" type='question-circle' />
        // </Popover>
        
        return (
            <Page className={styles.formSearch}>
                <Page.ContentHeader
                    title="关注有礼"
                    // titleHelp={titleHelp}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E5%85%AC%E4%BC%97%E5%8F%B7/%E5%85%AC%E4%BC%97%E5%8F%B7%E6%8E%A8%E5%B9%BF.md"
                    action={
                        <Fragment>
                            <Link to={this.state.activity_path}><Button type="primary" ><Icon type="plus" /> {this.state.btnText} </Button></Link>
                            <span className='hz-page-content-action-description'>通过牛客服发送活动二维码，好友关注公众号后，牛客服绑定的订单数据将与公众号数据互通</span>
                        </Fragment>
                    }
                    
                />
                <Page.ContentAdvSearch hasGutter={false}>
                    <Form layout="horizontal" className="hz-from-search" >
                        <Row>
                            <Col span={8}>
                                <Form.Item label="活动名称：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('title', {})(
                                            <Input placeholder="请输入" maxLength={30} />
                                        )
                                    }
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="活动状态：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('status', {})(
                                            <Select
                                                allowClear
                                                placeholder='请选择'
                                            >
                                                {
                                                    options 
                                                }
                                            </Select>)
                                    }
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item label="活动时间：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('date', {})(
                                            <RangePicker  />
                                        )
                                    }
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <Form.Item label="创建人：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('creator_id', {})(
                                            <UserSelect
                                                userId={this.state.user_id}
                                                onChange={this.userSelectChange}
                                            />
                                        )
                                    }
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={10}>
                                <Form.Item label=" " colon={false} style={{ marginBottom: 0 }} {...formItemLayout}>
                                    <Button onClick={e => { e.preventDefault(); this.handleSearch() }} style={{ marginRight: 16 }} className="hz-btn-width-default" type="primary" htmlType="submit">
                                        <Icon type="search" />
                                        搜索
                                    </Button>
                                    <Button onClick={e => { e.preventDefault(); this.onReset() }} className="hz-btn-width-default" >
                                        重置
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>

                <Page.ContentTable>
                    <Table
                        columns={columns}
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
                    onShowSizeChange={this.handleListPageChangeSize}
                    onChange={this.handleListPageChange}
                />) : null}
                <Statistics 
                    visible={this.state.visible}
                    onCancel={this.onCancel}
                />
            </Page>
        )
    }
}
