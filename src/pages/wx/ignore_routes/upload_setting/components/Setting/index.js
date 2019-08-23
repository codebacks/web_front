import React, {Component} from 'react'
import {connect} from "dva/index"
import {Modal, Form, Checkbox, message} from 'antd'
import styles from './index.scss'

const FormItem = Form.Item

@connect(({loading, wx_upload_setting}) => ({
    wx_upload_setting,
    setLoading: loading.effects['wx_upload_setting/batchSet'],
}))
@Form.create()
export default class Setting extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.visible && this.props.visible !== prevProps.visible) {
            const {type, checked} = this.props
            this.props.form.setFieldsValue({
                [type]: checked,
            })
        }
    }

    handleSubmit = (e) => {
        if (this.props.setLoading) {
            return
        }
        e.preventDefault()
        this.props.form.validateFields({force: true},(err, values) => {
            const {type, checked} = this.props
            if (checked === values[type]) {
                this.tip(type, checked)
                this.props.onCancel()
                return
            }
            if (!err) {
                const payload = {
                    body: this.getBody(values)
                }
                this.batchSet(payload, values)
            }
        })
    }

    getBody = (values) => {
        const {type, record} = this.props
        const uploadSetting = record.auto_upload_img
        return {
            uins: [record.uin],
            ...{
                ...uploadSetting,
                [type]: values[type] ? 1 : 0,
            }
        }
    }

    batchSet = (payload, values) => {
        this.props.dispatch({
            type: 'wx_upload_setting/batchSet',
            payload: payload,
            callback: () => {
                const {type} = this.props
                const checked = values[type]
                this.tip(type, checked)
                this.props.onOk(checked)
            }
        })
    }

    getTypeText = (type) => {
        if (type === 'private_chat') {
            return '私聊图片自动上传'
        }
        return '群聊图片自动上传'
    }

    getCheckedText = (checked) => {
        return checked ? '启用' : '禁用'
    }

    tip = (type, checked) => {
        const successTip = `${this.getTypeText(type)}${this.getCheckedText(checked)}成功`
        if (checked) {
            message.success(successTip)
        } else {
            message.warning(successTip)
        }
    }

    handleCancel = () =>{
        this.props.onCancel()
    }

    render() {
        const {visible, setLoading, type} = this.props
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
                    <p className={styles.describe}>开启自动上传，在收到图片时自动上传；关闭自动上传则在点击查看大图时上传</p>
                    <FormItem>
                        {getFieldDecorator(`${type || 'private_chat'}`, {
                            rules: [],
                            valuePropName: 'checked',
                        })(
                            <Checkbox className={styles.checkbox}>
                                {this.getTypeText(type)}
                            </Checkbox>
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
