/**
 **@Description:
 **@author: 吴明
 */

import React, {Component} from 'react'
import { Select,Form, Row, Col, Input, Button, Table, Pagination, Modal, Icon, Popover } from 'antd'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import Page from 'components/business/Page'
import _ from 'lodash'
import styles from './index.less'

@connect(({base,platform_packet_limit}) => ({
    base,
    platform_packet_limit
}))
@Form.create()

@documentTitleDecorator({
    title:'红包限额'
})
export default class Index extends Component {
    constructor ( props) {
        super(props)
        this.state = {
            //当前页
            offset: 1,
            //每页条数
            limit: 10,   
            //岗位ID
            role_id:'',
            //关键字
            query:'',
            user_id:'',
            index:''
        }
    }

    handleTableChange = (value,key) => {
        this.setState({
            offset:value
        })
        this.getData(value,this.state.limit)
    }

    toSelectchange = (value,pageSize) =>{
        this.setState({
            offset:1,
            limit: pageSize
        })
        this.getData(1,pageSize)
    }
    handleSearch = () =>{
        this.setState({
            offset:1,
            limit: 10
        })
        this.getData(1,10)
    }
    getData = (offset,limit) =>{
        this.props.dispatch({
            type:'platform_packet_limit/accountLimitList',
            payload:{
                offset: (offset-1)*limit,
                limit: limit,
                query:this.state.query,
                role_id:this.state.role_id
            }
        })
    }
    componentDidMount () {
        this.props.dispatch({
            type:'platform_packet_limit/roles',
            payload:{}
        })
        this.getData(1, 10)
    }
    editLimit = (record,index) =>{
        this.setState({
            visible:true,
            user_id:record.id,
            index:index,
        })
        this.props.form.setFieldsValue({
            account_limit:  record.amount ? (record.amount/100).toFixed(2):''
        })
    }
    handleCancel= ()=>{
        this.setState({
            visible:false
        })
    }
    validatorLimit =(rule, value, callback) => {
        if(!(/^\d+(\.\d{1,2})?$/.test(value)) && value){
            callback('请正确输入最多2位小数的账号限额')
        }else if(value>1000000){
            callback('账户限额最大为1000000')
        }else{
            callback()
        }
    }
    changeStation = (value) =>{
        this.setState({
            role_id: value || ''
        })
    }
    handleKeyword = (e) =>{
        this.setState({
            query: e.target.value  || ''
        })
    }
    handleOk = (e)=>{
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.dispatch({
                    type:'platform_packet_limit/editAccountLimit',
                    payload:{
                        amount: values.account_limit ? values.account_limit *100 :'',
                        user_id: this.state.user_id
                    },
                    callback:()=>{
                        const { data } = this.props.platform_packet_limit
                        data[this.state.index].amount = values.account_limit ? values.account_limit *100 :''
                        this.setState({
                            visible:false
                        })
                        this.props.dispatch({
                            type:'platform_packet_limit/setProperty',
                            payload:{
                                data:data
                            },
                        })
                    }
                })
            }
        })
        
    }
    render() {
        const Option = Select.Option
        const columns = [{
            title: '登录账号',
            dataIndex: 'username',
            key: 'username'
        },{
            title: '姓名',
            dataIndex: 'nickname',
            key: 'nickname',
        },{
            title: '岗位',
            dataIndex: 'role',
            key: 'role',
            render:(text,record,index) =>{
                return <span>{text.name}</span>
            }
        },{
            title: '每日限额（元）',
            dataIndex: 'amount',
            key: 'amount',
            render:(text,record,index)=>{
                return  text ? <span>{(text/100).toFixed(2)}</span> : <span>不限</span>
            }
        },{
            title: '备注',
            render:(text,record,index)=>{
                return <a onClick={()=>{this.editLimit(record,index)}}>编辑额度</a>
            }
        }]

        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '80px',
                    textAlign: 'right'
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const firstFormItemLayout = _.merge({},formItemLayout, {
            labelCol:{
                style:{
                    width: '40px'
                }
            }
        })
        const formItemLayoutModel= _.merge({}, formItemLayout, {
            labelCol:{
                style:{
                    textAlign: 'left'
                }
            }
        })
        const { getFieldDecorator } = this.props.form
        const { limit, offset} = this.state
        const {count,loading,stationList,data } = this.props.platform_packet_limit
        return (
            <Page>
                <Page.ContentHeader
                    title="账号限额"
                    titleHelp = {<Popover placement="bottomLeft" content={<div><p>管理员或创建者可对每个账号</p><p>单日发送小红包的金额设置上限</p><p>每日限额包括当天已成功发送的金额</p></div>}>
                        <Icon className="hz-text-primary hz-icon-size-default hz-icon-popover" type="question-circle-o"/>
                    </Popover>}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E5%B0%8F%E7%BA%A2%E5%8C%85.md"
                />
                <Page.ContentAdvSearch multiple={false}>
                    <Form layout="horizontal" className="hz-from-search">
                        <Row>
                            <Col span={8}>
                                <Form.Item label="账号：" {...firstFormItemLayout} >
                                    <Input placeholder='搜索账号/姓名' onChange={(value)=>{this.handleKeyword(value)}}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="岗位：" {...formItemLayout}>
                                    <Select onChange={(value)=>{this.changeStation(value)}} placeholder='选择岗位' allowClear>
                                        {
                                            stationList.map(function (item, index) {
                                                return <Option key={index} value={item.id}>{item.name}</Option>
                                            })
                                        }
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item>
                                    <Button style={{marginLeft: '40px'}} type="primary" htmlType="submit" onClick={this.handleSearch}>
                                        <Icon type="search"/>
                                        搜索
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                <Table
                    pagination={false}
                    columns={columns}
                    loading= {loading}
                    rowKey={(record,index) => index}
                    dataSource={data}/>
                {data.length? (
                    <Pagination
                        className="ant-table-pagination"
                        total={count}
                        current={offset}
                        showQuickJumper={true}
                        showTotal={total => `共${count}条记录`}
                        pageSize={ limit }
                        pageSizeOptions= {['10','20','50','100']}
                        showSizeChanger={true}
                        onShowSizeChange={this.toSelectchange.bind(this)}
                        onChange={this.handleTableChange.bind(this)}
                    />
                ) : (
                    ''
                )}
                <Modal
                    title="编辑额度"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    okText="确定"
                    cancelText="取消"
                    className={styles.layoutModel}
                    onCancel={this.handleCancel}
                >
                    <Form layout="horizontal" className="hz-from-search">
                        <Row>
                            <Col className={styles.limitTip}>
                                不输入金额或输入0元表示不限制额度
                            </Col>
                            <Col>
                                <Form.Item label="设置额度：" {...formItemLayoutModel}>
                                    {getFieldDecorator('account_limit', {
                                        rules: [
                                            { validator:this.validatorLimit}
                                        ],
                                    })(
                                        <Input  placeholder="请输入0.00-1,000,000.00元"/>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </Page>
        )
    }
}
