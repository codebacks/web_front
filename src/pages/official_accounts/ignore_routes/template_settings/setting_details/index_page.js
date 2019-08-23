
import React, {Component} from 'react'
import { Button, Form, Radio ,Input, message} from 'antd'
import DocumentTitle from 'react-document-title'
import {connect} from 'dva'
import router from 'umi/router'
import Page from 'components/business/Page'
import TextAreaCount from 'components/TextAreaCount'
import styles from './index.less'
import editData from './data'
const RadioGroup = Radio.Group

@Form.create()
@connect(({ template_settings }) => ({
    template_settings
}))

export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
            subTypeData: {},
            urlStatus : false
        }
        let {subtype,id} = props.location.query
        if(subtype && id){
            let subTypeData = {}
            editData && editData.forEach(item => {
                if(subtype + '' === item.subtype){
                    subTypeData = item
                }
            })
            this.state.subTypeData = subTypeData
        }
    }

    componentDidMount() {
        let {subtype,id} = this.props.location.query
        if(subtype && id){
            this.props.dispatch({
                type: 'template_settings/templateMessagesDetail',
                payload: { id },
                // callback: (data) => {}
            })
        }
    }
    isLoad = false
    componentDidUpdate(){
        const { detail }  = this.props.template_settings
        if(Object.keys(detail).length && !this.isLoad){
            this.isLoad = true
            this.props.form.setFieldsValue({
                title: detail.title,
                remark: detail.remark,
                addLink: detail.url ? 1 : 0
            })
            let urlStatus = detail.url ? 1 : 0
            this.setState({
                urlStatus,
            },()=>{
                if(urlStatus){
                    this.props.form.setFieldsValue({
                        url: detail.url,
                    })
                }
            })
        }
        
    }

    onRadioGroupChange = (e) => {
        this.setState({
            urlStatus:e.target.value
        })
    }
    urlOfValidator = (rule, value, callback) => {
        if(value){
            if(/^http(s)?:\/\/.+/.test(value)){
                callback()
            }else{
                callback('请填写开头为http://或https://的网页地址')
            }
        }else{
            callback()
        }
    }

    saveShortTrend= () =>{
        this.props.form.validateFields((err,values)=>{
            if(!err){
                const {id} = this.props.location.query
                this.props.dispatch({
                    type: 'template_settings/putTemplateMessages',
                    payload: {
                        id,
                        title:values.title,
                        remark:values.remark,
                        url:values.url,
                    },
                    callback: (data) => {
                        message.success('操作成功')
                        this.onHandlerCancel()
                    }
                })
            }
        })
    }
    onHandlerCancel = () =>{
        router.push('/official_accounts/template_settings')
    }
    render() {
        const { subTypeData } = this.state
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '80px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const { detail }  = this.props.template_settings
        const innerProjectList = subTypeData.inner && subTypeData.inner.map((pro, index)=><div className={styles.contentEditorName} key={index}>{pro.column}：<span>{pro.value}</span></div>)

        return <DocumentTitle title={subTypeData['pageTitle'] || ''}>
            <Page>
                <Page.ContentHeader
                    hasGutter={false}
                    breadcrumbData={[{
                        name: '模板设置',
                        path: '/official_accounts/template_settings'
                    },{
                        name: subTypeData['pageTitle']
                    }]}
                />
                <Form style={{marginTop: 16}}>
                    <Form.Item label="编号" {...formItemLayout}>
                        <div>{detail.template_short_no}</div>
                    </Form.Item>
                    <Form.Item label="标题" {...formItemLayout}>
                        <div>{subTypeData['templateTitle']}</div>
                    </Form.Item>
                    <Form.Item label="触发条件" {...formItemLayout}>
                        <div>{subTypeData['triggerCondition']}</div>
                    </Form.Item>
                    <Form.Item label="内容编辑" {...formItemLayout}>
                        <div className={styles.contentEditor}>
                            <div className={styles.contentEditorName}>{subTypeData['notice']}</div>
                            <Form.Item>
                                {getFieldDecorator("title",{
                                    rules: [
                                        { required: true, message: '请填写内容' ,transform:(text)=> text && text.trim()},
                                        { max: 140, message: '头部消息不能超过80个字符' }
                                    ],
                                    initialValue:subTypeData.defaultTitle
                                })(
                                    <TextAreaCount rows={3} onChange={this.textAreaChange} limitSize={80} style={{width: 434}}></TextAreaCount>
                                )}
                            </Form.Item>
                            {innerProjectList}
                            <Form.Item style={{marginTop: 8}}>
                                {getFieldDecorator("remark",{
                                    rules: [
                                        { required: true, message: '请填写内容' ,transform:(text)=> text && text.trim()},
                                        { max: 140, message: '底部消息不能超过80个字符' },
                                    ],
                                    initialValue:subTypeData.defaultRemark
                                })(
                                    <TextAreaCount rows={3} onChange={this.textAreaChange} limitSize={80} style={{width: 434}}></TextAreaCount>
                                )}
                            </Form.Item>
                        </div>
                    </Form.Item>
                    <Form.Item label="添加链接" {...formItemLayout}>
                        {getFieldDecorator("addLink",{
                            initialValue: 0
                        })(
                            <RadioGroup  onChange={this.onRadioGroupChange}>
                                <Radio value={0} default>否</Radio>
                                <Radio value={1}>是</Radio>
                            </RadioGroup>
                        )}
                    </Form.Item>
                    {
                        this.state.urlStatus ? <Form.Item label=" " colon={false} {...formItemLayout}>
                            {getFieldDecorator("url",{
                                rules:[{
                                    validator:this.urlOfValidator
                                }]
                            })(
                                <Input style={{ width: 360 }}/>
                            )}
                        </Form.Item> :null
                    }
                    
                    <Form.Item  {...formItemLayout}>
                        <Button type="primary" onClick={this.saveShortTrend} style={{ marginLeft: 80 }}>保存</Button>
                        <Button onClick={this.onHandlerCancel} style={{marginLeft: 16}}>取消</Button>
                    </Form.Item> 
                </Form>
            </Page>
        </DocumentTitle>
    }
}
