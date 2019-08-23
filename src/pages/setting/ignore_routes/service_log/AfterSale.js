
import React from 'react'
import {Modal,Form,Row,Col,Input,InputNumber,Checkbox,Table,message} from  'antd'
import { connect } from 'dva'
import  styles  from './index.less'
const { TextArea } = Input
const FormItem = Form.Item

@Form.create({})
@connect(({ base, setting_service_log }) => ({
    base, setting_service_log
}))

export default class  AfterSale extends React.Component{
    constructor(props){
        super(props)
        this.state={
            good_name:"",
            order_item_no:'',
            max_num:0,
            remark:0,
            phone:[]
        }
    }
    componentDidMount (){
        const { data  } = this.props.setting_service_log 
        const { index } = this.props
        if(data.length>0){
            let phone= data[index].order_item.filter(item=>item.type === 2).map(value=>{
                return {
                    ...value,
                    num:1,
                    checked:true
                }
            })
            if(phone.length>0){
                this.setState({phone})
            }
        }    
    }
    handleOk =()=>{
        const { phone } = this.state
        this.props.form.validateFields((err, values) => { 
            if(!err){
                const item = phone.filter(item=>item.checked).map(value=>{
                    return {
                        good_name:value.name,
                        count:value.num,
                        order_item_no:value.no
                    }
                })
                this.props.dispatch({
                    type:'setting_service_log/afterSale',
                    payload:{
                        ...values,
                        item:item
                    },
                    callback:()=>{
                        this.props.onClose(true)
                    }
                })
            }
        })
    }
    handleCancel = () =>{
        this.props.onClose && this.props.onClose()
    }
    compareToDescription= (rule, value, callback) => {
        if (value!== '' && !(/\S+/g.test(value))) {
            callback('请简单描述您的问题')
        }
        callback()

    }
    handleChangeRemark=(e)=>{
        this.setState({
            remark:e.target.value.length
        })
    }
    handleChoosePhone =(id)=>{
        const { phone } = this.state
        let checkedPhone =  phone.filter(item=>item.checked)
        if(checkedPhone.length===1 &&checkedPhone[0].id === id ){
            message.error('必须选择一款手机进行售后服务')
            return false
        }


        let p =  phone.map(item=>{
            return {
                ...item,
                checked:item.id ===id? !item.checked:item.checked
            }
        })
        this.setState({phone:p})
    }
    handleChangePhoneNum =(value,id,max_count)=>{
        if(isNaN(value) || !value){
            value =1
        }
        if(value>max_count){
            message.error('申请售后数量已超过购买数量')
        }
        const { phone } = this.state
        let p =  phone.map(item=>{
            return {
                ...item,
                num:item.id ===id? value:item.num
            }
        })
        this.setState({phone:p})
    }
    render(){
        const {getFieldDecorator} = this.props.form
        const {remark,phone} = this.state
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
        const columns=[{
            title:'手机型号',
            key:'name',
            dataIndex:'name',
            render:(text,record)=>{
                return <Checkbox
                    checked={record.checked}
                    onChange={()=>{this.handleChoosePhone(record.id)}}
                >
                    {text}
                </Checkbox>
            }
        },{
            title:'售后手机数量',
            key:'num',
            dataIndex:'num',
            render:(text, record)=> {
                return record.checked? <InputNumber 
                    min={1} 
                    max={record.count} 
                    value={text} 
                    parser={value => value.replace('.', '')}
                    onChange={(value)=>{this.handleChangePhoneNum(value,record.id,record.count)}}/>:'--'
            }
        }]
        return(
            <Modal
                title="申请售后"
                visible={this.props.visible}
                onOk={this.handleOk}
                okText="确定"
                cancelText="取消"
                className={styles.afterSaleModel}
                onCancel={this.handleCancel}
            >
                <Table  style={{marginBottom:16}}  columns={columns} dataSource={phone}  rowKey={(record, index) => index} pagination={false}    loading={false}/>
                <Form layout="horizontal" className="hz-from-search">
                    <Row >
                        <Col>
                            <FormItem label="问题描述：" {...formItemLayout} className={styles.description}>
                                {getFieldDecorator('description', {
                                    rules: [
                                        { required: true, message: '请简单描述您的问题'},
                                        {
                                            validator: this.compareToDescription,
                                        }
                                    ],
                                })(
                                    <TextArea rows={6}  onChange={(e)=>{this.handleChangeRemark(e)}}  maxLength={200} placeholder='请简单描述您的问题'/>
                                )}
                                <div className={styles.descLength}>{remark}/200</div>
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        ) 
    }
}