/*
 * @Author: sunlzhi 
 * @Date: 2018-11-07 16:28:18 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-11-20 15:41:28
 */

import React, {Component} from 'react'
import { Modal, Form, Input, message, Tabs, Cascader } from 'antd'
import {AREA_DATA} from 'components/business/CitySelect/AreaData'
// import styles from '../index.less'
import { jine } from 'utils/display'

//地区数据
const options = AREA_DATA

@Form.create()

export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            registeredArea: {
                province: '',
                city: '',
                county: '',
            },
            receivingArea: {
                province: '',
                city: '',
                county: '',
            },
            amount: ''
        }
    }

    // 页面加载调用
    componentDidMount() {
        this.taxpayersDetails(this.props.id)
        const {record, selectedRowKeys, amount} = this.props
        let num = 0

        if (record && record.id) {
            num = record.amount
        } else if (selectedRowKeys) {
            num = amount
        }
        this.setState({
            amount: num
        })
    }

    // 获取模板详情
    taxpayersDetails = (id) => {
        this.props.dispatch({
            type: 'invoice/taxpayersDetails',
            payload: {
                id: id
            },
            callback: (res) => {
                // console.log(res)
            }
        })
    }

    // 关闭弹窗
    handleCancel = () => {
        this.props.handleCancel()
    }

    // 更改电子发票和增值税发票
    handleTabs = (val) => {
        this.props.handleModelTabs(val)
    }

    areaChange = (value) => {
        this.setState({
            province: value[0],
            city: value[1],
            county: value[2],  
        })
        this.props.form.setFieldsValue({
            textArea: value
        }) 
    }

    // 点击确定
    handleOk = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            // console.log(values)
            if (!err) {
                const {id, selectedRowKeys, tabsValue, record} = this.props
                if (record && record.id) {
                    let data = {
                        id: record.id,
                        type: tabsValue,
                        taxpayer_id: id,
                        province: values.increment_receiving_area && values.increment_receiving_area[0],
                        city: values.increment_receiving_area && values.increment_receiving_area[1],
                        region: values.increment_receiving_area && values.increment_receiving_area[2],
                        address: values.increment_receiving_address,
                        consignee: values.increment_addressee_name,
                        mobile: values.increment_contact_number,
                    }
                    this.invoices(data, false)
                } else {
                    let data = {
                        order_ids: selectedRowKeys,
                        type: tabsValue,
                        taxpayer_id: id,
                        province: values.increment_receiving_area && values.increment_receiving_area[0],
                        city: values.increment_receiving_area && values.increment_receiving_area[1],
                        region: values.increment_receiving_area && values.increment_receiving_area[2],
                        address: values.increment_receiving_address,
                        consignee: values.increment_addressee_name,
                        mobile: values.increment_contact_number,
                    }
                    this.invoices(data, true)
                }
            }
        })
    }

    // 发票发送请求
    invoices = (data, add) => {
        this.props.dispatch({
            type: add ? 'invoice/addInvoices' : 'invoice/putInvoices',
            payload: data,
            callback: (res) => {
                // 如果是创建发票
                if (add) {
                    message.success('发票申请提交成功，审核中...')
                    this.props.jumpTabs(
                        {
                            tabsValue: '2',
                        }
                    )
                } else {
                    // 修改发票完成
                    message.success('修改成功，已重新提交审核')
                    this.props.handleCancel(2)
                }
            }
        })
    }

    render() {
        const { getFieldDecorator } = this.props.form
        const {taxpayersDetails} = this.props.invoice
        const {tabsValue} = this.props
        const {amount} = this.state

        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '110px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 11,
            },
        }

        return <Modal
            title="开具发票"
            width={685}
            visible={this.props.visible}
            destroyOnClose={true}
            onOk={this.handleOk}
            onCancel={this.handleCancel}>
            <div>
                <p style={{color: '#999999'}}>请你仔细阅读开票信息，确认开票后不可修改，若因信息填写错误导发票开具，邮寄出错，将不可重开</p>
                {tabsValue === '1' &&
                    <Form layout="horizontal" className="hz-from-search">
                        <Form.Item label="发票金额"  {...formItemLayout}>
                            <span style={{color: '#333333'}}>{jine(amount, '0,0.00', 'Fen')}</span>
                        </Form.Item>
                        <Form.Item label="公司名称"  {...formItemLayout}>
                            {getFieldDecorator('electronics_cname', {
                                rules: [{ required: true, message: '请输入公司名称' }],
                                initialValue: taxpayersDetails.company_name
                            })(
                                <Input disabled={true} />
                            )}
                        </Form.Item>
                        <Form.Item label="纳税人识别号"  {...formItemLayout}>
                            {getFieldDecorator('electronics_identification', {
                                rules: [{ required: true, message: '请输入纳税人识别号' }],
                                initialValue: taxpayersDetails.taxpayer_no
                            })(
                                <Input disabled={true} />
                            )}
                        </Form.Item>
                    </Form>
                }
                {
                    tabsValue === '2' &&
                    <Form layout="horizontal" className="hz-from-search">
                        <Form.Item label="发票金额"  {...formItemLayout}>
                            <span style={{color: '#333333'}}>{jine(amount, '0,0.00', 'Fen')}</span>
                        </Form.Item>
                        <Form.Item label="公司名称"  {...formItemLayout}>
                            {getFieldDecorator('increment_cname', {
                                rules: [{ required: true, message: '' }],
                                initialValue: taxpayersDetails.company_name
                            })(
                                <Input disabled={true} />
                            )}
                        </Form.Item>
                        <Form.Item label="纳税人识别号"  {...formItemLayout}>
                            {getFieldDecorator('increment_identification', {
                                rules: [{ required: true, message: '' }],
                                initialValue: taxpayersDetails.taxpayer_no
                            })(
                                <Input disabled={true} />
                            )}
                        </Form.Item>
                        <Form.Item label="注册地区信息"  {...formItemLayout}>
                            {getFieldDecorator('increment_registered_area', {
                                rules: [{ required: true, message: '' }],
                                initialValue: [taxpayersDetails.register_province, taxpayersDetails.register_city, taxpayersDetails.register_region]
                            })(
                                <Cascader disabled={true} options={options}></Cascader>
                            )}
                        </Form.Item>
                        <Form.Item label="注册详细地址"  {...formItemLayout}>
                            {getFieldDecorator('increment_registered_address', {
                                rules: [{ required: true, message: '' }],
                                initialValue: taxpayersDetails.register_address
                            })(
                                <Input disabled={true} />
                            )}
                        </Form.Item>
                        <Form.Item label="注册电话"  {...formItemLayout}>
                            {getFieldDecorator('increment_registered_telephone', {
                                rules: [{ required: true, message: '' }],
                                initialValue: taxpayersDetails.register_phone
                            })(
                                <Input disabled={true} />
                            )}
                        </Form.Item>
                        <Form.Item label="开户银行"  {...formItemLayout}>
                            {getFieldDecorator('increment_account_opening_bank', {
                                rules: [{ required: true, message: '' }],
                                initialValue: taxpayersDetails.bank_name
                            })(
                                <Input disabled={true} />
                            )}
                        </Form.Item>
                        <Form.Item label="银行账号"  {...formItemLayout}>
                            {getFieldDecorator('increment_bank_account', {
                                rules: [{ required: true, message: '' }],
                                initialValue: taxpayersDetails.bank_account
                            })(
                                <Input disabled={true} />
                            )}
                        </Form.Item>
                        <Form.Item label="收件地区信息"  {...formItemLayout}>
                            {getFieldDecorator('increment_receiving_area', {
                                rules: [{ required: true, message: '请选择收件地区信息' }],
                                initialValue: taxpayersDetails.province?[taxpayersDetails.province, taxpayersDetails.city, taxpayersDetails.region]: undefined
                            })(
                                <Cascader options={options} placeholder="省/市/区" onChange={this.areaChange}></Cascader>
                            )}
                        </Form.Item>
                        <Form.Item label="收件详细地址"  {...formItemLayout}>
                            {getFieldDecorator('increment_receiving_address', {
                                rules: [
                                    { required: true, message: '请输入收件详细地址' },
                                    { whitespace: true,message: '不能只输入空格' },
                                ],
                                initialValue: taxpayersDetails.address
                            })(
                                <Input placeholder="请输入收件详细地址"  maxLength={50}/>
                            )}
                        </Form.Item>
                        <Form.Item label="收件人"  {...formItemLayout}>
                            {getFieldDecorator('increment_addressee_name', {
                                rules: [
                                    { required: true, message: '请输入收件人姓名' },
                                    { whitespace: true,message: '不能只输入空格' },
                                ],
                                initialValue: taxpayersDetails.consignee
                            })(
                                <Input placeholder="请输入收件人姓名" maxLength={20}/>
                            )}
                        </Form.Item>
                        <Form.Item label="联系电话"  {...formItemLayout}>
                            {getFieldDecorator('increment_contact_number', {
                                rules: [
                                    { required: true, message: '请输入联系电话' },
                                    { pattern: /(^\d{3,4}-\d{3,8}$)|(^\d{3,4} \d{3,8}$)|(^1\d{10}$)/, message: '请输入正确的电话号码' }
                                ],
                                initialValue: taxpayersDetails.mobile
                            })(
                                <Input placeholder="请输入联系电话" />
                            )}
                        </Form.Item>
                    </Form>
                }
            </div>
        </Modal>
    }

}