/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import {Form, message, Radio, Select} from 'antd'
import toggleModalWarp from 'hoc/toggleModalWarp'
import {hot} from 'react-hot-loader'
import {connect} from 'dva'
import styles from './index.less'

const FormItem = Form.Item
const Option = Select.Option

@hot(module)
@connect(({wx_wechats, loading}) => ({
    wx_wechats,
    settingAutoReplyTemplatesLoading: loading.effects['wx_wechats/settingAutoReplyTemplates'],
    batchSetReplyConfigLoading: loading.effects['wx_wechats/batchSetReplyConfig'],
}))
@Form.create()
@toggleModalWarp({
    setModalOption: ({highestOption, modalStateOption, modalOption, option, props, state}) => {
        return {
            ...option,
            ...modalOption,
            ...modalStateOption,
            ...highestOption,
            ...{
                title: '批量配置自动回复',
                width: 520,
                destroyOnClose: true,
                maskClosable: false,
                className: styles.main,
                confirmLoading: props.batchSetReplyConfigLoading,
            },
        }
    },
})
export default class Index extends React.Component {
    constructor(props) {
        super(props)
        props.setModalOkFn(this.handleOk)
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'wx_wechats/settingAutoReplyTemplates',
            payload: {},
        })
    }

    handleOk = (e) => {
        e.preventDefault()
        this.props.form.validateFields({force: true}, (err, values) => {
            if (!err) {
                const uins = this.getUins()
                if (!uins.length) {
                    message.error('请选择微信号')
                    return
                }

                const formData = {
                    status: Number(values.status),
                    uins,
                }

                if (typeof values.wx_setting_type !== 'undefined') {
                    formData.wx_setting_type = Number(values.wx_setting_type)
                }

                if (typeof values.template_id !== 'undefined') {
                    formData.template_id = Number(values.template_id)
                }

                this.props.dispatch({
                    type: 'wx_wechats/batchSetReplyConfig',
                    payload: {
                        body: formData,
                    },
                    callback: () => {
                        message.success('更新成功')
                        this.props.refresh()
                        this.handleCancel()
                    },
                })
            }
        })
    }

    getUins = () => {
        const {selectedRowKeys, allUsers} = this.props.wx_wechats
        const uins = []

        selectedRowKeys.forEach((key) => {
            const item = allUsers.find(item => item.id === key)
            if (item) {
                uins.push(Number(item.uin))
            }
        })

        return uins
    }

    wxSettingTypeValidator = (rule, value, callback) => {
        const {form} = this.props
        const {getFieldValue} = form
        const status = getFieldValue('status')
        if (status === '1' && !value) {
            callback('必填')
        }else {
            callback()
        }
    }

    templateValidator = (rule, value, callback) => {
        const {form} = this.props
        const {getFieldValue} = form
        const status = getFieldValue('status')
        const wxSettingType = getFieldValue('wx_setting_type')
        if ((status === '1' && wxSettingType === '2') && !value) {
            callback('必填')
        }else {
            callback()
        }
    }

    handleCancel = () => {
        this.props.onModalCancel()
    }

    render() {
        const {wx_wechats, form} = this.props
        const {templates, selectedRowKeys = []} = wx_wechats
        const {getFieldDecorator, getFieldValue, settingAutoReplyTemplatesLoading} = form

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        }

        const status = getFieldValue('status')
        const wxSettingType = getFieldValue('wx_setting_type')

        return (
            <div>
                <div className={styles.title}>
                    已选择{selectedRowKeys.length}个微信号
                </div>
                <Form layout={'horizontal'}  {...formItemLayout}>
                    <FormItem label="设置状态" required={true}>
                        {getFieldDecorator('status', {
                            rules: [
                                {
                                    required: true,
                                    message: '请选择',
                                },
                            ],
                        })(
                            <Radio.Group>
                                <Radio value={'1'}>
                                    全部开启
                                </Radio>
                                <Radio value={'0'}>
                                    全部关闭
                                </Radio>
                            </Radio.Group>,
                        )}
                    </FormItem>
                    {
                        status === '1' && (
                            <FormItem label="设置状态" required={true}>
                                {getFieldDecorator('wx_setting_type', {
                                    validate: [
                                        {
                                            trigger: 'onChange',
                                            rules: [
                                                {
                                                    validator: this.wxSettingTypeValidator,
                                                },
                                            ],
                                        },
                                    ],
                                })(
                                    <Radio.Group>
                                        <Radio value={'0'}>
                                            全局配置
                                        </Radio>
                                        <Radio value={'2'}>
                                            其他模板
                                        </Radio>
                                    </Radio.Group>,
                                )}
                            </FormItem>
                        )
                    }
                    {
                        (status === '1' && wxSettingType === '2') && (
                            <FormItem label="请选择模板" required={true}>
                                {getFieldDecorator('template_id', {
                                    validate: [
                                        {
                                            trigger: 'onChange',
                                            rules: [
                                                {
                                                    validator: this.templateValidator,
                                                },
                                            ],
                                        },
                                    ],
                                })(
                                    <Select
                                        showSearch
                                        placeholder="请选择模板"
                                        optionFilterProp="children"
                                        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        loading={settingAutoReplyTemplatesLoading}
                                    >
                                        {templates.map((item) => {
                                            return (
                                                <Option
                                                    key={item.id}
                                                    value={'' + item.id}
                                                >
                                                    {item.title}
                                                </Option>
                                            )
                                        })}
                                    </Select>,
                                )}
                            </FormItem>
                        )
                    }
                </Form>
            </div>
        )
    }
}
