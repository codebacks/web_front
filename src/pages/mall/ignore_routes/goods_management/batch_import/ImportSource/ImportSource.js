/*
 * @Author: zhousong 
 * @Date: 2019-2-25
 * @Discription: 商品批量导入步骤一组件
 */

import { PureComponent, Fragment } from 'react'
import { Form, Select, Button } from 'antd'

const Option = Select.Option

@Form.create()
export default class extends PureComponent {
    // 页面事件处理
    handleSubmit = (e) => {
        e.preventDefault()
        
        this.props.form.validateFields((error, value) => {
            if (error) return
            this.props.nextStep(value.shopSelection, value.goodsSelection)
        })
    }

    render () {
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: {
                span: 8,
                style: {
                    width: '80px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
                style: {
                    width: '320px'
                },
            },
        }
        const { platformShops, shopId, type } = this.props

        return (
            <Fragment>
                <Form onSubmit={this.handleSubmit} style={{marginTop: '40px'}}>
                    <Form.Item label="选择店铺" {...formItemLayout}>
                        {getFieldDecorator('shopSelection', {
                            rules: [
                                {
                                    required: true,
                                    message: '请选择店铺'
                                }
                            ],
                            initialValue: shopId ? shopId : undefined
                        })(
                            <Select placeholder="请选择店铺">
                                {platformShops.length > 0 && platformShops.map(item => {
                                    return <Option value={item.id} key={item.id}>{item.name}</Option>
                                })}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item label="商品类型" {...formItemLayout}>
                        {getFieldDecorator('goodsSelection', {
                            rules: [
                                {
                                    required: true,
                                    message: '请选择商品类型'
                                }
                            ],
                            initialValue: type ? type : undefined
                        })(
                            <Select placeholder="请选择商品类型">
                                <Option value="0" key='0'>全部</Option>
                                <Option value="1" key='1'>上架</Option>
                                <Option value="2" key='2'>下架</Option>
                            </Select>
                            
                        )}
                    </Form.Item>
                    <Button type='primary' htmlType='submit' style={{marginLeft: '80px'}}>下一步</Button>
                </Form>
            </Fragment>
        )
    }
}