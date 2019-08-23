import React, {PureComponent} from 'react'
import {
    Form,
    Button,
    TimePicker,
    Checkbox,
    InputNumber,
    message,
    Input,
} from 'antd'
import {connect} from "dva/index"
import moment from 'moment'
import styles from './index.less'
import {hot} from "react-hot-loader"
import _ from "lodash"
import {forEachAntdFormFields} from 'utils'

const FormItem = Form.Item
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
@connect(({base, wx_friendAutoPass, loading}) => ({
    base,
    wx_friendAutoPass,
    changeStatusLoading: loading.effects['wx_friendAutoPass/changeStatus'],
    updateLoading: loading.effects['wx_friendAutoPass/update'],
    detailLoading: loading.effects['wx_friendAutoPass/detail'],
}))
@Form.create({
    mapPropsToFields(props) {
        const antdFrom = _.get(props, 'wx_friendAutoPass.formData')

        forEachAntdFormFields(antdFrom)

        return antdFrom
    },
    onFieldsChange(props, field, fields) {
        props.dispatch({
            type: 'wx_friendAutoPass/setStateByPath',
            payload: {
                path: 'formData',
                value: fields,
            },
        })
    },
})
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'wx_friendAutoPass/detail',
            payload: {},
        })
    }

    changeStatus = () => {
        this.props.dispatch({
            type: 'wx_friendAutoPass/changeStatus',
            payload: {},
        })
    }

    formatter = (value) => {
        return String(value).replace('.', '')
    }

    onChange = (path, value) => {
        this.props.dispatch({
            type: 'wx_friendAutoPass/setStateByPath',
            payload: {
                path,
                value,
            },
        })
    }

    changeRule = () => {
        const {
            isEdit,
        } = this.props.wx_friendAutoPass
        this.props.dispatch({
            type: 'wx_friendAutoPass/setStateByPath',
            payload: {
                path: 'isEdit',
                value: !isEdit,
            },
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields({force: true}, (err, values) => {
            if(!err) {
                const fetchOption = Object.assign({}, values)

                fetchOption.allowed_time_start = momentToNum(values.allowed_time_start)
                fetchOption.allowed_time_end = momentToNum(values.allowed_time_end)
                fetchOption.sex_limit_status = Number(values.sex_limit_status)
                fetchOption.pass_cipher_status = Number(values.pass_cipher_status)
                fetchOption.forbid_repeat_confirm = Number(values.forbid_repeat_confirm)
                fetchOption.sex_limit = this.getSexLimit(values.sex_limit)
                fetchOption.pass_cipher = values.pass_cipher.trim()
                fetchOption.duration = 1

                this.props.dispatch({
                    type: 'wx_friendAutoPass/update',
                    payload: fetchOption,
                    callback: () => {
                        message.success('创建成功')
                        this.props.dispatch({
                            type: 'wx_friendAutoPass/setStateByPath',
                            payload: {
                                path: 'isEdit',
                                value: false,
                            },
                        })
                    },
                })
            }
        })
    }

    getSexLimit = (data) => {
        const res = [1, 1, 1]
        data.forEach((item) => {
            res[sexLimitMap[item]] = 0
        })
        return res.join('')
    }

    momentToTime = (value) => {
        return moment.isMoment(value) ? value.format('HH:mm') : ''
    }

    checkSexLimitStatus = (rule, value, callback) => {
        callback()
        this.props.form.validateFields(['sex_limit'], {force: true})
    }

    checkTimerStartPicker = (rule, value, callback) => {
        callback()
        this.props.form.validateFields(['allowed_time_end'], {force: true})
    }

    checkPassCipherStatus = (rule, value, callback) => {
        callback()
        this.props.form.validateFields(['pass_cipher'], {force: true})
    }

    checkTimerEndPicker = (rule, value, callback) => {
        const {
            formData: {
                allowed_time_start,
                allowed_time_end,
            },
        } = this.props.wx_friendAutoPass
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

    checkSexLimit = (rule, value, callback) => {
        const {
            formData: {
                sex_limit_status,
            },
        } = this.props.wx_friendAutoPass
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
        } = this.props.wx_friendAutoPass
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

    cancel = () => {
        this.props.dispatch({
            type: 'wx_friendAutoPass/detail',
            payload: {},
            callback: () => {
                this.props.dispatch({
                    type: 'wx_friendAutoPass/setStateByPath',
                    payload: {
                        path: 'isEdit',
                        value: false,
                    },
                })
            },
        })
    }

    render() {
        const {
            isEdit,
            status,
            formData: {
                duration,
                allowed_time_start,
                allowed_time_end,
                auto_confirm_cnt,
                one_day_confirm_limit,
                sex_limit_status,
                pass_cipher_status,
                pass_cipher,
            },
        } = this.props.wx_friendAutoPass
        const {getFieldDecorator} = this.props.form

        return (
            <div className={styles.autoPass}>
                <div>
                    <Checkbox
                        disabled={this.props.changeStatusLoading}
                        checked={status === 1}
                        onChange={this.changeStatus}
                    >
                        开启此功能
                    </Checkbox>
                    <span className={styles.mark}>开启后，全部微信号默认开启自动通过好友功能；单个微信号可在【<span
                        className={styles.point}>微信号管理-智能管理</span>】中配置</span>
                </div>
                <Form className={styles.content} onSubmit={this.handleSubmit}>
                    <div>
                        <span className={styles.title}>默认规则</span>
                        {
                            status === 1 && (
                                <span
                                    className={styles.changeRule}
                                    style={{'display': isEdit ? 'none' : 'inline-block'}}
                                    onClick={this.changeRule}
                                >
                                    更改规则
                                </span>
                            )
                        }
                    </div>
                    <div className={styles.rules}>
                        <div className={styles.rulesLine}>
                            每
                            <span
                                className={styles.des}
                            >
                                1
                            </span>
                            {/*{*/}
                            {/*isEdit ? (*/}
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
                            {/*) : (*/}
                            {/*<span*/}
                            {/*className={styles.des}*/}
                            {/*>*/}
                            {/*{duration.value}*/}
                            {/*</span>*/}
                            {/*)*/}
                            {/*}*/}
                            小时自动通过好友
                            {
                                isEdit ? (
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
                                ) : (
                                    <span
                                        className={styles.des}
                                    >
                                        {auto_confirm_cnt.value}
                                    </span>
                                )
                            }
                            位
                        </div>
                        <div className={styles.rulesLine}>
                            自动通过时间段
                            {
                                isEdit ? (
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
                                ) : (
                                    <span
                                        className={styles.des}
                                    >
                                        {this.momentToTime(allowed_time_start.value)}
                                    </span>
                                )
                            }
                            ~
                            {
                                isEdit ? (
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
                                    </FormItem>
                                ) : (
                                    <span
                                        className={styles.des}
                                    >
                                        {this.momentToTime(allowed_time_end.value)}
                                    </span>
                                )
                            }
                            <span className={styles.mark}>为避免被封号，请避免在半夜自动通过好友</span>
                        </div>
                        <div className={styles.rulesLine}>
                            每天自动通过上限
                            {
                                isEdit ? (
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
                                ) : (
                                    <span
                                        className={styles.des}
                                    >
                                        {one_day_confirm_limit.value}
                                    </span>
                                )
                            }
                        </div>
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
                                    <Checkbox
                                        disabled={!isEdit}
                                    >
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
                                        disabled={!isEdit}
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
                                    <Checkbox
                                        disabled={!isEdit}
                                    >
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
                                isEdit ? (
                                    <FormItem>
                                        {getFieldDecorator('pass_cipher', {
                                            rules: [
                                                {validator: this.checkPassCipher},
                                            ],
                                        })(
                                            <Input placeholder="请输入暗号，20字以内"/>,
                                        )}
                                    </FormItem>
                                ) : (
                                    <span
                                        className={styles.subItemsInput}
                                    >
                                        {pass_cipher.value}
                                    </span>
                                )
                            }
                        </div>
                        <div className={styles.rulesLine}>
                            <FormItem>
                                {getFieldDecorator('forbid_repeat_confirm', {
                                    valuePropName: 'checked',
                                })(
                                    <Checkbox
                                        disabled={!isEdit}
                                    >
                                        禁止重复添加
                                    </Checkbox>,
                                )}
                                <span className={styles.mark}>开启后，已经添加商家其他微信号的，不会自动通过</span>
                            </FormItem>
                        </div>
                    </div>
                    <div
                        style={{'display': !isEdit ? 'none' : 'inline-block'}}
                    >
                        <Button
                            type="primary"
                            className={styles.btn}
                            loading={this.props.updateLoading}
                            htmlType="submit"
                        >
                            保存
                        </Button>
                        <Button
                            onClick={this.cancel}
                            loading={this.props.detailLoading}
                        >
                            取消
                        </Button>
                    </div>
                </Form>
            </div>
        )
    }
}
