/**
 **@Description:
 **@author: 吴明
 */

import React, {Component} from 'react'
import {  Divider,Form, Button, message,Table,Select, Pagination, Modal,Row,Input,Col } from 'antd'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import Page, { ContentDescription, LimitTip } from '@/components/business/Page'
import styles from './index.less'

@connect(({base,platform_packet_model}) => ({
    base,
    platform_packet_model
}))
@Form.create()



@documentTitleDecorator({
    title:'红包模板'
})
export default class Index extends Component {
    constructor ( props) {
        super(props)
        this.state = {
            //当前页
            offset: 1,
            //每页条数
            limit: 10,
            visible:false,
            modelMoney:'',
            status:'1'
        }
    }
    handleCreateModel= () =>{
        const {count} =this.props.platform_packet_model
        if(count<100){
            this.setState({
                visible:true,
                status:'1'
            })
            this.props.form.setFieldsValue({
                redpacket_money:  ''
            })
        }else{
            message.warning('已达到创建红包模板上限')
        }
    }
    handleOk = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.dispatch({
                    type:'platform_packet_model/createModel',
                    payload:{
                        amount:values.redpacket_money*100,
                        status:this.state.status
                    },
                    callback:()=>{
                        message.success('创建成功')
                        this.props.dispatch({
                            type:'platform_packet_model/modelList',
                            payload:{
                                offset:0,
                                limit:this.state.limit
                            },
                            callback:()=>{
                                this.setState({
                                    visible:false
                                })
                            }
                        })
                    }
                })
            }
        })
    }

    componentDidMount(){
        this.getData(1,10)
    }
    getData = (offset,limit) =>{
        this.props.dispatch({
            type:'platform_packet_model/modelList',
            payload:{
                offset: (offset-1)*limit,
                limit:limit
            }
        })
    }
    validateMoney = (rule, value, callback) => {
        if (value && ( value>499.00 || value<1 )){
            callback('请输入模板红包金额（1-499.00）')
        }else if(!(/^\d+(\.\d{1,2})?$/.test(value)) && value){
            callback('请正确输入最多2位小数的红包金额')
        } 
        callback()
    }
    handleCancel= ()=>{
        this.setState({
            visible:false
        })
    }
    changeModelStatus= (value)=>{
        this.setState({
            status:value
        })
    }
    handleOperator = (record,index)=>{
        this.props.dispatch({
            type:'platform_packet_model/editModel',
            payload:{
                status:record.status===1 ? 2:1,
                id:record.id
            },
            callback:()=>{
                const { data } = this.props.platform_packet_model
                data[index].status = record.status===1 ? 2:1
                this.props.dispatch({
                    type:'platform_packet_model/setProperty',
                    payload:{
                        data:data
                    }
                })
                message.success('操作成功')
            }
        })
    }
    handlePageChange = (value) => {
        this.setState({
            offset:value
        })
        this.getData(value,this.state.limit)
    }
    handlePageSizeChange= (value,size) => {
        this.setState({
            offset:1,
            limit:size
        })
        this.getData(1,size)
    }
    handleDeleteModel = (record,index)=>{
        this.props.dispatch({
            type:'platform_packet_model/deleteModel',
            payload:{
                id:record.id,
            },
            callback:()=>{
                const { data,count } = this.props.platform_packet_model
                data.splice(index,1)
                this.props.dispatch({
                    type:'platform_packet_model/setProperty',
                    payload:{
                        data:data,
                        count:count - 1
                    }
                })
                message.success('删除成功')
            }
        })
    }
    render() {
        const confirm = Modal.confirm
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
        const columns = [{
            title: '红包金额(元)',
            dataIndex: 'amount',
            key: 'amount',
            render:(text,record,index)=>{
                return <span>{(text/100).toFixed(2)}</span>
            }
        },{
            title: '使用状态',
            dataIndex: 'status',
            key: 'status',
            render:(text,record,index)=>{
                return text===1? <span className={styles.circleBlue}>启用</span> :<span className={styles.circleGray}>禁用</span>
            }
        },{
            title: '发送次数',
            dataIndex: 'send_count',
            key: 'send_count'
        },{
            title: '成功次数',
            dataIndex: 'success_count',
            key: 'success_count'
        },{
            title: '创建人',
            dataIndex: 'operator',
            key: 'operator'
        },{
            title: '操作',
            render:(text,record,index)=>{
                return  record.status ===1?
                    <span>
                        <a href="javascript:;" onClick={()=>{this.handleOperator(record,index)}}>禁用</a>
                        <Divider type="vertical" />
                        <a href="javascript:;" onClick={()=>{ 
                            confirm({
                                title: '确认删除',
                                content: '是否确定删除该条红包模版？',
                                onOk:()=> {
                                    this.handleDeleteModel(record,index)
                                },
                                onCancel() {
                                    
                                }
                            })}}>删除</a>
                    </span>:
                    <span>
                        <a href="javascript:;" onClick={()=>{this.handleOperator(record,index)}}>启用</a>
                        <Divider type="vertical" />
                        <a href="javascript:;" onClick={()=>{ 
                            confirm({
                                title: '确认删除',
                                content: '是否确定删除该条红包模版？',
                                onOk:()=> {
                                    this.handleDeleteModel(record,index)
                                },
                                onCancel() {  
                                }
                            })}}>删除</a>
                    </span>
            }
        }]
        const Option = Select.Option
        const { getFieldDecorator } = this.props.form
        const { limit, offset,status} = this.state
        const { loading, data, count } = this.props.platform_packet_model
        const action= <div>
            <Button type="primary" icon="plus"  onClick={()=>{this.handleCreateModel()}} className={styles.open}>创建模板红包</Button>
            <LimitTip className='hz-margin-base-left' max={100} current={count}>
                可创建<LimitTip.Max/>个模板（<LimitTip.Step />）
            </LimitTip>
        </div>
        return (
            <Page className={styles.formSearch}>
                <Page.ContentHeader
                    title="红包模板"
                    action={action}
                    contentDescription={<ContentDescription text="创建红包模板后，即可在牛客服处直接发送模板红包给好友" />}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E5%B0%8F%E7%BA%A2%E5%8C%85.md"
                />

                <Table
                    pagination={false}
                    columns={columns}
                    loading= {loading}
                    rowKey={(record,index) => index}
                    dataSource={data}/>
                {count > 0 ? (
                    <Pagination
                        className="ant-table-pagination"
                        total={count}
                        current={offset}
                        showQuickJumper={true}
                        showTotal={total => `共${count}条记录`}
                        pageSize={ limit }
                        pageSizeOptions= {['10','20','50','100']}
                        showSizeChanger={true}
                        onShowSizeChange={this.handlePageSizeChange}
                        onChange={this.handlePageChange}
                    />
                ) : (
                    ''
                )}
                <Modal
                    title="创建模板红包"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    okText="确定"
                    cancelText="取消"
                    onCancel={this.handleCancel}
                >
                    <Form layout="horizontal" className="hz-from-search">
                        <Row>
                            <Col>
                                <Form.Item label="红包金额：" {...formItemLayout}>
                                    {getFieldDecorator('redpacket_money', {
                                        rules: [
                                            { required: true, message: '请输入1.00-499.00元'},
                                            { validator: this.validateMoney}
                                        ],
                                    })(
                                        <Input   placeholder="请输入1.00-499.00元"/>
                                    )} 
                                </Form.Item>
                            </Col>
                            <Col>
                                <Form.Item label="红包状态：" {...formItemLayout}>
                                    <Select value={status} onChange={(value)=>{this.changeModelStatus(value)}}>
                                        <Option value="1">启用</Option>
                                        <Option value="2">禁用</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </Page>
        )
    }
}
