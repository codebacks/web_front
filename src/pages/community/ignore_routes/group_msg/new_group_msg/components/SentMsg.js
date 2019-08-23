import React, {PureComponent} from 'react'
import {
    Form,
    Input,
    Button,
    Modal,
    Radio,
    DatePicker,
    message,
    Slider,
} from 'antd'
import {connect} from "dva/index"
import moment from 'moment'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from '../index.less'
import {forEachAntdFormFields} from 'utils'
import _ from "lodash"
import config from 'community/common/config'
import Messages from '../components/Messages'
import RangeTimePicker from "components/RangeTimePicker/index"

const FormItem = Form.Item
const RadioGroup = Radio.Group
const {DateTimeFormat} = config

@connect((
    {
        // base,
        // community_automaticNewGroupMsg,
        loading,
    },
) => ({
    // base,
    // community_automaticNewGroupMsg,
    submitLoading: loading.effects['community_automaticNewGroupMsg/sentMsgHandleSubmit'],
}))
@documentTitleDecorator({
    title: '发送消息',
})
@Form.create({
    mapPropsToFields(props) {
        const antdFrom = _.get(props, 'community_automaticNewGroupMsg.sentMsg.antdFrom')

        forEachAntdFormFields(antdFrom, (key, value, form) => {
            if(Array.isArray(value)) {
                form[key] = value.map(val => {
                    return forEachAntdFormFields(val)
                })
            }else {
                form[key] = Form.createFormField(value)
            }
        })

        return antdFrom
    },
    onFieldsChange(props, field, fields) {
        props.dispatch({
            type: 'community_automaticNewGroupMsg/setStateByPath',
            payload: {
                path: 'sentMsg.antdFrom',
                value: fields,
            },
        })
    },
})
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            previewImage: '',
            previewVisible: false,
        }
    }

    componentDidMount() {

    }

    validateForm = () => {
        return new Promise((resolve, reject) => {
            this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
                if(err) {
                    reject(err)
                }else {
                    resolve(values)
                }
            })
        })
    }

    messagesFormat = (messages) => {
        return messages.map((msg) => {
            msg.common_msg_content.at_all = msg.at_all

            return msg.common_msg_content
        })
    }

    handleSubmit = async (e) => {
        e && e.preventDefault()
        try {
            const formData = await this.validateForm()
            const {
                messages = [],
            } = this.props.community_automaticNewGroupMsg.sentMsg

            if(!messages.length) {
                message.error('消息内容必填！')
                return
            }

            const body = {}

            body['title'] = formData['title'].trim()

            if(formData['executeType'] === 1) {
                body['execute_now'] = false
                body['execute_time'] = formData['execute_time'].format(DateTimeFormat)
            }else {
                body['execute_now'] = true
                body['execute_time'] = ''
            }

            body['messages'] = this.messagesFormat(messages)
            body['items'] = this.props.community_automaticNewGroupMsg.sentMsg.data
            body['interval_min'] = formData.between[0]
            body['interval_max'] = formData.between[1]

            const format = 'HH:mm'
            if (formData['executeRangeType'] === 1) {
                body['time_from'] = formData.time[0].format(format)
                body['time_to'] = formData.time[1].format(format)
            }
            body['message_interval_min'] = formData.messageBetween[0]
            body['message_interval_max'] = formData.messageBetween[1]

            this.props.dispatch({
                type: 'community_automaticNewGroupMsg/sentMsgHandleSubmit',
                payload: body,
                callback: () => {
                    message.success('创建成功')
                    this.props.cancel()
                },
            })
        }catch(e) {
            console.log(e)
            // throw e
        }
    }

    handleCancelPreview = () => {
        this.setState({
            previewImage: '',
            previewVisible: false,
        })
    }

    getDisabledHoursFn = (current) => {
        return () => {
            const arr = []
            const startCurrent = current.clone()
            startCurrent.startOf('day')
            const now = moment().add(30, 'minutes').startOf('hour')

            for(let i = 0; i < 23; i++) {
                if(startCurrent < now) {
                    arr.push(i)
                }

                startCurrent.add(1, 'hours')
            }

            return arr
        }
    }

    getDisabledMinutesFn = (current) => {
        return () => {
            const arr = []

            const startCurrent = current.clone()
            startCurrent.startOf('hour')
            const now = moment().add(30, 'minutes').startOf('minute')

            for(let i = 0; i < 60; i++) {
                if(startCurrent < now) {
                    arr.push(i)
                }

                startCurrent.add(1, 'minutes')
            }

            return arr
        }
    }

    disabledTime = (current) => {
        current = current || moment()
        if(!current) {
            return
        }

        return {
            disabledHours: this.getDisabledHoursFn(current),
            disabledMinutes: this.getDisabledMinutesFn(current),
        }
    }

    checkDatePicker = (rule, value, callback) => {
        const {
            antdFrom: {
                executeType,
            },
        } = this.props.community_automaticNewGroupMsg.sentMsg

        if(executeType.value !== 1) {
            callback()
            return
        }

        if(!value) {
            callback('必填')
        }else {
            if(value < moment().add(30, 'minutes').startOf('minute')) {
                callback('大于当前时间30分钟')
                return
            }
            callback()
        }
    }

    checkRangeTimePicker = (rule, value, callback) => {
        const {
            antdFrom: {
                executeRangeType,
            },
        } = this.props.community_automaticNewGroupMsg.sentMsg
        if (executeRangeType.value !== 1) {
            callback()
            return
        }

        if (!value) {
            callback('请选择时间')
        }else if (!value[0]) {
            callback('请选择开始时间')
        }else if (!value[1]) {
            callback('请选择结束时间')
        }else {
            if (value[0].valueOf() >= value[1].valueOf()) {
                callback('结束时间必须大于开始时间')
            }else {
                callback()
            }
        }
    }

    disabledDate = (current) => {
        if(!current) {
            return
        }

        return current <= moment().startOf('day')
    }

    computingTimeTip = () => {
        const {
            antdFrom: {
                executeType,
                execute_time,
                between,
            },
            data,
            messages = [],
        } = this.props.community_automaticNewGroupMsg.sentMsg

        let time = moment()
        if(executeType.value === 1 && moment.isMoment(execute_time.value)) {
            time = execute_time.value.clone()
        }
        let addSeconds = messages.length * 10 + data.length * between.value[1] * 60

        time = time.add(addSeconds, 'seconds')

        return `预计完成时间：${time.format('YYYY-MM-DD HH:mm:ss')}${time.hour() >= 21 ? `，为避免对好友造成骚扰建议时间控制在21点前` : ''}`
    }

    render() {
        const {
            form,
            community_automaticNewGroupMsg,
        } = this.props

        const {
            getFieldDecorator,
        } = form

        const {
            at,
            sentMsg,
            checkWeChatGroup,
        } = community_automaticNewGroupMsg

        const {
            antdFrom: {
                executeType,
                executeRangeType,
            },
            data,
        } = sentMsg
        const {
            selected,
        } = checkWeChatGroup

        const {
            previewVisible,
            previewImage,
        } = this.state

        const formItemLayout = {
            labelCol: {
                span: 4,
                style: {
                    width: '120px',
                },
            },
            wrapperCol: {span: 12},
        }

        return (
            <div className={styles.sentMsg}>
                <div className={styles.title}>
                    已选微信群 {selected.table.length}
                    <span className={styles.tip}>
                        自动过滤重复微信群{selected.table.length - data.length}个
                    </span>
                </div>
                <Form layout={'horizontal'} onSubmit={this.handleSubmit}>
                    <FormItem
                        {...formItemLayout}
                        label="群发主题"
                    >
                        {
                            getFieldDecorator('title', {
                                rules: [
                                    {required: true, message: '必填'},
                                    {
                                        pattern: /^.{1,20}$/,
                                        message: '限1-20个字',
                                    },
                                ],
                            })(
                                <Input placeholder="请输入主题，20字以内"/>,
                            )
                        }
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={`消息内容`}
                        required={true}
                    >
                        <Messages showAt={at}/>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="执行时间"
                        required={true}
                        className={styles.timeFormItem}
                    >
                        {
                            getFieldDecorator(`executeType`, {
                                rules: [
                                    {required: true, message: '必填'},
                                ],
                            })(
                                <RadioGroup>
                                    <Radio value={0}>立即执行</Radio>
                                    <Radio value={1}>定时执行</Radio>
                                </RadioGroup>,
                            )
                        }
                        {
                            <FormItem
                                style={{
                                    display: executeType.value === 1 ? '' : 'none',
                                }}
                                className={styles.datePicker}
                            >
                                {
                                    getFieldDecorator(`execute_time`, {
                                        validate: [
                                            {
                                                trigger: 'onChange',
                                                rules: [
                                                    {validator: this.checkDatePicker},
                                                ],
                                            },
                                        ],
                                    })(
                                        <DatePicker
                                            showTime={{
                                                format: 'HH:mm',
                                                defaultValue: moment().add(30, 'minutes'),
                                            }}
                                            disabledDate={this.disabledDate}
                                            disabledTime={this.disabledTime}
                                            format={'YYYY-MM-DD HH:mm'}
                                            style={{width: 354}}
                                        />,
                                    )
                                }
                            </FormItem>
                        }
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="可执行时间段"
                        className={styles.timeFormItem}
                    >
                        {
                            getFieldDecorator(`executeRangeType`, {
                                rules: [
                                    {required: true, message: '必填'},
                                ],
                            })(
                                <RadioGroup>
                                    <Radio value={0}>不限制</Radio>
                                    <Radio value={1}>限制时间段</Radio>
                                </RadioGroup>,
                            )
                        }
                        {
                            <FormItem
                                style={{display: executeRangeType.value === 1 ? '' : 'none'}}
                            >
                                {
                                    getFieldDecorator(`time`, {
                                        validate: [
                                            {
                                                trigger: 'onChange',
                                                rules: [
                                                    {validator: this.checkRangeTimePicker},
                                                ],
                                            },
                                        ],
                                    })(
                                        <RangeTimePicker
                                            className={styles.timePicker}
                                            minuteStep={10}
                                            format={'HH:mm'}
                                        />,
                                    )
                                }
                                <div style={{
                                    marginTop: 6,
                                    color: 'rgba(0, 0, 0, 0.45)',
                                    lineHeight: '1.5',
                                }}>每天执行群发的时间段，在这个时间段内进行群发，其他时间暂停，避免骚扰用户
                                </div>
                            </FormItem>
                        }
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="执行间隔"
                        extra={'每个微信群依次群发的时间间隔，在选择的时间范围内随机一个值'}
                    >
                        {
                            getFieldDecorator('between', {
                                rules: [
                                    {required: true, message: '必填'},
                                ],
                            })(
                                <Slider
                                    className={styles.slider}
                                    range
                                    marks={{
                                        2: '2s',
                                        900: '900s',
                                    }}
                                    max={900}
                                    step={1}
                                    min={2}
                                    tipFormatter={(value) => {
                                        return `${value}s`
                                    }}
                                />,
                            )
                        }
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="消息间隔"
                        extra={'每条消息依次群发的间隔在消息间隔中取随机值'}
                    >
                        {
                            getFieldDecorator('messageBetween', {
                                rules: [
                                    {required: true, message: '必填'},
                                ],
                            })(
                                <Slider
                                    className={styles.slider}
                                    range
                                    marks={{
                                        2: '2s',
                                        90: '90s',
                                    }}
                                    max={90}
                                    step={1}
                                    min={2}
                                    tipFormatter={(value) => {
                                        return `${value}s`
                                    }}
                                />,
                            )
                        }
                    </FormItem>
                    <FormItem className={styles.footer}>
                        <Button
                            loading={this.props.submitLoading}
                            type="primary"
                            htmlType="submit"
                            className={styles.btn}
                        >
                            确定
                        </Button>
                        <Button
                            loading={this.props.submitLoading}
                            className={styles.btn}
                            onClick={this.props.prev}
                        >
                            上一步
                        </Button>
                        <Button
                            loading={this.props.submitLoading}
                            onClick={this.props.cancel}
                        >
                            取消
                        </Button>
                    </FormItem>
                </Form>
                <Modal
                    visible={previewVisible}
                    footer={null}
                    onCancel={this.handleCancelPreview}
                >
                    <img style={{width: '100%'}} src={previewImage} alt="image"/>
                </Modal>
            </div>
        )
    }
}
