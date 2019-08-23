import React, {PureComponent} from 'react'
import {
    Form,
    TimePicker,
    Checkbox,
    InputNumber,
    message,
    Radio,
    Input,
} from 'antd'
import {connect} from "dva/index"
import moment from 'moment'
import styles from './index.less'
import {hot} from "react-hot-loader"
import _ from "lodash"
import {forEachAntdFormFields} from 'utils'
import getRef from 'hoc/getRef'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group

function momentToNum(value) {
    return value.hour() * 60 + value.minute()
}

const sexLimitMap = {
    '未知': 0,
    '男': 1,
    '女': 2,
}

@hot(module)
@connect(({base, wx_weChatsAutoPass}) => ({
    base,
    wx_weChatsAutoPass,
}))
@Form.create({
    mapPropsToFields(props) {
        const antdFrom = _.get(props, 'wx_weChatsAutoPass.formData')

        forEachAntdFormFields(antdFrom)

        return antdFrom
    },
    onFieldsChange(props, field, fields) {
        props.dispatch({
            type: 'wx_weChatsAutoPass/setStateByPath',
            payload: {
                path: 'formData',
                value: fields,
            },
        })
    },
})
@getRef()
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'wx_weChatsAutoPass/detail',
            payload: {},
        })
    }

    changeStatus = () => {
        this.props.dispatch({
            type: 'wx_weChatsAutoPass/changeStatus',
            payload: {},
        })
    }

    formatter = (value) => {
        return String(value).replace('.', '')
    }

    onChange = (path, value) => {
        this.props.dispatch({
            type: 'wx_weChatsAutoPass/setStateByPath',
            payload: {
                path,
                value,
            },
        })
    }

    getSexLimit = (data) => {
        const res = [1, 1, 1]
        data.forEach((item) => {
            res[sexLimitMap[item]] = 0
        })
        return res.join('')
    }

    handleSubmit = (cb) => {
        const {
            formData: {
                wx_setting_type,
                status,
            },
            originalDefaultRule,
            uin,
            autoConfirm,
        } = this.props.wx_weChatsAutoPass
        const body = {
            uin,
        }
        if(wx_setting_type.value === '0') {
            Object.assign(body, originalDefaultRule)
            body.wx_setting_type = 0
            this.update(body, cb)
        }else if(wx_setting_type.value === '1') {
            if(!status.value) {
                Object.assign(body, autoConfirm)
                body.status = 0
                body.wx_setting_type = 1
                this.update(body, cb)
            }else {
                this.props.form.validateFields({force: true}, (err, values) => {
                    if(!err) {
                        Object.assign(body, values)
                        body.allowed_time_start = momentToNum(values.allowed_time_start)
                        body.allowed_time_end = momentToNum(values.allowed_time_end)
                        body.sex_limit_status = Number(values.sex_limit_status)
                        body.pass_cipher_status = Number(values.pass_cipher_status)
                        body.forbid_repeat_confirm = Number(values.forbid_repeat_confirm)
                        body.sex_limit = this.getSexLimit(values.sex_limit)
                        body.pass_cipher = values.pass_cipher.trim()
                        body.status = 1
                        body.wx_setting_type = 1
                        body.duration = 1
                        this.update(body, cb)
                    }
                })
            }
        }
    }

    update = (body, cb) => {
        this.props.dispatch({
            type: 'wx_weChatsAutoPass/wechatUpdate',
            payload: body,
            callback: () => {
                message.success('成功')
                cb && cb()
            },
        })
    }

    momentToTime = (value) => {
        return moment.isMoment(value) ? value.format('HH:mm') : ''
    }

    checkTimerStartPicker = (rule, value, callback) => {
        callback()
        this.props.form.validateFields(['allowed_time_end'], {force: true})
    }

    checkSexLimitStatus = (rule, value, callback) => {
        callback()
        this.props.form.validateFields(['sex_limit'], {force: true})
    }

    checkPassCipherStatus = (rule, value, callback) => {
        callback()
        this.props.form.validateFields(['pass_cipher'], {force: true})
    }

    checkSexLimit = (rule, value, callback) => {
        const {
            formData: {
                sex_limit_status,
            },
        } = this.props.wx_weChatsAutoPass
        if(!sex_limit_status.value) {
            callback()
        }else {
            if(value.length === 0) {
                callback('必选')
            }else {
                callback()
            }
        }
    }

    checkPassCipher = (rule, value, callback) => {
        const {
            formData: {
                pass_cipher_status,
            },
        } = this.props.wx_weChatsAutoPass
        if(!pass_cipher_status.value) {
            callback()
        }else {
            value = value.trim()
            if(!value) {
                callback('必选')
            }else if(value.length > 20) {
                callback('20字以内')
            }else {
                callback()
            }
        }
    }

    checkTimerEndPicker = (rule, value, callback) => {
        const {
            formData: {
                allowed_time_start,
                allowed_time_end,
            },
        } = this.props.wx_weChatsAutoPass
        if(!allowed_time_start.value) {
            callback()
            return
        }

        if(momentToNum(allowed_time_start.value) > momentToNum(allowed_time_end.value)) {
            callback('起始时间大于结束时间')
            return
        }
        callback()
    }

    renderDefaultRule = () => {
        const {
            defaultRule,
            formData: {
                wx_setting_type,
            },
        } = this.props.wx_weChatsAutoPass
        return (
            <div
                className={styles.rules}
                style={{'display': wx_setting_type.value === '0' ? 'block' : 'none'}}
            >
                <div className={styles.rulesLine}>
                    状态：{defaultRule.status === 0 ? '关闭' : '开启'}
                </div>
                <div className={styles.rulesLine}>
                    每
                    <span
                        className={styles.des}
                    >
                        {defaultRule.duration}
                    </span>
                    小时自动通过好友
                    <span
                        className={styles.des}
                    >
                        {defaultRule.auto_confirm_cnt}
                    </span>
                    位
                </div>
                <div className={styles.rulesLine}>
                    自动通过时间段
                    <span
                        className={styles.des}
                    >
                        {this.momentToTime(defaultRule.allowed_time_start)}
                    </span>
                    ~
                    <span
                        className={styles.des}
                    >
                        {this.momentToTime(defaultRule.allowed_time_end)}
                    </span>
                    为避免被封号，请避免在半夜自动通过好友
                </div>
                <div className={styles.rulesLine}>
                    每天自动通过上限
                    <span
                        className={styles.des}
                    >
                        {defaultRule.one_day_confirm_limit}
                    </span>
                </div>
                <div>
                    <span className={styles.title}>好友限制</span>
                </div>
                <div className={styles.rulesLine}>
                    <Checkbox
                        disabled={true}
                        checked={defaultRule.sex_limit_status}
                    >
                        禁止通过性别
                    </Checkbox>
                    <span className={styles.mark}>以下性别的好友不允许自动通过</span>
                </div>
                <div
                    className={`${styles.rulesLine} ${styles.subItems}`}
                    style={{'display': defaultRule.sex_limit_status ? 'block' : 'none'}}
                >
                    <CheckboxGroup
                        disabled={true}
                        value={defaultRule.sex_limit}
                        options={[
                            '未知',
                            '男',
                            '女',
                        ]}
                    />
                </div>
                <div className={styles.rulesLine}>
                    <Checkbox
                        disabled={true}
                        checked={defaultRule.pass_cipher_status}
                    >
                        通过暗号
                    </Checkbox>
                    <span className={styles.mark}>留言中需包含暗号内容才会自动通过</span>
                </div>
                <div
                    className={`${styles.rulesLine} ${styles.subItemsInput}`}
                    style={{'display': defaultRule.pass_cipher_status ? 'block' : 'none'}}
                >
                    <span
                        className={styles.subItemsInput}
                    >
                        {defaultRule.pass_cipher}
                    </span>
                </div>
                <div className={styles.rulesLine}>
                    <Checkbox
                        disabled={true}
                        checked={defaultRule.forbid_repeat_confirm}
                    >
                        禁止重复添加
                    </Checkbox>
                    <span className={styles.mark}>开启后，已经添加商家其他微信号的，不会自动通过</span>
                </div>
            </div>
        )
    }

    renderCustomRule = () => {
        const {getFieldDecorator} = this.props.form
        const {
            formData: {
                status,
                wx_setting_type,
                sex_limit_status,
                pass_cipher_status,
            },
        } = this.props.wx_weChatsAutoPass

        return (
            <div
                style={{'display': wx_setting_type.value === '1' ? 'block' : 'none'}}
            >
                <div className={styles.rules}>
                    <FormItem>
                        {getFieldDecorator('status', {
                            valuePropName: 'checked',
                        })(
                            <Checkbox>
                                开启此功能
                            </Checkbox>,
                        )}
                    </FormItem>
                </div>
                <div
                    className={styles.rules}
                    style={{
                        'display': status.value ? 'block' : 'none',
                    }}
                >
                    <div className={styles.rulesLine}>
                        每
                        <span
                            className={styles.des}
                        >
                            1
                        </span>
                        {/*<FormItem*/}
                        {/*className={styles.input}*/}
                        {/*>*/}
                        {/*{*/}
                        {/*getFieldDecorator('duration', {*/}
                        {/*rules: [*/}
                        {/*{required: true, message: '必填'},*/}
                        {/*],*/}
                        {/*})(*/}
                        {/*<InputNumber*/}
                        {/*style={{width: '100%'}}*/}
                        {/*min={1}*/}
                        {/*max={24}*/}
                        {/*step={1}*/}
                        {/*formatter={this.formatter}*/}
                        {/*/>,*/}
                        {/*)*/}
                        {/*}*/}
                        {/*</FormItem>*/}
                        小时自动通过好友
                        <FormItem
                            className={styles.input}
                        >
                            {
                                getFieldDecorator('auto_confirm_cnt', {
                                    rules: [
                                        {required: true, message: '必填'},
                                    ],
                                })(
                                    <InputNumber
                                        min={1}
                                        style={{width: '100%'}}
                                        max={100}
                                        step={1}
                                        formatter={this.formatter}
                                    />,
                                )
                            }
                        </FormItem>
                        位
                    </div>
                    <div className={styles.rulesLine}>
                        自动通过时间段
                        <FormItem
                            className={styles.timer}
                        >
                            {
                                getFieldDecorator('allowed_time_start', {
                                    validateFirst: true,
                                    rules: [
                                        {required: true, message: '必填'},
                                        {validator: this.checkTimerStartPicker},
                                    ],
                                })(
                                    <TimePicker
                                        style={{width: '100%'}}
                                        minuteStep={1}
                                        format={'HH:mm'}
                                    />,
                                )
                            }
                        </FormItem>
                        ~
                        <FormItem
                            className={styles.timer}
                        >
                            {
                                getFieldDecorator('allowed_time_end', {
                                    validateFirst: true,
                                    rules: [
                                        {required: true, message: '必填'},
                                        {validator: this.checkTimerEndPicker},
                                    ],
                                })(
                                    <TimePicker
                                        style={{width: '100%'}}
                                        minuteStep={1}
                                        format={'HH:mm'}
                                    />,
                                )
                            }
                        </FormItem>为避免被封号，
                        <div>请避免在半夜自动通过好友</div>
                    </div>
                    <div className={styles.rulesLine}>
                        每天自动通过上限
                        <FormItem
                            className={styles.input}
                        >
                            {
                                getFieldDecorator('one_day_confirm_limit', {
                                    rules: [
                                        {required: true, message: '必填'},
                                    ],
                                })(
                                    <InputNumber
                                        min={1}
                                        style={{width: '100%'}}
                                        max={500}
                                        step={1}
                                        formatter={this.formatter}
                                    />,
                                )
                            }
                        </FormItem>
                    </div>
                    <div>
                        <span className={styles.title}>好友限制</span>
                    </div>
                    <div className={styles.rules}>
                        <div className={styles.rulesLine}>
                            <FormItem>
                                {getFieldDecorator('sex_limit_status', {
                                    valuePropName: 'checked',
                                    rules: [
                                        {validator: this.checkSexLimitStatus},
                                    ],
                                })(
                                    <Checkbox>
                                        禁止通过性别
                                    </Checkbox>,
                                )}
                                <span className={styles.mark}>以下性别的好友不允许自动通过</span>
                            </FormItem>
                        </div>
                        <div
                            className={`${styles.rulesLine} ${styles.subItems}`}
                            style={{'display': sex_limit_status.value ? 'block' : 'none'}}
                        >
                            <FormItem>
                                {getFieldDecorator('sex_limit', {
                                    rules: [
                                        {validator: this.checkSexLimit},
                                    ],
                                })(
                                    <CheckboxGroup
                                        options={[
                                            '未知',
                                            '男',
                                            '女',
                                        ]}
                                    />,
                                )}
                            </FormItem>
                        </div>
                        <div className={styles.rulesLine}>
                            <FormItem>
                                {getFieldDecorator('pass_cipher_status', {
                                    valuePropName: 'checked',
                                    rules: [
                                        {validator: this.checkPassCipherStatus},
                                    ],
                                })(
                                    <Checkbox>
                                        通过暗号
                                    </Checkbox>,
                                )}
                                <span className={styles.mark}>留言中需包含暗号内容才会自动通过</span>
                            </FormItem>
                        </div>
                        <div
                            className={`${styles.rulesLine} ${styles.subItemsInput}`}
                            style={{'display': pass_cipher_status.value ? 'block' : 'none'}}
                        >
                            {
                                <FormItem>
                                    {getFieldDecorator('pass_cipher', {
                                        rules: [
                                            {validator: this.checkPassCipher},
                                        ],
                                    })(
                                        <Input placeholder="请输入暗号，20字以内"/>,
                                    )}
                                </FormItem>
                            }
                        </div>
                        <div className={styles.rulesLine}>
                            <FormItem>
                                {getFieldDecorator('forbid_repeat_confirm', {
                                    valuePropName: 'checked',
                                })(
                                    <Checkbox>
                                        禁止重复添加
                                    </Checkbox>,
                                )}
                                <span className={styles.mark}>开启后，已经添加商家其他微信号的，不会自动通过</span>
                            </FormItem>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        const {getFieldDecorator} = this.props.form

        const formItemLayout = {
            labelCol: {span: 2},
            wrapperCol: {span: 21, offset: 1},
        }

        return (
            <div className={styles.autoPass}>
                <Form className={styles.content}>
                    <FormItem
                        {...formItemLayout}
                        label="自动通过"
                    >
                        {getFieldDecorator('wx_setting_type')(
                            <RadioGroup>
                                <Radio value="0">默认规则</Radio>
                                <Radio value="1">自定义</Radio>
                            </RadioGroup>,
                        )}
                        {
                            this.renderDefaultRule()
                        }
                        {
                            this.renderCustomRule()
                        }
                    </FormItem>
                </Form>
            </div>
        )
    }
}
