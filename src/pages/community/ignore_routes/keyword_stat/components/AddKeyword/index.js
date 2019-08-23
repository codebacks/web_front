import React, {Component} from 'react'
import {connect} from "dva/index"
import {Modal, Form, Input, message} from 'antd'
import helper from 'utils/helper'
import styles from './index.less'

const FormItem = Form.Item
const wordLimit = 30

@connect(({loading}) => ({
    addLoading: loading.effects['community_keyword_mgt/create'],
}))
@Form.create()
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: ''
        }
    }

    componentDidMount() {
        const {setFieldsValue, getFieldValue} = this.props.form
        let keyword = getFieldValue('keyword') || ''
        setFieldsValue({
            keyword: keyword
        })
    }

    validatorKeyWord = (rule, value, callback) => {
        if (!value) {
            callback('请输入关键词')
            return
        }
        if(helper.isEmojiCharacter(value)) {
            callback('不支持输入表情符号')
            return
        }
        callback()
    }

    handleSubmit = (e) => {
        if (this.props.addLoading) {
            return
        }
        const {form, dispatch} = this.props
        form.validateFields({force: true}, (err, values) => {
            const keyword = values.keyword
            if (!err) {
                dispatch({
                    type: 'community_keyword_mgt/create',
                    payload: {
                        body: {
                            keyword: keyword
                        }
                    },
                    callback: () => {
                        message.success('新建成功')
                        form.setFieldsValue({
                            keyword: '',
                        })
                        this.props.onOk()
                    }
                })
            }
        })
    }

    handleCancel = () =>{
        this.props.onCancel()
    }

    render() {
        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
        }

        const {visible, addLoading} = this.props
        const {getFieldDecorator, getFieldValue} = this.props.form

        const suffix = <span className={styles.suffix}>
            {`${getFieldValue('keyword') ? getFieldValue('keyword').length : 0}/${wordLimit}`}
        </span>

        return (
            <Modal
                centered={true}
                maskClosable={false}
                width={480}
                visible={visible}
                title="新建关键词"
                wrapClassName={styles.keywordWrapper}
                confirmLoading={addLoading}
                onOk={this.handleSubmit}
                onCancel={this.handleCancel}
            >
                <Form>
                    <FormItem
                        {...formItemLayout}
                        label="添加关键词"
                    >
                        {getFieldDecorator('keyword',{
                            rules: [
                                {
                                    required: true,
                                    validator: this.validatorKeyWord
                                },
                            ],
                            normalize: value => {
                                return value.replace(/(^\s*)|(\s*$)/g, '')
                            },
                        })(
                            <Input
                                className={styles.inputSuffix}
                                placeholder={`请输入关键词，限${wordLimit}个字以内`}
                                maxLength={wordLimit}
                                suffix={suffix}
                                autoComplete="off"
                                onPressEnter={this.handleSubmit}
                            />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
