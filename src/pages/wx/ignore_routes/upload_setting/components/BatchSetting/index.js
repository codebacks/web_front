import React, {Component} from 'react'
import {connect} from "dva/index"
import {Modal, Form, Checkbox, Alert, message} from 'antd'
import styles from './index.scss'

const FormItem = Form.Item

@connect(({loading, wx_upload_setting}) => ({
    wx_upload_setting,
    setLoading: loading.effects['wx_upload_setting/batchSet'],
}))
@Form.create()
export default class BatchSetting extends Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    componentDidMount() {

    }

    handleSubmit = (e) => {
        if (this.props.setLoading) {
            return
        }
        e.preventDefault()
        this.props.form.validateFields({force: true},(err, values) => {
            if (!err) {
                const payload = {
                    body: this.getBody(values)
                }
                this.batchSet(payload)
            }
        })
    }

    getBody = (values) => {
        return {
            uins: this.props.uins,
            private_chat: values.private_chat ? 1 : 0,
            room_chat: values.room_chat ? 1 : 0,
        }
    }

    batchSet = (payload) => {
        this.props.dispatch({
            type: 'wx_upload_setting/batchSet',
            payload: payload,
            callback: () => {
                message.success('保存成功')
                this.props.onOk()
            }
        })
    }

    handleCancel = () =>{
        this.props.onCancel()
    }

    render() {
        const {visible, uins, setLoading} = this.props
        const {getFieldDecorator} = this.props.form

        return (
            <Modal
                centered={true}
                maskClosable={false}
                destroyOnClose={true}
                visible={visible}
                title="图片自动上传"
                okText="保存"
                width={600}
                confirmLoading={setLoading}
                onOk={this.handleSubmit}
                onCancel={this.handleCancel}
            >
                <Form>
                    <p>已选微信号：<strong>{uins.length}</strong></p>
                    <p className={styles.describe}>开启自动上传，在收到图片时自动上传；关闭自动上传则在点击查看大图时上传</p>
                    <FormItem>
                        {getFieldDecorator('private_chat', {
                            rules: [],
                            valuePropName: 'checked',
                        })(
                            <Checkbox className={styles.checkbox}>私聊图片自动上传</Checkbox>
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('room_chat', {
                            rules: [],
                            valuePropName: 'checked',
                        })(
                            <Checkbox className={styles.checkbox}>群聊图片自动上传</Checkbox>
                        )}
                    </FormItem>
                    <Alert message="开启自动上传功能，将消耗更多流量" type="warning" showIcon/>
                </Form>
            </Modal>
        )
    }
}
