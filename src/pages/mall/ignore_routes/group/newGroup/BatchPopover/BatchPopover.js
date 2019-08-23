import { PureComponent } from 'react'
import { Button, Form, Input } from 'antd'

@Form.create()
export default class extends PureComponent{

    // 计算最小原价值
    lowestPrice = (value) => {
        if (value.length) {
            let lowest = value[0].price
            for (let i = 0, leng = value.length; i < leng; i++) {
                if (value[i].price < lowest) {
                    lowest = value[i].price
                }
            }
            return lowest
        }
    }

    onClickSave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const { form, onSaveBatch } = this.props
        form.validateFields((error,{batchPriceInput}) => {
            if (error) return
            onSaveBatch(batchPriceInput)
        })
    }

    onCancel = () => {
        this.props.onCancel()
        this.props.form.setFieldsValue({'batchPriceInput': ''})
    }
    render(){
        const popoverLayout = {
            labelCol: {
                span: 8,
                style: {
                    width: '80px',
                },
            },
            wrapperCol: {
                span: 16,
                style: {
                    width: '180px'
                }
            },
        }

        const { getFieldDecorator } = this.props.form
        return (
            <Form onSubmit={this.onClickSave}>
                <Form.Item label='拼团价格' {...popoverLayout}>
                    {getFieldDecorator('batchPriceInput',{
                        rules: [{
                            required: true,
                            message: '请输入拼团价格'
                        },{
                            validator: (rules, value, callback) => {
                                if (value && !/^[0-9]+(.[0-9]{1,2})?$/.test(value)) {
                                    callback('价格必须是数字且最多保留两位小数')
                                } else if (value && value <= 0) {
                                    callback('价格不能为0')
                                }
                                callback()
                            }
                        }]
                    })(
                        <Input />
                    )}
                </Form.Item>
                <div style={{textAlign:'right',paddingRight: '14px'}}>
                    <Button type='default' style={{marginLeft: '80px'}} onClick={this.onCancel}>取消</Button>
                    <Button type='primary' style={{marginLeft: '16px'}} htmlType='submit'>确定</Button>
                </div>
                
            </Form>
        )
    }
}