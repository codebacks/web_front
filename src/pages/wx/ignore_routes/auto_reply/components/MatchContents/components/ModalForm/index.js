/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React from 'react'
import {
    Form,
    Radio,
    message, Input,
} from 'antd'
import modalWarp from 'hoc/modalWarp'
import styles from './index.less'

const FormItem = Form.Item
const RadioGroup = Radio.Group

@modalWarp()
@Form.create()
export default class Index extends React.PureComponent {
    static defaultProps = {
        record: {
            content: '',
            match_type: 0,
        },
    }

    constructor(props) {
        super(props)
        props.setModalOkFn(this.handleOk)
    }

    handleOk = (e) => {
        this.props.form.validateFields({force: true}, (err, values) => {
            if(!err) {
                const {record, userId} = this.props
                values.user_id = userId
                values.content = values.content.trim()
                if(typeof record.id !== 'undefined') {
                    values.id = record.id
                    this.props.dispatch({
                        type: 'wx_Rules/edit',
                        payload: values,
                    })
                    message.success('更新成功！')
                }else {
                    this.props.dispatch({
                        type: 'wx_Rules/add',
                        payload: values,
                    })
                    message.success('创建成功！')
                }

                this.handleCancel()
            }
        })
    }

    handleCancel = () => {
        this.props.onModalCancel()
    }

    typeCheck = (rule, value, callback) => {
        callback()
        this.props.form.validateFields(['content'], {force: true})
    }

    checkEditor = (rule, value, callback) => {
        const {getFieldValue} = this.props.form
        let text = '中文、英文、数字、1-30'
        let re = /^[a-zA-Z0-9\u4E00-\u9FA5\uF900-\uFA2D]{1,30}$/
        if(getFieldValue('match_type') === 1) {
            re = /^[a-zA-Z0-9\u4E00-\u9FA5\uF900-\uFA2D\s]{1,30}$/
            text = '中文、英文、数字、空格、1-30'
        }
        value = value.trim()
        if(!re.test(value)) {
            callback(text)
        }else {
            callback()
        }
    }

    render() {
        const {record, form} = this.props
        const {getFieldDecorator, getFieldValue} = form
        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 18},
        }

        const text = getFieldValue('match_type') === 1 ? '多个关键内容请使用空格分开' : '请勿输入标点符号'
        const matchTypeText = getFieldValue('match_type') === 1 ? (
            <div>
                <div>
                    此规则下好友发送的消息<span className={styles.extrude}>包含</span>关键内容即可触发自动回复；
                </div>
                <div>
                    在一个关键内容中设置多个关键词则需包含多个关键词；
                </div>
                <div>
                    例：设置关键内容：你好 订单；那么客户发送：你好吖，我的订单是XXX。会自动回复；客户发送：你好，不会自动回复
                </div>
            </div>
        ) : (
            <div>
                <div>
                    此规则下好友发送的消息需与关键内容<span className={styles.extrude}>完全一致</span>才可触发回复内容
                </div>
                <div>
                    例：设置关键内容：你好；客户发送：你好，会自动回复；客户发送：你好啊，不会自动回复
                </div>
            </div>
        )

        return (
            <Form
                className={styles.newFriendForm}
            >
                <FormItem
                    {...formItemLayout}
                    label="匹配规则"
                    extra={matchTypeText}
                >
                    {
                        getFieldDecorator(`match_type`, {
                            initialValue: record.match_type,
                            rules: [
                                {required: true, message: '必填'},
                                {validator: this.typeCheck},
                            ],
                        })(
                            <RadioGroup
                            >
                                <Radio value={0}>完全匹配</Radio>
                                <Radio value={1}>包含匹配</Radio>
                            </RadioGroup>,
                        )
                    }
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="关键内容"
                    extra={text}
                >
                    {
                        getFieldDecorator(`content`, {
                            initialValue: record.content,
                            validate: [
                                {
                                    trigger: 'onChange',
                                    rules: [
                                        {validator: this.checkEditor},
                                    ],
                                },
                            ],
                        })(
                            <Input placeholder="输入关键内容，30字以内"/>,
                        )
                    }
                </FormItem>
            </Form>
        )
    }
}

