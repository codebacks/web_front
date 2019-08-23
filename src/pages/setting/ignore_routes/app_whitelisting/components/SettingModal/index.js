import React, {PureComponent} from 'react'
import {connect} from "dva/index"
import {Modal, Form, Radio, message} from 'antd'
import {statusMap} from '../../config'
import styles from './index.less'

const FormItem = Form.Item
const RadioGroup = Radio.Group

@connect(({loading, setting_app_whitelisting}) => ({
    setting_app_whitelisting,
    setLoading: loading.effects['setting_app_whitelisting/operate']
}))
@Form.create()
export default class SettingModal extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
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
                const {record} = this.props
                const status = values.status

                if(record.status === status){
                    message.warning('没有变化')
                    return
                }

                const payload = {
                    appId: record.app_id,
                    status: status
                }
                this.operate(payload)
            }
        })
    }

    operate = (payload) => {
        this.props.dispatch({
            type: 'setting_app_whitelisting/operate',
            payload: payload,
            callback: () => {
                message.success('设置成功')
                this.props.onOk()
            }
        })
    }

    handleCancel = () =>{
        this.props.onCancel()
    }

    getRadios = () => {
        let option = []
        statusMap.forEach((value, key) => {
            option.push(<Radio key={key} value={key}>{value}</Radio>)
        })
        return option
    }

    render() {
        const {visible, setLoading} = this.props
        const {getFieldDecorator} = this.props.form
        const {record} = this.props

        return (
            <Modal
                centered={true}
                maskClosable={false}
                destroyOnClose={true}
                visible={visible}
                title="设置"
                confirmLoading={setLoading}
                okText="保存"
                onOk={this.handleSubmit}
                onCancel={this.handleCancel}
            >
                <Form>
                    <p className={styles.appName}>{record && record.app_name}</p>
                    <FormItem label={'设置应用权限'}>
                        {getFieldDecorator('status', {
                            rules: [],
                            initialValue: record && record.status,
                        })(
                            <RadioGroup>
                                {this.getRadios()}
                            </RadioGroup>
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
