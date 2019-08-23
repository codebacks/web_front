import React, {Component} from 'react'
import {connect} from 'dva/index'
import {Popover, Button, Icon, Form, Input, message} from 'antd'
import helper from 'wx/utils/helper'
import {titleMaxLength} from "../../config"
import styles from './index.scss'

const FormItem = Form.Item
const { TextArea } = Input

@connect(({loading}) => ({
    updateLoading: loading.effects['wx_material_library/update'],
}))
@Form.create()
export  default class Edit extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}

    validatorTitle = (rule, value, callback) => {
        if (!value) {
            callback('请输入标题')
            return
        }
        callback()
    }

    handleSubmit = (e) => {
        e.preventDefault()
        const {form, dispatch, record} = this.props
        form.validateFields({force: true}, (err, values) => {
            const body = {
                url: helper.getMediaUrl(record),
                type: record.type,
                title: values.title
            }
            if (!err) {
                dispatch({
                    type: 'wx_material_library/update',
                    payload: {
                        id: this.props.record.id,
                        body: body
                    },
                    callback: () => {
                        message.success('修改成功')
                        this.props.onOk(record, body)
                    }
                })
            }
        })
    }

    handleCancel = () =>{
        this.props.onCancel()
    }

    render() {
        const {visible, updateLoading, record, parent} = this.props
        const {getFieldDecorator} = this.props.form

        const formItemLayout = {
            labelCol: {span: 0},
            wrapperCol: {span: 24},
        }

        const content = <div className={styles.edit}>
            <Form>
                <FormItem
                    {...formItemLayout}
                    required={true}
                >
                    {getFieldDecorator('title',{
                        initialValue: helper.getMediaTitle(record),
                        validate: [
                            {
                                trigger: 'onChange',
                                rules: [
                                    {validator: this.validatorTitle},
                                ],
                            },
                        ],
                    })(
                        <TextArea autoComplete="off"
                            className={styles.textarea}
                            placeholder={`请输入素材标题，${titleMaxLength}字以内`}
                            maxLength={titleMaxLength}
                            onPressEnter={this.handleSubmit}
                        />
                    )}

                </FormItem>
            </Form>
            <div className={styles.footer}>
                <Button className={styles.ok}
                    type="primary"
                    size="small"
                    onClick={this.handleSubmit}
                >
                    {updateLoading ? <Icon type="loading"/> : '确定'}
                </Button>
                <Button className={styles.cancel}
                    onClick={this.handleCancel}
                    size="small"
                >取消</Button>
            </div>
        </div>

        return  <Popover
            title="素材标题"
            content={content}
            visible={visible}
            getPopupContainer={()=>document.getElementById(parent)}
        >
        </Popover>
    }
}

