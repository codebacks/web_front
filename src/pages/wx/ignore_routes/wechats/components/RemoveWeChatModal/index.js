import React, {Component} from 'react'
import {Modal, Form, Input, Icon, Button, message} from 'antd'
import {connect} from 'dva'
import _ from 'lodash'
import styles from './index.less'

const FormItem = Form.Item

@Form.create()
@connect(({base, wx_wechats, loading}) => ({
    base,
    wx_wechats,
    submitting: loading.effects['wx_wechats/remove']
}))
export default class RemoveWeChatModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isDisabled: false,
            btnDesc: '获取验证码'
        }
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    getSms = (e) =>{
        e.preventDefault()
        this.props.form.validateFields(['mobile'],(err, values) => {
            if(!err){
                this.props.dispatch({
                    type:'wx_wechats/sentSms',
                    payload:{
                        ...values,
                        type: 'delete_wechat',
                    },
                    callback:()=>{
                        let time = 60
                        this.setState({
                            isDisabled:true
                        })
                        this.timer = setInterval( () => {
                            time--
                            this.setState({
                                btnDesc:`重新获取(${time}S)`
                            })
                            if(time <= 0){
                                clearInterval(this.timer)
                                this.setState({
                                    isDisabled:false,
                                    btnDesc:'获取验证码'
                                })
                            }
                        },1000)
                    }
                })
            }
        })
    }

    handleCancel = () => {
        this.props.onCancel()
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {record} = this.props
                this.props.dispatch({
                    type: 'wx_wechats/remove',
                    payload: {
                        uin: record.uin,
                        body: {
                            sms_code: values.sms_code
                        }
                    },
                    callback: () => {
                        message.success('移除成功')
                        this.props.onOk()
                    },
                })
            }
        })
    }

    render() {
        const {base, form, submitting, visible} = this.props
        const {getFieldDecorator, getFieldValue} = form
        const {isDisabled, btnDesc} = this.state
        const initMobile = _.get(base, 'initData.user.username')

        return (
            <Modal
                centered
                visible={visible}
                title={'移除微信号'}
                destroyOnClose={true}
                maskClosable={false}
                confirmLoading={submitting}
                okButtonProps={{disabled: !getFieldValue('sms_code')}}
                onOk={this.handleSubmit}
                onCancel={this.handleCancel}
            >
                <p className={styles.tip}>输入短信验证码，移除微信号</p>
                <Form className={styles.form}>
                    <FormItem>
                        {getFieldDecorator(
                            'mobile', {
                                initialValue: initMobile,
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入手机号码',
                                    },
                                    {
                                        pattern: /^1\d{10}$/, message: '请填写正确11位手机号!',
                                    },
                                ],
                            },
                        )(
                            <Input
                                type="text"
                                size="large"
                                maxLength={11}
                                placeholder="请输入手机号码"
                                disabled={true}
                                prefix={<Icon type="mobile" className={styles.prefixIcon}/>}
                            />,
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('sms_code', {
                            rules: [
                                {
                                    required: true, message: '请输入短信验证码',
                                }
                            ],
                        })(
                            <Input
                                size="large"
                                maxLength={4}
                                autoComplete="off"
                                className={styles.authCode }
                                placeholder="请输入短信验证码"
                                prefix={<Icon type="safety" className={styles.prefixIcon}/>}
                                suffix={<Button disabled={isDisabled} className={isDisabled? '' : styles.code} onClick = {this.getSms}>{btnDesc}</Button>}
                            />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
