import React from 'react'
import { Modal,Input ,Form} from 'antd'

@Form.create()
export default class  extends React.Component {
    onOk = () => {
        this.props.form.validateFields((err,values) =>{
            if(!err){
                this.props.onOk && this.props.onOk(values.phone)
                this.onCancel()
            }
        })
    }

    onCancel = () => {
        this.props.onCancel && this.props.onCancel()
    }
    componentDidUpdate(prevProps){
        if(this.props.visible &&  this.props.phone && !prevProps.visible){
            this.props.form.setFieldsValue({
                phone:this.props.phone
            })
        }
    }
    render() {
        const { getFieldDecorator } = this.props.form

        const formItemLayout = {
            labelCol: {span: 5},
            wrapperCol: {span: 18},
        }
        return <Modal
            title="电话号码"
            destroyOnClose={true}
            visible={this.props.visible}
            onOk={this.onOk}
            onCancel={this.onCancel}
            okText="确认"
            cancelText="取消"
        >
            <Form >
                <Form.Item label="电话号码：" {...formItemLayout}>
                    {getFieldDecorator('phone', {
                        rules: [
                            { required: true, message: '请填写电话号码' },
                            { pattern: /^(?:\d{3,4}-\d{7,8})|(?:1[\d]{10})$/, message: '请填写正确的电话号码' }
                        ]
                    })(
                        <Input maxLength={13} placeholder='请输入电话号码' />
                    )}
                </Form.Item>
            </Form>

        </Modal>
    }
}