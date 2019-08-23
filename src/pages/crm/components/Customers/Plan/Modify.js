'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/8
 */
import React from 'react'
import {
    Modal,
    Form,
    DatePicker,
    Input,
    InputNumber
} from 'antd'
import styles from './Create.scss'
import Helper from 'crm/utils/helper'
import config from 'crm/common/config'
import moment from 'moment'
import Message from 'crm/components/Common/Message/Index'
import Customers from './Customers'

import 'moment/locale/zh-cn'
moment.locale('zh-cn')

const {RangePicker} = DatePicker
const FormItem = Form.Item

const {DateFormat, DefaultVideoIcon, DefaultFileIcon} = config

class ModifyPlan extends React.Component {
    constructor(props) {
        super()
        this.state = {
            record: props.record,
            messageNum: [{'key': 0, 'enabled': true}],
            messages: props.record.messages,
            formData: {
                start_time: moment().format(DateFormat),
                end_time: moment().add(7, 'days').format(DateFormat),
                method: 2, // 1: 群发  2： 人工
                messages: []
            },
            showCustomers: false
        }
    }

    componentDidMount() {
        let messageNum = []
        let messages = Array.from(this.props.record.messages)
        if (messages.length) {
            for (let i = 0, j = messages.length; i < j; i++) {
                messageNum.push({'key': i, 'enabled': true})
                messages[i].key = i
            }
            this.setState({
                messages: messages,
                messageNum: messageNum
            })
        }
    }

    handleChangeDate = (val) => {
        let formData = {...this.state.formData}
        formData.start_time = moment(val[0]).format(DateFormat)
        formData.end_time = moment(val[1]).format(DateFormat)
        this.setState({formData: formData})
    };

    handleChange = (field, e) => {
        let formData = {...this.state.formData}
        formData[field] = e.target.value
        this.setState({formData: formData})
        e.preventDefault()
    };

    handleAddMessage = () => {
        let num = [...this.state.messageNum],
            len = num.length
        let exist = false
        const getKey = () => {
            for (let i = 0; i < 10; i++) {
                exist = false
                num.map((item) => {
                    if (item.key === i) {
                        exist = true
                    }
                })
                if (!exist) {
                    return i
                }
            }
        }
        if (len < 10) {
            num[len] = {'key': getKey(), 'enabled': true, 'type': 'Text'}
            this.setState({messageNum: num})
        }
    };

