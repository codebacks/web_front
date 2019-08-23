'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [wuming]
 * 创建日期: 16/12/27
 */
import React from 'react'
import {Modal, Form,Row,Col,Input} from 'antd'
import {connect} from 'dva'
@connect(({base,mall_customer}) => ({
    base,
    mall_customer
}))
@Form.create()
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            name:'',
            id:'',
            index:''
        }
    }
    componentDidMount() {
        this.props.form.setFieldsValue({
            userName:this.props.name
        })
        this.setState({
            id:this.props.id,
            index:this.props.index,
            name:this.props.name
        })
    }
    changeName= (event) =>{
        this.setState({
            name:event.target.value || ''
        })
    }
    cancelEdit = () => {
        this.props.onCancel()
    }
    //确认编辑
    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if(!err){
                const { dispatch } = this.props
                dispatch({
                    type: 'mall_customer/editName',
                    payload: {
                        id: this.state.id,
                        name:this.state.name
                    },
                    callback:() =>{
                        const {data}  = this.props.mall_customer
                        const { index ,name } = this.state
                        data[index].name= name
                        dispatch({
                            type: 'mall_customer/setProperty',
                            payload:{
                                data:data
                            }
                        })
                        this.props.onCancel()
                    }
                })
            }
        })
    }
    render() {
        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14}
        }
        const FormItem = Form.Item
        const {getFieldDecorator} = this.props.form
        return (<Modal
            title="编辑"
            visible={this.props.visible}
            onOk={this.handleSubmit}
            onCancel={this.cancelEdit}
            okText="确认"
            cancelText="取消"
        >
            <Form>
                <Row>
                    <Col>
                        <FormItem label="姓名：" {...formItemLayout}>
                            {getFieldDecorator('userName', {
                                rules: [{ required: true, message: '姓名不能为空' },{max:20,message:'最多输入20个字符'}],
                            })(
                                <Input placeholder="请输入姓名"   onChange={(value)=>{this.changeName(value)}}  />
                            )}   
                        </FormItem>
                    </Col>
                </Row>
            </Form>
        </Modal>)
    }
}
