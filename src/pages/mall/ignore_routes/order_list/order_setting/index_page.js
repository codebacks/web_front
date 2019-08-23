import { PureComponent } from 'react'
import Page from 'components/business/Page'
import {connect} from 'dva'
import router from 'umi/router'
import DocumentTitle from 'react-document-title'
import { Button, Form,  Input, Card } from 'antd'
import styles from './index.less'


@Form.create()
@connect(({mall_order_list, base}) =>({
    mall_order_list, base
}))
export default class extends PureComponent {
    state = {
        loading: false
    }

    componentDidMount () {
        this.setState({
            loading: true
        })
        this.props.dispatch({
            type: 'mall_order_list/getOrderSetting',
            callback: (data) => {
                this.setState({
                    loading: false
                })
            }
        })
    }

    /* 表单验证 */
    validateCancel = (rule, value, callback) => {
        console.log(value)
        if (!value.toString().trim()) {
            callback('请设置订单取消时间')
        } else if (!/^\d{1,}$/.test(value)) {
            callback('请输入正整数,不要有特殊字符')
        } else if (value < 20 || value > 1440) {
            callback('必须在20-1440分钟之间')
        }
        callback()
    }

    validateConfirm = (rule, value, callback) => {
        console.log(value)
        if (!value.toString().trim()) {
            callback('请设置确认收货时间')
        } else if (!/^\d{1,}$/.test(value)) {
            callback('请输入正整数,不要有特殊字符')
        } else if (value < 7 || value > 30) {
            callback('必须在7-30天之间')
        }
        callback()
    }

    /* 事件处理 */
    onSubmit = (e) => {
        e.preventDefault()

        const { form } = this.props
        const { orderSetting } = this.props.mall_order_list
        form.validateFields((error, value) => {
            if (error) {
                return
            }
            const params = {
                customer_service_mobile: orderSetting.customer_service_mobile,
                description: orderSetting.description,
                logo_url: orderSetting.logo_url,
                name: orderSetting.name,
                order_auto_confirm_days: parseFloat(value.confirmInput),
                order_expire_time: parseFloat(value.cancelInput * 60),
            }
            this.props.dispatch({
                type: 'mall_order_list/resetOrderSetting',
                payload: params,
                callback: (status) => {
                    if (status === 200) {
                        router.replace(`/mall/order_list`)
                    }
                }
            })
        })
    }

    render () {
        const formItemLayout = {
            labelCol: {
                span: 8,
                style: {
                    width: '100px',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const confirmItemLayout = {
            labelCol: {
                span: 8,
                style: {
                    width: '42px',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const cancelLabel = <span style={{color: '#666666'}}>拍下未付款订单</span>
        const confirmLabel = <span style={{color: '#666666'}}>发货后</span>
        const { getFieldDecorator } = this.props.form
        const { loading } = this.state
        const { orderSetting } = this.props.mall_order_list
        return (
            <DocumentTitle title='订单设置'>
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '订单列表',
                            path: '/mall/order_list'
                        },{
                            name: '订单设置'
                        }]}
                    />
                    <Form onSubmit={this.onSubmit}>
                        <Page.ContentBlock title='待付款订单取消时间设置' hasDivider={false}>
                            <Card bordered={false} bodyStyle={{padding: '0'}} loading={loading}>
                                <Form.Item label={cancelLabel} colon={false} {...formItemLayout}>
                                    {getFieldDecorator('cancelInput',{
                                        rules: [
                                            {
                                                validator: this.validateCancel
                                            }
                                        ],
                                        initialValue: orderSetting.order_expire_time / 60 || 20
                                    })(
                                        <Input className={styles.input}/>
                                    )}
                                    <span>分钟内未付款，自动取消订单</span>
                                </Form.Item>
                                <div className={styles.cancelExplain}>
                                    订单取消时间必须在 20-1440分钟之间
                                </div>
                            </Card>
                        </Page.ContentBlock>
                        <Page.ContentBlock title='发货后自动确认收货时间设置' hasDivider={false}>
                            <Card bordered={false} bodyStyle={{padding: '0'}} loading={loading}>
                                <Form.Item label={confirmLabel} colon={false} {...confirmItemLayout}>
                                    {getFieldDecorator('confirmInput',{
                                        rules: [
                                            {
                                                validator: this.validateConfirm
                                            }
                                        ],
                                        initialValue: orderSetting.order_auto_confirm_days || 7
                                        
                                    })(
                                        <Input className={styles.input}/>
                                    )}
                                    <span>天，自动确认收货</span>
                                </Form.Item>
                                <div className={styles.confirmExplain}>
                                    自动收货时间必须在7-30天之间
                                </div>
                            </Card>
                            <Button type='primary' htmlType='submit'>保存</Button>
                        </Page.ContentBlock>
                    </Form>
                </Page>
            </DocumentTitle>
        )
    }
}