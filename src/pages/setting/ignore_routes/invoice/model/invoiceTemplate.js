/*
 * @Author: sunlzhi 
 * @Date: 2018-11-02 18:32:00 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-11-20 15:30:57
 */

import React, {Component} from 'react'
import { Modal, Form, Input, message, Cascader } from 'antd'
import {AREA_DATA} from 'components/business/CitySelect/AreaData'
// import styles from '../index.less'

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
        }
    }

    // 页面加载调用
    componentDidMount() {
        const {tid} = this.props
        if (tid) {
            this.taxpayersDetails(tid)
        } else {
            this.props.dispatch({
                type: 'invoice/setProperty',
                payload: {taxpayersDetails: {}},
            })
        }
    }

    // 获取纳税人详情
    taxpayersDetails = (id) => {
        this.props.dispatch({
            type: 'invoice/taxpayersDetails',
            payload: {
                id: id
            },
            callback: () => {}
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
            if (!err) {
                let data = {
                    name: values.increment_name,
                    company_name: values.increment_cname,
                    taxpayer_no: values.increment_identification,
                    register_province: values.increment_registered_area[0],
                    register_city: values.increment_registered_area[1],
                    register_region: values.increment_registered_area[2],
                    register_address: values.increment_registered_address,
                    register_phone: values.increment_registered_telephone,
                    bank_name: values.increment_account_opening_bank,
                    bank_account: values.increment_bank_account,
                    province: values.increment_receiving_area && values.increment_receiving_area[0],
                    city: values.increment_receiving_area && values.increment_receiving_area[1],
                    region: values.increment_receiving_area && values.increment_receiving_area[2],
                    address: values.increment_receiving_address || '',
                    consignee: values.increment_addressee_name || '',
                    mobile: values.increment_contact_number || '',
                }

                const {tid} = this.props
                if (tid) {
                    data.id = tid
                    this.putTaxpayers(data)
                } else {
                    this.addTaxpayers(data)
                }
            }
        })
    }

    // 新建提交
    addTaxpayers = (data) => {
        this.props.dispatch({
            type: 'invoice/addTaxpayers',
            payload: data,
            callback: () => {
                message.success('创建成功')
                this.handleCancel()
                this.props.getTaxpayers()
            }
        })
    }

    // 修改提交
    putTaxpayers = (data) => {
        this.props.dispatch({
            type: 'invoice/putTaxpayers',
            payload: data,
            callback: () => {
                message.success('修改成功')
                this.handleCancel()
                this.props.changeTid()
                this.props.getTaxpayers()
            }
        })
    }

    render() {
        const { taxpayersDetails } = this.props.invoice
        const { getFieldDecorator } = this.props.form
        const {tid} = this.props

        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '110px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }

        return <Modal
            title={tid?"编辑发票模板":"创建发票模板"}
            width={540}
            visible={this.props.visible}
            destroyOnClose={true}
            onOk={this.handleOk}
            onCancel={this.handleCancel}>
            <div>
                <Form layout="horizontal" className="hz-from-search">
                    <Form.Item label="模板名称"  {...formItemLayout}>
                        {getFieldDecorator('increment_name', {
                            rules: [
                                { required: true, message: '请输入模板名称' },
                                { whitespace: true,message: '不能只输入空格' },
                            ],
                            initialValue: taxpayersDetails.name
                        })(
                            <Input placeholder="请输入模板名称" maxLength={30} />
                        )}
                    </Form.Item>
                    <Form.Item label="公司名称"  {...formItemLayout}>
                        {getFieldDecorator('increment_cname', {
                            rules: [
                                { required: true, message: '请输入公司名称' },
                                { whitespace: true,message: '不能只输入空格' },
                            ],
                            initialValue: taxpayersDetails.company_name
                        })(
                            <Input placeholder="请输入公司名称" maxLength={30} />
                        )}
                    </Form.Item>
                    <Form.Item label="纳税人识别号"  {...formItemLayout}>
                        {getFieldDecorator('increment_identification', {
                            rules: [
                                { required: true, message: '请输入纳税人识别号' },
                                { pattern: /^[0-9A-Z]{18}$/, message: '纳税人识别号为18位大写字母和数字的组合'}
                            ],
                            initialValue: taxpayersDetails.taxpayer_no
                        })(
                            <Input placeholder="请输入纳税人识别号" />
                        )}
                    </Form.Item>
                    <Form.Item label="注册地区信息"  {...formItemLayout}>
                        {getFieldDecorator('increment_registered_area', {
                            rules: [{ required: true, message: '请选择注册地区信息' }],
                            initialValue: taxpayersDetails.register_province?[taxpayersDetails.register_province, taxpayersDetails.register_city, taxpayersDetails.register_region]: undefined
                        })(
                            <Cascader options={options} placeholder="省/市/区" onChange={this.areaChange}></Cascader>
                        )}
                    </Form.Item>
                    <Form.Item label="注册详细地址"  {...formItemLayout}>
                        {getFieldDecorator('increment_registered_address', {
                            rules: [
                                { required: true, message: '请输入注册详细地址' },
                                { whitespace: true,message: '不能只输入空格' },
                            ],
                            initialValue: taxpayersDetails.register_address
                        })(
                            <Input placeholder="请输入注册详细地址" maxLength={50} />
                        )}
                    </Form.Item>
                    <Form.Item label="注册电话"  {...formItemLayout}>
                        {getFieldDecorator('increment_registered_telephone', {
                            rules: [
                                { required: true, message: '请输入注册电话' },
                                { pattern: /(^\d{3,4}-\d{3,8}$)|(^\d{3,4} \d{3,8}$)|(^1\d{10}$)/, message: '请输入正确的电话号码' }
                            ],
                            initialValue: taxpayersDetails.register_phone
                        })(
                            <Input placeholder="请输入注册电话" />
                        )}
                    </Form.Item>
                    <Form.Item label="开户银行"  {...formItemLayout}>
                        {getFieldDecorator('increment_account_opening_bank', {
                            rules: [
                                { required: true, message: '请输入开户银行' },
                                { whitespace: true,message: '不能只输入空格' },
                            ],
                            initialValue: taxpayersDetails.bank_name
                        })(
                            <Input placeholder="请输入开户银行"  maxLength={50}/>
                        )}
                    </Form.Item>
                    <Form.Item label="银行账号"  {...formItemLayout}>
                        {getFieldDecorator('increment_bank_account', {
                            rules: [
                                { required: true, message: '请输入银行账号' },
                                { pattern: /^\d{10,31}$/, message: '请输入正确的银行账号' }
                            ],
                            initialValue: taxpayersDetails.bank_account
                        })(
                            <Input placeholder="请输入银行账号" />
                        )}
                    </Form.Item>
                    <Form.Item label="收件地区信息"  {...formItemLayout}>
                        {getFieldDecorator('increment_receiving_area', {
                            rules: [],
                            initialValue: taxpayersDetails.province?[taxpayersDetails.province, taxpayersDetails.city, taxpayersDetails.region]: undefined
                        })(
                            <Cascader options={options} placeholder="省/市/区" onChange={this.areaChange}></Cascader>
                        )}
                    </Form.Item>
                    <Form.Item label="收件详细地址"  {...formItemLayout}>
                        {getFieldDecorator('increment_receiving_address', {
                            rules: [{ whitespace: true,message: '不能只输入空格' },],
                            initialValue: taxpayersDetails.address
                        })(
                            <Input placeholder="请输入收件详细地址" maxLength={50} />
                        )}
                    </Form.Item>
                    <Form.Item label="收件人"  {...formItemLayout}>
                        {getFieldDecorator('increment_addressee_name', {
                            rules: [{ whitespace: true,message: '不能只输入空格' },],
                            initialValue: taxpayersDetails.consignee
                        })(
                            <Input placeholder="请输入收件人姓名" maxLength={20} />
                        )}
                    </Form.Item>
                    <Form.Item label="联系电话"  {...formItemLayout}>
                        {getFieldDecorator('increment_contact_number', {
                            rules: [{ pattern: /(^\d{3,4}-\d{3,8}$)|(^\d{3,4} \d{3,8}$)|(^1\d{10}$)/, message: '请输入正确的电话号码' }],
                            initialValue: taxpayersDetails.mobile
                        })(
                            <Input placeholder="请输入联系电话" />
                        )}
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    }

}