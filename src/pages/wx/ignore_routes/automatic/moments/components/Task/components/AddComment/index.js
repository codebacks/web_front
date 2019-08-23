import React from 'react'
import {connect} from "dva/index"
import {Modal, Form, message} from 'antd'
import Editor from 'components/Face/components/Editor'
import {commentEditorLimit} from '../../../../config'
import styles from './index.scss'

const FormItem = Form.Item

@connect(({loading}) => ({
    addLoading: loading.effects['wx_moments_comment/addComment'],
}))
@Form.create()
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}

    validatorEditor = (rule, value, callback) => {
        const len = Editor.computeMsgLength(value)
        if (!len) {
            callback('请输入追评内容')
            return
        }
        if (len > commentEditorLimit) {
            callback(`字数不超过${commentEditorLimit}字`)
            return
        }
        callback()
    }

    handleSubmit = (e) => {
        if (this.props.addLoading) {
            return
        }
        e.preventDefault()
        const {form, dispatch} = this.props
        form.validateFields({force: true}, (err, values) => {
            const content = Editor.htmlToMsg(values.add_comment)
            if (!err) {
                dispatch({
                    type: 'wx_moments_comment/addComment',
                    payload: {
                        id: this.props.record.id,
                        body: {
                            content: content
                        }
                    },
                    callback: () => {
                        this.props.onOk()
                        message.success('新建成功', 1)
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
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        }

        const {visible, addLoading} = this.props
        const {getFieldDecorator} = this.props.form

        return (
            <Modal
                centered={true}
                maskClosable={false}
                width={560}
                visible={visible}
                title="新建追评"
                wrapClassName={styles.commentWrapper}
                confirmLoading={addLoading}
                onOk={this.handleSubmit}
                onCancel={this.handleCancel}
            >
                <Form>
                    <FormItem
                        {...formItemLayout}
                        label="追评内容"
                        required={true}
                    >
                        {getFieldDecorator('add_comment',{
                            validate: [
                                {
                                    trigger: 'onChange',
                                    rules: [
                                        {validator: this.validatorEditor},
                                    ],
                                },
                            ],
                        })(
                            <Editor
                                placeholder={`限制${commentEditorLimit}个字`}
                                onChange={this.handleChange}
                                extend={<span/>}
                                disableKeyDown={true}
                                className={styles.editor}
                            />
                        )}

                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
