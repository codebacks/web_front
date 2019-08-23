import React from 'react'
import { parse } from 'qs'
import { Form, Radio, Switch, Input, Button, Row, Col, Modal } from 'antd'
import router from 'umi/router'

const RadioGroup = Radio.Group

export default class FormView extends React.PureComponent {

    state = {
        id: null,
        isEdit: false
    }
    componentDidMount(){
        const { id } = this.props.match.params
        if(id){
            this.setState({
                id,
                isEdit: true
            })
        }
    }

    handleSubmit = (e) => {
        e.preventDefault()

        this.props.form.validateFields((err, values) => {
            if (!err) {

                var user = parse(values)
                user = {...user, status: user.status ? 2: 1}
                
                if(this.state.isEdit){
                    this.updateUser(user)
                }else{
                    this.createUser(user)
                }
            }
        })
    }

    createUser(user){
        this.props.dispatch({
            type: 'demo_user_index/create',
            payload: {
                user: user
            },
            callback: () => {
                Modal.success({
                    title: '系统提示',
                    content: '添加用户成功',
                    onOk(){
                        router.push('/demo/user')
                    }
                })
            }
        })
    }

    updateUser(user){
        this.props.dispatch({
            type: 'demo_user_index/update',
            payload: {
                user: {...user, id: this.state.id}
            },
            callback: () => {
                Modal.success({
                    title: '系统提示',
                    content: '修改用户成功',
                    onOk(){
                        router.push('/demo/user')
                    }
                })
            }
        })
    }

    cancelHandler(){
        router.push('/demo/user')
    }

    validatorAccount = (rule, value, callback) => {
        const regex = /^[a-zA-z]{1}([A-Za-z1-9_]){4,14}$/
        const isMatch = regex.test(value)
        if(!isMatch){
            callback(rule.message)
        }else{
            callback()
        }
    }
    render() {
        const { 
            getFieldDecorator
        } = this.props.form

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 3 },
                style : { width: '80px'}
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        }

        return (
            <Form onSubmit={this.handleSubmit} className="hz-from-edit">
                <Form.Item label="名称"  {...formItemLayout}>
                    {getFieldDecorator('name', {
                        rules: [{required: true, message: '请输入名称'}],
                    })(
                        <Input placeholder="请输入用户名称（1-6个汉字）" />
                    )}
                </Form.Item>
                <Form.Item label="登录账号"  {...formItemLayout}>
                    {getFieldDecorator('account', {
                        rules: [
                            { required: true, message: '请输入名称'},
                            { validator: this.validatorAccount, message: '5-15个英文数字_组成的, 只能英文字母开始' }
                        ],
                    })(
                        <Input placeholder="请输入用户账号（15个以内的英文数字_组成, 只能英文字母开始）" />
                    )}
                </Form.Item>
                <Form.Item label="性别"  {...formItemLayout}>
                    {getFieldDecorator('gender', {
                        rules: [{required: true, message: '请选择性别'}],
                    })(
                        <RadioGroup>
                            <Radio value={1}>男</Radio>
                            <Radio value={2}>女</Radio>
                        </RadioGroup>
                    )}
                </Form.Item>
                <Form.Item label="状态"  {...formItemLayout}>
                    {getFieldDecorator('status', {
                        initialValue: false,
                        valuePropName: 'checked' 
                    })(
                        <Switch />
                    )} 是否锁定
                </Form.Item>
                <Form.Item label="名称"  {...formItemLayout}>
                    {getFieldDecorator('phoneNumber', {
                        rules: [{required: true, message: '请输入手机号'}],
                    })(
                        <Input placeholder="请输入手机号（11位数字）" />
                    )}
                </Form.Item>

                <Row className="hz-margin-base-top-bottom">
                    <Col span={3} style={{width: '80px'}}></Col>
                    <Col span={16}>
                        <Button type="primary" htmlType="submit">保存</Button>
                        <Button className="hz-margin-base-left" onClick={this.cancelHandler}>取消</Button>
                    </Col>
                </Row>
            </Form>
        )
    }
}