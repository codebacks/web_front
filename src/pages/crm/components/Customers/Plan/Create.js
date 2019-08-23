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
    InputNumber,
    Button,
    notification
} from 'antd'
import router from 'umi/router'
import styles from './Create.scss'
import config from 'crm/common/config'
import moment from 'moment'
import Message from 'business/Message/Index'
import Member from './Member'
import 'moment/locale/zh-cn'

moment.locale('zh-cn')

const {RangePicker} = DatePicker
const FormItem = Form.Item
const {DateFormat, DateTimeFormat} = config

class CreatePlan extends React.Component {
    constructor(props) {
        super()
        this.state = {
            messageNum: [{'key': 0, 'enabled': true}],
            formData: {
                start_time: moment().format(DateFormat),
                end_time: moment().add(7, 'days').format(DateFormat),
                method: 2,  // 1: 群发  2： 人工
                messages: []
            },
            showMember: false,
            runAt: [['08:00', '22:00']]
            // member: []
        }
    }

    componentDidMount() {
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

    handleStartTimeChange = (value) => {
        let formData = {...this.state.formData}
        formData.run_time = value
        this.setState({formData: formData})
    };

    handleAddMessage = () => {
        let num = [...this.state.messageNum],
            len = num.length
        if (len < 10) {
            num[len] = {'key': len, 'enabled': true}
            this.setState({messageNum: num})
        }
    };

    handleRemoveMessage = (idx, e) => {
        let formData = {...this.state.formData}
        let messages = formData.messages
        let num = [...this.state.messageNum]
        messages.splice(idx, 1)
        num[idx].enabled = false
        this.setState({messages: messages, messageNum: num})
        e.preventDefault()
    };

    handleSubmit = (e) => {
        e.preventDefault()
        let at = this.state.runAt
        for (let i = 0, j = at.length; i < j; i++) {
            let _t = at[i]
            if (_t[0] >= _t[1]) {
                notification.error({
                    message: '错误提示',
                    description: '投递开始时间不能大于或等于结束时间!'
                })
                return false
            }
        }
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let formData = {...this.state.formData}
                formData.title = values.title
                formData.desc = values.desc
                formData.upper_limit = values.upper_limit
                formData.run_at = this.state.runAt
                if (formData.method === 1) {
                    if (!formData.run_time) {
                        //群发时未选择发送时间
                        notification.error({
                            message: '错误提示',
                            description: '开始执行时间不能为空'
                        })
                        return false
                    }
                    if (formData.messages.length === 0) {
                        //群发时未填写发送内容
                        notification.error({
                            message: '错误提示',
                            description: '群发消息内容不能为空'
                        })
                        return false
                    }
                }
                const toCustomers = this.props.crm_plans.toCustomers
                let to_customer_ids = [], member
                for (let i = 0, j = toCustomers.length; i < j; i++) {
                    member = toCustomers[i]
                    to_customer_ids.push(member.id)
                }
                formData.to_customer_ids = to_customer_ids
                formData.run_time = moment(formData.run_time).format(DateTimeFormat)
                this.props.dispatch({
                    type: 'crm_plans/create',
                    payload: formData,
                    callback: () => {
                        this.handleCancel()
                        this.props.reload ? this.props.reload() : router.push('/wx/plans')
                    }
                })
            }
        })

    };

    handleChangeMessage = (message) => {
        let formData = {...this.state.formData}
        let messages = formData.messages
        let idx = messages.findIndex((item) => {
            return message.key === item.key
        })
        if (idx !== -1) {
            messages.splice(idx, 1, message)
        } else {
            messages = messages.concat(message)
        }
        formData.messages = messages
        this.setState({formData: formData})
    };

    handleShowMember = () => {
        this.setState({showMember: true})
    };
    handleHideMember = () => {
        this.setState({showMember: false})
    };
    handleRemoveMember = (idx) => {
        this.props.dispatch({
            type: 'crm_plans/removeCustomer',
            payload: {idx: idx}
        })
    };
    handleAddRunAt = (e) => {
        let at = Array.from(this.state.runAt)
        at.push(['08:00', '22:00'])
        this.setState({runAt: at})
        e.preventDefault()
    };
    handleRemoveRunAt = (idx) => {
        let at = Array.from(this.state.runAt)
        at = at.splice(idx, 1)
        this.setState({runAt: at})
    };
    handleChangeTime = (idx, sIdx, time, timeString) => {
        let at = Array.from(this.state.runAt)
        at[idx][sIdx] = timeString
        this.setState({runAt: at})
    };
    handleCancel = () => {
        this.props.dispatch({
            type: 'crm_plans/setProperty',
            payload: {createModal: false},
        })
    };

    render() {
        const {getFieldDecorator} = this.props.form
        const {formData} = this.state
        const {toCustomers, createModal, createLoading} = this.props.crm_plans
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
        const getMessageComponent = () => {
            let comp = [], num
            for (let i = 0; i < this.state.messageNum.length; i++) {
                num = this.state.messageNum[i]
                if (num.enabled) {
                    comp.push(<div className={styles.messageWrap} key={`key_${num.key}`}>
                        <Message key={num.key} {...this.props} unique={i + 1} onChange={this.handleChangeMessage}/>
                        {i > 0 ? <a href="#" onClick={this.handleRemoveMessage.bind(this, i)}
                            className={styles.removeMessage}>删除</a> : ''}
                    </div>)
                }
            }
            return comp
        }
        // const timeFormat = 'HH:mm'
        return (
            <Modal
                visible={createModal}
                title="创建营销计划"
                onCancel={this.handleCancel}
                width={800}
                className={styles.createForm}
                maskClosable={false}
                footer={[<Button key="cancel" onClick={this.handleCancel}>取消</Button>,
                    <Button key="submit" type="primary" loading={createLoading} onClick={this.handleSubmit}>提交</Button>
                ]}
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
                                initialValue: toCustomers.length || 30
                            })(
                                <InputNumber/>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="起止日期"
                            required={true}>
                            <RangePicker
                                defaultValue={[moment(formData.start_time, DateFormat), moment(formData.end_time, DateFormat)]}
                                onChange={this.handleChangeDate}/>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="参加人员">
                            {toCustomers.length ?
                                <a href="#" onClick={this.handleShowMember}>{toCustomers.length}人</a>
                                : <span>可在【客户列表】或工作台聊天过程中添加到该计划</span>}
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
                {this.state.showMember && toCustomers.length ?
                    <Member {...this.props} onCancel={this.handleHideMember} member={toCustomers}
                        onRemoveMember={this.handleRemoveMember}/>
                    : ''}
            </Modal>
        )
    }
}

export default Form.create()(CreatePlan)
