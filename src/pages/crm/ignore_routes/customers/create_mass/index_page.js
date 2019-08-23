import React, {PureComponent} from 'react'
import {
    Form,
    Input,
    Button,
    Radio,
    DatePicker,
    message,
    Slider,
    Popconfirm,
    Checkbox,
} from 'antd'
import {connect} from "dva/index"
import moment from 'moment'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.less'
import {forEachAntdFormFields} from 'utils'
import _ from "lodash"
import config from 'community/common/config'
import RangeTimePicker from "components/RangeTimePicker"
import {safeJsonParse} from 'utils'
import router from 'umi/router'
import Messages from '../components/Messages'
import ContentHeader from 'business/ContentHeader'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const {DateTimeFormat} = config

@connect((
    {
        // base,
        crm_createMass,
        loading,
    },
) => ({
    // base,
    crm_createMass,
    submitLoading: loading.effects['crm_createMass/sentMsgHandleSubmit'],
}))
@documentTitleDecorator({
    title: '创建群发',
})
@Form.create({
    mapPropsToFields(props) {
        const antdFrom = _.get(props, 'crm_createMass.antdFrom', {})

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
            type: 'crm_createMass/setStateByPath',
            payload: {
                path: 'antdFrom',
                value: fields,
            },
        })
    },
})
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            riskTipChecked: false,
        }

        let {
            query: {
                group_id,
                searchParams,
            } = {},
        } = this.props.location

        if(group_id) {
            this.group_id = group_id
        }

        if(searchParams) {
            this.query = safeJsonParse(decodeURIComponent(searchParams))
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'crm_createMass/count',
            payload: {
                params: this.query,
                group_id: this.group_id,
            },
        })
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'crm_createMass/resetState',
        })
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
            return msg.common_msg_content
        })
    }

    handleSubmit = async (e) => {
        e && e.preventDefault()
        try {
            const formData = await this.validateForm()
            const {
                messages = [],
            } = this.props.crm_createMass

            if(!messages.length) {
                message.error('消息内容必填！')
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

            body['interval_min'] = formData.intervalBetween[0]
            body['interval_max'] = formData.intervalBetween[1]

            body['message_interval_min'] = formData.messageBetween[0]
            body['message_interval_max'] = formData.messageBetween[1]

            const format = 'HH:mm'

            if(formData['executeRangeType'] === 1) {
                body['time_from'] = formData.time[0].format(format)
                body['time_to'] = formData.time[1].format(format)
            }

            body['params'] = this.query
            body['group_id'] = this.group_id

            this.props.dispatch({
                type: 'crm_createMass/sentMsgHandleSubmit',
                payload: body,
                callback: () => {
                    message.success('创建成功')
                    router.push('/crm/mass_record')
                },
            })
        }catch(e) {
            console.log(e)
            // throw e
        }
    }

    checkRangeTimePicker = (rule, value, callback) => {
        const {antdFrom: {executeRangeType,}} = this.props.crm_createMass
        if(executeRangeType.value !== 1) {
            callback()
            return
        }

        if(!value) {
            callback('请选择时间')
        }else if(!value[0]) {
            callback('请选择开始时间')
        }else if(!value[1]) {
            callback('请选择结束时间')
        }else {
            if(value[0].valueOf() >= value[1].valueOf()) {
                callback('结束时间必须大于开始时间')
            }else {
                callback()
            }
        }
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
        } = this.props.crm_createMass

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

    disabledDate = (current) => {
        if(!current) {
            return
        }

        return current <= moment().startOf('day')
    }

    riskTipBtnClick = () => {
        this.setState({
            riskTipChecked: false,
        })
    }

    onRiskTipChange = (e) => {
        this.setState({
            riskTipChecked: e.target.checked,
        })
    }

    renderRiskTip = () => {
        return (
            <div className={styles.renderRiskTip}>
                <div>确定发布这个群发计划？</div>
                <div className={styles.content}>
                    因微信官方对批量群发消息的限制，如果发送频率过快，单次发送好友过多，有较大封号风险。不同微信号的风险不同，需要商家小批量测试验证后，再批量群发。
                </div>
                <Checkbox
                    checked={this.state.riskTipChecked}
                    onChange={this.onRiskTipChange}
                >
                    我已了解，继续发送
                </Checkbox>
            </div>
        )
    }

    riskTipClick = async () => {
        try {
            if(this.state.riskTipChecked) {
                await this.handleSubmit()
            }
        }catch(e) {
            console.log(e)
        }
    }

    needRiskTip = () => {
        const {
            antdFrom: {
                messageBetween = {},
                intervalBetween = {},
            } = {},
            count = 0,
            messages = [],
        } = this.props.crm_createMass

        return ((count * messages.length) > 500) || (messageBetween.value[0] < 10) || (intervalBetween.value[0] < 30)
    }

    cancel = () => {
        router.push('/crm/customers')
    }

    render() {
        const {getFieldDecorator} = this.props.form
        const {
            antdFrom: {
                executeType,
                executeRangeType,
            },
            count,
        } = this.props.crm_createMass

        const formItemLayout = {
            labelCol: {
                span: 4,
                style: {
                    width: '108px',
                },
            },
            wrapperCol: {span: 12},
        }

        return (
            <div className={styles.createMass}>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '客户管理',
                                path: '/crm/customers',
                            },
                            {
                                name: '创建群发',
                            },
                        ]
                    }
                />
                <div className={styles.title}>
                </div>
                <Form layout={'horizontal'} onSubmit={this.handleSubmit}>
                    <FormItem
                        {...formItemLayout}
                        label="用户总数"
                    >
                        {count}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="群发名称"
                    >
                        {
                            getFieldDecorator('title', {
                                rules: [
                                    {
                                        required: true,
                                        message: '必填',
                                        transform: (value) => {
                                            return String(value).trim()
                                        },
                                    },
                                    {
                                        pattern: /^.{1,30}$/,
                                        message: '限1-30个字',
                                    },
                                ],
                            })(
                                <Input placeholder="请输入群发名称，30字以内"/>,
                            )
                        }
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={`消息内容`}
                        required={true}
                    >
                        <Messages/>
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
                        required={true}
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
                                style={{display: executeRangeType.value === 1 ? '' : 'none',}}
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
                                <div style={{marginTop: 6,color: 'rgba(0, 0, 0, 0.45)',lineHeight: '1.5'}}>服务器可在这个时间段内进行群发，若当前不在这个时间范围将顺延到后一天的可执行时间段进行群发</div>
                            </FormItem>

                        }
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="微信号间隔"
                        extra={'每个微信号依次群发的时间间隔，在选择的时间范围内随机一个值'}
                    >
                        {
                            getFieldDecorator('intervalBetween', {
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
                        extra={'每条消息依次群发的时间间隔，在选择的时间范围内随机一个值'}
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
                        {
                            this.needRiskTip()
                                ? (
                                    <Popconfirm
                                        placement="topLeft"
                                        title={this.renderRiskTip()}
                                        onConfirm={this.riskTipClick}
                                        okButtonProps={{
                                            disabled: !this.state.riskTipChecked,
                                        }}
                                        okText="发送"
                                        cancelText=""
                                    >
                                        <Button
                                            loading={this.props.submitLoading}
                                            onClick={this.riskTipBtnClick}
                                            type="primary"
                                            className={styles.btn}
                                        >
                                            发布
                                        </Button>
                                    </Popconfirm>
                                )
                                : (
                                    <Button
                                        loading={this.props.submitLoading}
                                        type="primary"
                                        htmlType="submit"
                                        className={styles.btn}
                                    >
                                        发布
                                    </Button>
                                )
                        }
                        <Button
                            loading={this.props.submitLoading}
                            onClick={this.cancel}
                        >
                            取消
                        </Button>
                    </FormItem>
                </Form>
            </div>
        )
    }
}
