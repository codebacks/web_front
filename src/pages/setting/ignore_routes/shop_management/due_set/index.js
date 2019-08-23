import React, { Component } from 'react'
import { Select, Input, Modal, Form, message, Row, Col } from 'antd'
// import { SHOP_TYPE, SHOP_TYPE_DATA } from 'setting/services/shops'
import { validatorByIsMobile } from 'utils/validator'
import styles from '../index.less'
import { connect } from 'dva'
const Option = Select.Option
const FormItem = Form.Item

const formItemLayout = {
    labelCol: {
        xs: { span: 4 },
        sm: { span: 4 },
    },
    wrapperCol: {
        xs: { span: 20 },
        sm: { span: 20 },
    },
}
@connect(({ setting_shopManagement, base }) => ({
    setting_shopManagement,
    base,
}))
@Form.create()
export default class DueSet extends Component {
    ways = [
        {
            key: 1,
            value: '短信提醒'
        }
    ]
    dateMap = [1, 2, 3, 4, 5, 6, 7]
    flag = true;
    componentDidUpdate(prevProps, prevState) {
        if (this.flag) {
            const { dueRemind } = this.props.setting_shopManagement
            let keys = Object.keys(dueRemind)
            if (keys.length > 0 && dueRemind !== prevProps.setting_shopManagement.dueRemind) {
                this.flag = false
                this.props.form.setFieldsValue({
                    before_expired_days: dueRemind.before_expired_days,
                    reminder_type: dueRemind.reminder_type,
                    receive_mobile: dueRemind.receive_mobile
                })
            }
        }
    }
    onCancel = () => {
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload: { shopDueSetVisible: false }
        })
        this.flag = true
        this.props.form.resetFields()
    }
    onOk = () => {
        this.props.form.validateFields((errors, values) => {
            if (!errors) {
                const { dueRemind } = this.props.setting_shopManagement
                const keys = Object.keys(dueRemind)
                const type = keys.length === 0 ? 'setting_shopManagement/postDueRemind' : 'setting_shopManagement/putDueRemind'
                this.props.dispatch({
                    type,
                    payload: {
                        before_expired_days: values.before_expired_days,
                        reminder_type: values.reminder_type,
                        receive_mobile: values.receive_mobile
                    },
                    callback: () => {
                        this.onCancel()
                        message.success('店铺授权过期提醒设置操作成功')
                    }
                })
            }
        })
    }
    render() {
        const { shopDueSetVisible } = this.props.setting_shopManagement
        const { getFieldDecorator } = this.props.form
        return (
            <Modal
                title='店铺授权过期提醒设置'
                visible={shopDueSetVisible}
                okText="保存"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                width={600} >
                <Form>
                    <Row>
                        <Col span={22}>
                            <FormItem label="授权到期前"  {...formItemLayout}>
                                {getFieldDecorator('before_expired_days', {
                                    initialValue: 7
                                })(
                                    <Select>
                                        {
                                            this.dateMap.map((item) => {
                                                return <Option value={item} key={item}>{item}</Option>
                                            })
                                        }
                                    </Select>)
                                }
                            </FormItem>
                        </Col>
                        <Col span={1}>
                            <span style={{ display: 'inline-block', marginLeft: 8, marginTop: 10 }}>天</span>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={22}>
                            <FormItem label="提醒方式"  {...formItemLayout}>
                                {getFieldDecorator('reminder_type', {
                                    initialValue: 1
                                })(
                                    <Select>
                                        {
                                            this.ways.map((item) => {
                                                return <Option value={item.key} key={item.key}>{item.value}</Option>
                                            })
                                        }
                                    </Select>)
                                }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={22}>
                            <FormItem
                                {...formItemLayout}
                                label="接受手机号"
                                required={true}
                            >
                                {getFieldDecorator('receive_mobile', {
                                    rules: [
                                        { required: true, message: '请填写手机号码' },
                                        { validator: validatorByIsMobile }
                                    ]
                                })(
                                    <Input
                                        placeholder="请输入手机号码"
                                    />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        )
    }
}