    handleRemoveMessage = (idx, e) => {
        let messages = Array.from(this.state.messages)
        let num = [...this.state.messageNum]
        messages.splice(idx, 1)
        num.splice(idx, 1)
        this.setState({messages: messages, messageNum: num})
        e.preventDefault()
    };

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let formData = {...this.state.formData}
                formData.id = this.state.record.id
                formData.title = values.title
                formData.desc = values.desc
                formData.upper_limit = values.upper_limit
                let messages = Array.from(this.state.messages)
                for (let i = 0; i < messages.length; i++) {
                    messages[i].key = i
                }
                formData.messages = messages
                this.props.dispatch({
                    type: 'crm_plans/modify',
                    payload: formData,
                    callback: () => {
                        this.props.reload()
                        this.handleCancel()
                    }
                })
            }
        })

    };

    handleChangeMessage = (msg) => {
        let messages = Array.from(this.state.messages)
        let idx = messages.findIndex((item) => {
            return msg.key === item.key
        })
        if (idx !== -1) {
            messages.splice(idx, 1, msg)
        } else {
            messages = messages.concat(msg)
        }
        this.setState({messages: messages})
    };

    handleCancel = () => {
        this.props.onCancel()
    };
    handleCancelCustomers = () => {
        this.setState({showCustomers: false})
    };
    handleShowCustomers = (record) => {
        this.setState({showCustomers: true, record: record})
    };
    handleRemoveCustomer = (id) => {
        let _customers_ids = Array.from(this.state.record.to_customer_ids)
        _customers_ids = _customers_ids.filter((key) => {
            return key !== id
        })
        let _record = {...this.state.record}
        _record.to_customer_ids = _customers_ids
        this.setState({record: _record})
    };

    render() {
        const {getFieldDecorator} = this.props.form
        const {record} = this.state
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 14},
            },
        }
        const getFile = (idx) => {
            let record = this.state.record, file = {}, thumbUrl = ''
            let message = record.messages[idx]
            if (message && message.type !== 'Text') {
                if (message.type === 'Picture') {
                    thumbUrl = message.url
                } else if (message.type === 'Video') {
                    thumbUrl = DefaultVideoIcon
                } else {
                    thumbUrl = DefaultFileIcon
                }
                file.response = {
                    "data": {
                        "file": {
                            "id": message.file_id,
                            "url": message.url
                        }
                    }
                }
                file.id = message.file_id
                // file.type = "image/jpeg";
                file.uid = message.file_id
                file.percent = 100
                file.originFileObj = {"uid": "rc-upload-" + Helper.getTimestamp() + "-2"}
                file.status = "done"
                // file.url = thumbUrl;
                file.name = message.filename
                file.thumbUrl = thumbUrl
            }
            return file.id ? file : null
        }
        const getMessageComponent = () => {
            let comp = [], num, nums = this.state.messageNum, messages = this.state.messages
            for (let i = 0; i < nums.length; i++) {
                num = nums[i]
                if (num.enabled) {
                    comp.push(<div className={styles.messageWrap} key={`key_${num.key}`}>
                        <Message key={num.key} {...this.props} file={getFile(i)} message={messages[i] || num}
                            unique={i} onChange={this.handleChangeMessage}/>
                        {i > 0 ? <span onClick={this.handleRemoveMessage.bind(this, i)}
                            className={styles.removeMessage + ' link'}>删除</span> : ''}
                    </div>)
                }
            }
            return comp
        }
        return (
            <Modal
                visible={this.props.visible}
                title="修改营销计划"
                onCancel={this.handleCancel}
                onOk={this.handleSubmit}
                width={800}
                className={styles.createForm}
                maskClosable={false}
            >
                <div className={styles.content} style={{overflow: 'auto'}}>
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="计划标题"
                            hasFeedback
                        >
                            {getFieldDecorator('title', {
                                rules: [{
                                    required: true, message: '计划标题不能为空',
                                }],
                                initialValue: record.title
                            })(
                                <Input/>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="计划描述"
                            hasFeedback
                        >
                            {getFieldDecorator('desc', {
                                rules: [{
                                    required: true, message: '营销计划描述不能为空',
                                }],
                                initialValue: record.desc
                            })(
                                <Input placeholder="请输入营销计划描述" type="textarea" rows="4"/>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="活动人数上限"
                        >
                            {getFieldDecorator('upper_limit', {
                                rules: [{
                                    required: true, message: '计划活动人数上限',
                                }],
                                initialValue: record.upper_limit
                            })(
                                <InputNumber/>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="起止日期"
                            required={true}>
                            <RangePicker
                                defaultValue={[moment(record.start_time * 1000), moment(record.end_time * 1000)]}
                                onChange={this.handleChangeDate}/>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="参加人员">
                            {record.to_customer_ids.length ?
                                <span className="link"
                                    onClick={this.handleShowCustomers.bind(this, record)}>{record.to_customer_ids.length}人</span>
                                : <span>可在【客户列表】或PC客户端聊天过程中添加到该计划</span>}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="消息"
                            required={true}>
                            {getMessageComponent()}
                            {this.state.messageNum.length < 10 ?
                                <div className="btnAdd">
                                    <a href="#" onClick={this.handleAddMessage}>添加消息</a>
                                </div>
                                : ''}
                        </FormItem>
                    </Form>
                </div>
                {this.state.showCustomers ?
                    <Customers {...this.props} visible={this.state.showCustomers}
                        record={this.state.record}
                        onRemoveCustomer={this.handleRemoveCustomer}
                        onCancel={this.handleCancelCustomers}/> : ''
                }
            </Modal>
        )
    }
}

export default Form.create()(ModifyPlan)
