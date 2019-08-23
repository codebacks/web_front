import React, {Component} from 'react'
import {connect} from "dva/index"
import {Modal, Form, Select, Checkbox, Icon, message} from 'antd'
import styles from './index.scss'

const FormItem = Form.Item
const Option = Select.Option

@connect(({loading, crm_add_fans_template}) => ({
    crm_add_fans_template,
    templatesLoading: loading.effects['crm_add_fans_template/listSummary'],
    setLoading: loading.effects['crm_add_fans_initiative/batchSet'],
}))
@Form.create()
export default class Setting extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.loadTemplates()
    }

    loadTemplates = () => {
        this.props.dispatch({
            type: 'crm_add_fans_template/listSummary',
            payload: {}
        })
    }

    handleSubmit = (e) => {
        if (this.props.setLoading) {
            return
        }
        e.preventDefault()
        this.props.form.validateFields({force: true},(err, values) => {
            if (!err) {
                // values
                if(this.checkSetting()){
                    const payload = {
                        body: this.getBody(values)
                    }
                    this.batchSet(payload)
                } else {
                    message.warning('没有变化')
                }
            }
        })
    }

    checkSetting = () => {
        const {type, record} = this.props
        if(type !== 0) {
            return true
        }
        const {getFieldValue} = this.props.form
        const enabled = getFieldValue('enabled')
        const templateId = getFieldValue('template_id')
        if (!!record.enabled === enabled) {
            if (enabled) {
                return templateId !== record.template_id
            } else {
                return false
            }
        }
        return true
    }

    getBody = (values) => {
        const {type, uins, templateIds, record} = this.props
        const {getFieldValue} = this.props.form
        const enabled = getFieldValue('enabled')
        let body = []
        if (type === 0) {
            let templateId = values.template_id
            templateId = enabled ? templateId : 0
            body = [{
                ...values,
                ...{template_id: templateId},
                ...{uin: parseInt(record.uin, 10)}
            }]
        } else if (type === 1) {
            body = uins.map((item) => {
                let templateIdItem = templateIds.find((v)=>{ return v.uin === item })
                let templateId = values.template_id || templateIdItem.templateId || 0
                templateId = enabled ? templateId : 0
                return {
                    ...values,
                    ...{template_id: templateId},
                    ...{uin: parseInt(item, 10)}
                }
            })
        }
        return JSON.parse(JSON.stringify(body))
    }

    batchSet = (payload) => {
        this.props.dispatch({
            type: 'crm_add_fans_initiative/batchSet',
            payload: payload,
            callback: () => {
                message.success('配置成功')
                this.props.onOk()
            }
        })
    }

    handleCancel = () =>{
        this.props.onCancel()
    }

    handleEnabledChange = (e) => {
        const {setFieldsValue} = this.props.form
        const enabled = e.target.checked
        if(!enabled) { // 当个禁用状态重置回初始值
            setFieldsValue({
                template_id: this.getInitialValue('template_id')
            })
        }
    }

    validateTemplate = (rule, value, callback) => {
        const {getFieldValue} = this.props.form
        if (getFieldValue('enabled') && !value) {
            callback('请选择加粉模板')
            return
        }
        callback()
    }

    getInitialValue = (key) => {
        const {type, record} = this.props
        if (type === 0) {
            if (key === 'template_id') {
                if (!record.template_enabled) {
                    return
                }
                if (this.hasTemplate(record.template_id)) {
                    return record[key] || undefined
                }
                return
            }
            return record[key] || undefined
        }
    }

    hasTemplate = (templateId) => {
        const {listSummary} = this.props.crm_add_fans_template
        return listSummary.find((v) => {
            return v.id === templateId
        })
    }

    isTemplateRequired = () => {
        const {getFieldValue} = this.props.form
        return !!getFieldValue('enabled')
    }

    render() {
        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        }

        const {listSummary} = this.props.crm_add_fans_template
        const {visible, templatesLoading, setLoading} = this.props
        const {getFieldDecorator, getFieldValue} = this.props.form

        return (
            <Modal
                centered={true}
                maskClosable={false}
                destroyOnClose={true}
                visible={visible}
                title="加粉配置"
                wrapClassName={styles.wrapper}
                confirmLoading={setLoading}
                okText="保存"
                onOk={this.handleSubmit}
                onCancel={this.handleCancel}
            >
                <Form>
                    <FormItem>
                        {getFieldDecorator('enabled', {
                            rules: [],
                            valuePropName: 'checked',
                            initialValue: !!this.getInitialValue('enabled'),
                        })(
                            <Checkbox onChange={this.handleEnabledChange}
                            >开启加粉</Checkbox>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="搜索加粉"
                    >
                        {getFieldDecorator('template_id', {
                            rules: [
                                {
                                    required: this.isTemplateRequired(),
                                    validator: this.validateTemplate,
                                }
                            ],
                            initialValue: this.getInitialValue('template_id')
                        })(
                            <Select placeholder="请选择加粉模板"
                                disabled={!getFieldValue('enabled')}
                                notFoundContent={templatesLoading ? <Icon type="loading"/> : <p className={styles.empty}>暂无数据</p>}
                            >
                                {
                                    listSummary.map((item) => {
                                        return <Option key={item.id} value={item.id}>{item.title}</Option>
                                    })
                                }
                            </Select>
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
