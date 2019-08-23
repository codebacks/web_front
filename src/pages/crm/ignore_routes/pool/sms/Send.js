'use strict'

/**
 * 文件说明: 通过订单发送短信
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 17/08/01
 */
import React from 'react'
import {
    Row,
    Col,
    Button,
    Modal,
    Form,
    Select,
    Input,
    DatePicker,
    Popover,
    Icon,
    notification,
    Radio
} from 'antd'
import styles from './Index.scss'
import {browserHistory} from 'dva/router'
import config from 'crm/common/config'
import Helper from 'crm/utils/helper'
import Service from 'crm/components/Common/Service'
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')

const confirm = Modal.confirm
const RadioGroup = Radio.Group
const FormItem = Form.Item
const Option = Select.Option
const {TextArea} = Input

const {DateTimeFormat} = config

class Send extends React.Component {
    constructor(props) {
        super()
        this.state = {
            templateContent: '',
            templateId: 9999999, ///统一使用默认模版
            sign: '',
            signId: '',
            startTime: '',
            name: '',
            wechatIds: [],
            showTemplate: false,
            send_method: 0
        }
    }

    loadConfig = () => {
        const source = this.props.source
        let params = {}
        if (source === 'order') {
            params = this.props.crm_orders.params
        } else {
            params = this.props.crm_members.params
        }
        this.props.dispatch({
            type: 'crm_sms/queryTemplates',
            payload: {includesSysTemplate: 1, store_type: params.store_type}
        })
        this.props.dispatch({
            type: 'crm_sms/querySign',
            payload: {}
        })

        this.props.dispatch({
            type: 'crm_sms/queryWechatsByCompines',
            payload: {}
        })
    };

    componentDidMount() {
        this.loadConfig()
        let last_template = localStorage.getItem('last_sms_template_content')
        if (last_template) {
            this.setState({templateContent: last_template})
        }
    };

    handleCancel = () => {
        this.props.dispatch({
            type: 'crm_sms/setProperty',
            payload: {modal: false, sendModal: false}
        })
    };
    handleChange = (key, e) => {
        this.setState({[key]: e.target.value})
    };
    handleChangeTemplate = (val) => {
        let template_id = window.parseInt(val)
        let template = this.props.crm_sms.templates.filter((item) => {
            return item.id === template_id
        })
        this.setState({templateContent: template[0].template, templateId: val})
    };

    handleChangeSign = (val) => {
        let sign_id = window.parseInt(val)
        let sign = this.props.crm_sms.signs.filter((item) => {
            return item.id === sign_id
        })
        this.setState({sign: sign[0].name, signId: val})
    };

    handleChangeStartTime = (val) => {
        this.setState({startTime: moment(val).format(DateTimeFormat)})
    };

    handleChangeWechat = (val) => {
        this.setState({wechatIds: val})
    };
    handleChangeContent = (e) => {
        if (e.target.value.trim().length + 10 > 300) {
            notification.error({
                message: '错误提示',
                description: '短信字数最长为300个字符!'
            })
        } else {
            this.setState({templateContent: e.target.value.trim()})
        }
    };

    handleInsert = (key) => {
        const {initData: config} = this.props.base
        const sms_sys = config.crm_sms_sys
        const {templateContent} = this.state
        if (templateContent.length + 10 > 300) {
            notification.error({
                message: '错误提示',
                description: '短信字数最长为300个字符!'
            })
        } else {
            let _content = `${templateContent}<${sms_sys.kv[key]}>`
            this.setState({templateContent: _content})
        }
    };

    handleOk = () => {
        let list = this.props.crm_sms.list, members = []
        list.forEach((item) => {
            if (this.props.source === 'order') {
                members.push({
                    mobile: item.mobile,
                    member_id: item.member_id,
                    order_id: item.id
                })
            } else if (this.props.source === 'member') {
                members.push({
                    mobile: item.mobile,
                    member_id: item.id
                })
            }
        })
        if (!members.length) {
            notification.error({
                message: '错误提示',
                description: '发送对象为空'
            })
            return false
        }
        const {name, sign, templateId, wechatIds, startTime, send_method} = this.state
        const _template = this.getContent(1)
        let _wechatIds = wechatIds
        if (send_method === 1) {
            _wechatIds = [wechatIds]
        }
        let data = {
            name: name,
            template_id: templateId,
            template_content: _template,
            start_time: startTime,
            members: members,
            sign: sign,
            send_method: send_method,
            wechat_ids: _wechatIds
        }
        if (!data.name) {
            notification.error({
                message: '错误提示',
                description: '任务名称不能为空',
            })
            return false
        }
        if (!data.sign) {
            notification.error({
                message: '错误提示',
                description: '短信签名不能为空',
            })
            return false
        }
        if ((data.template_content.startsWith('【') && data.template_content.endsWith('】') ) || data.template_content.length > 300) {
            notification.error({
                message: '错误提示',
                description: '短信内容不能为空且小于300个字',
            })
            return false
        }
        if (!data.wechat_ids.length) {
            notification.error({
                message: '错误提示',
                description: '请选择添加到哪个微信号',
            })
            return false
        } else {
            localStorage.setItem('last_sms_template_content', this.state.templateContent)
            if (data.send_method === 1) {
                if (data.template_content.indexOf('<') !== -1 && data.template_content.indexOf('>') !== -1) {
                    let that = this
                    confirm({
                        title: '确认发送以下内容？内容中的<>内的变量将不会被替换，如果使用变量请切换到逐条发送',
                        content: data.template_content,
                        onOk() {
                            that.save(data)
                        },
                        onCancel() {
                        },
                    })
                } else {
                    this.save(data)
                }
            } else {
                this.save(data)
            }
        }
    };
    save = (data) => {
        this.props.dispatch({
            type: 'crm_sms/create',
            payload: {body: data},
            callback: () => {
                this.handleCancel()
                browserHistory.push('/wx/sms/tasks')
            }
        })
    };

    getContent = (endFlag) => {
        const {templateContent, sign} = this.state
        if (endFlag) {
            if(templateContent.indexOf('退订') !== -1){
                return `${templateContent}【${sign}】`
            }else{
                return `${templateContent}退订回N【${sign}】`
            }
        } else {
            if(templateContent.indexOf('退订') !== -1) {
                return sign ? `【${sign}】${templateContent}` : `【短信签名】${templateContent}`
            }else{
                return sign ? `【${sign}】${templateContent}退订回N` : `【短信签名】${templateContent}退订回N`
            }
        }
    };

    showTemplates = () => {
        this.setState({showTemplate: true})
    };

    hideTemplates = () => {
        this.setState({showTemplate: false})
    };

    insertTemplate = (item) => {
        this.setState({showTemplate: false, templateContent: item.template})
    };

    handleChangeSendMethod = (e) => {
        this.setState({send_method: e.target.value})
    };

    render() {
        const {initData: {user: userInfo}} = this.props.base
        const {initData: config} = this.props.base
        const {list, templates, wechats, signs, createLoading} = this.props.crm_sms
        const source = this.props.source
        let params = {}
        if (source === 'order') {
            params = this.props.crm_orders.params
        } else {
            params = this.props.crm_members.params
        }

        const {templateContent} = this.state
        const getStoreTypeName = () => {
            let _types = config.store_types || []
            let _item = _types.filter((item) => {
                return item.id === window.parseInt(params.store_type)
            })
            return _item.length ? _item[0].name : ''

        }
        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
        }
        const getWechats = (key) => {
            let _wechatOptions = []
            wechats.forEach((item, idx) => {
                if (item.crm_sms_alias) {
                    _wechatOptions.push(<Option key={key + idx}
                        value={item.crm_sms_alias + ''}>{item.crm_sms_alias}[{item.nickname}]</Option>)
                } else if (item.alias) {
                    _wechatOptions.push(<Option key={key + idx}
                        value={item.alias + ''}>{item.alias}[{item.nickname}]</Option>)
                } else if (!item.username.startsWith('wxid_')) {
                    _wechatOptions.push(<Option key={key + idx}
                        value={item.username + ''}>{item.username}[{item.nickname}]</Option>)
                }
            })
            return _wechatOptions
        }
        const sms_sys = config.crm_sms_sys
        const sms_params = sms_sys.params[params.store_type]
        // const my_signs = signs.filter((item) => {
        //     return item.sign_type === 0
        // })
        const getMsgLen = (_content) => {
            return _content.length
        }
        const _content = this.getContent()
        const len = getMsgLen(_content)
        const messages = []
        if (len > 70) {
            // messages.push(_content.substr(0, 70));
            const _c = _content //.substr(70, _content.length);
            const _len = getMsgLen(_c)
            for (let i = 0, j = parseInt(_len / 67, 10) + 1; i < j; i++) {
                if (_c.substr(i * 67, 67)) {
                    messages.push(_c.substr(i * 67, 67))
                }
            }

        } else {
            messages.push(_content)
        }
        let _templates = templates.filter((item) => {
            return item.id !== config.crm_sms_common_template_id
        })
        return (
            <Modal title={`发送短信给${list.length}个客户【${getStoreTypeName()}】`} visible={this.props.crm_sms.modal}
                width={1100}
                onCancel={this.handleCancel}
                maskClosable={false}
                footer={[
                    <Button key="cancel" size="large" onClick={this.handleCancel}>取消</Button>,
                    <Button key="submit" size="large" type="primary" loading={createLoading}
                        onClick={this.handleOk}>提交</Button>
                ]}
            >
                <Row className={styles.send}>
                    <Col span="16">
                        <div>
                            <p className="strong">一、为确保到达率，批量发送前建议先用自己手机号测试一条看是否能送达，短信内容是否包含非法关键字。<br/>导入用户：1、点击左侧菜单【用户池】,
                                2、下载模版，3、添加手机号，4、导入用户
                            </p>
                            <p className="strong" style={{marginTop: 8, marginBottom: 20}}>
                                二、短信计费条数跟短信的字数有关，一般的短信70个字计费一条。超过70个字就划分为长短信，67个字计费一条<br/>例如：71字的短信就是长短信计费2条，134个字也是计费2条（67*2）。135个字计费3条，依次类推。
                            </p>

                        </div>
                        <Form layout="horizontal"
                            key="edit"
                            style={{padding: '0 16px'}}
                            className="ant-advanced-search-form">
                            <FormItem {...formItemLayout} label='发送类型' required={true}>
                                <RadioGroup onChange={this.handleChangeSendMethod} value={this.state.send_method}>
                                    <Radio value={0}>逐条发【支持变量】</Radio>
                                    <Radio value={1}>群发【不支持变量】</Radio>
                                </RadioGroup>
                            </FormItem>
                            <FormItem {...formItemLayout} label='任务名称' required={true}>
                                <Input placeholder="请输入任务名称" value={this.state.name}
                                    onChange={this.handleChange.bind(this, 'name')}/>
                            </FormItem>
                            <FormItem  {...formItemLayout} label='短信签名' required={true}>
                                <Select placeholder="选择签名" onChange={this.handleChangeSign} style={{width: 300}}>
                                    {signs.map((item) => {
                                        return <Option key={item.id} value={item.id + ''}>{item.name}</Option>
                                    })}
                                </Select>
                                <span className={styles.tip}>
                                    <Service {...this.props} name="设置自定义签名" topTip="" icon=' ' hideHelp={true}
                                        placement="right"/>
                                </span>
                            </FormItem>
                            <FormItem  {...formItemLayout} label='短信内容' className={styles.content} required={true}>
                                {/*{templateContent || '请选择模版'}*/}
                                <TextArea placeholder="请输入短信内容" rows={4} value={templateContent}
                                    onChange={this.handleChangeContent} style={{height: 70}}/>

                                <span className={styles.lenTip}>{getMsgLen(_content)} / 300 (一条70字，多条按67字)</span>

                                <div className={styles.insertContent}>
                                    {this.state.send_method === 1 ?
                                        <div>
                                            <Row>
                                                <Col span={16}>
                                                    <span className="strong">群发短信不支持变量</span>
                                                </Col>
                                                <Col span={8} className="textRight">
                                                    <Button size="small" onClick={this.showTemplates}><Icon
                                                        type="bars"/>从模版中选短信内容</Button>
                                                </Col>
                                            </Row>
                                        </div>
                                        :
                                        <div>
                                            <Row>
                                                <Col span={16}>
                                                    <span className="strong">插入变量后 "&lt;&gt;"中间的内容不可修改</span>
                                                </Col>
                                                <Col span={8} className="textRight">
                                                    <Button size="small" onClick={this.showTemplates}><Icon
                                                        type="bars"/>从模版中选短信内容</Button>
                                                </Col>
                                            </Row>
                                            {sms_params.map((key) => {
                                                return <span key={key} onClick={this.handleInsert.bind(this, key)}
                                                    className={styles.item}>插入{sms_sys.kv[key]}</span>
                                            })}
                                        </div>
                                    }
                                </div>
                            </FormItem>
                            {this.state.send_method === 0 ?
                                <FormItem  {...formItemLayout} label='配置微信号' required={true}>
                                    <Select mode="multiple" placeholder="配置微信号"
                                        style={{width: 300}}
                                        tokenSeparators={[',']}
                                        onChange={this.handleChangeWechat}>
                                        {getWechats('oo')}
                                    </Select>
                                    <Popover content="请在手机上设置微信号，并重新登录PC客户端；多个发送时候随机选取" title={null}>
                                        <span className={styles.tip}>配置微信号</span><Icon type="question-circle-o"/>
                                    </Popover>
                                </FormItem>
                                :
                                <FormItem  {...formItemLayout} label='配置微信号' required={true}>
                                    <Select placeholder="配置微信号"
                                        style={{width: 300}}
                                        onChange={this.handleChangeWechat}>
                                        {getWechats('xx')}
                                    </Select>
                                </FormItem>
                            }

                            <FormItem {...formItemLayout} label='发送时间'>
                                <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    placeholder="选择发送时间"
                                    style={{width: 300}}
                                    onChange={this.handleChangeStartTime}
                                /><span className={styles.tip}>不选表示立即发送</span>
                            </FormItem>
                        </Form>
                    </Col>
                    <Col span="8" className="textCenter">
                        <div className={styles.phone}>
                            <div className={`${styles.messageWrap} tinyScrollbar`}>
                                <div className={styles.message}>
                                    {messages.map((content, idx) => {
                                        return <p key={idx} className={styles.item}>{content}</p>
                                    })}
                                </div>
                            </div>
                            <div className={styles.limit}>约{_content.length}个字，{messages.length}条短信
                                <Popover content="按照运营商标准计费小于等于70字算1条，超过70个字每条67字计费，最多不超过300字）" title={null}>
                                    <Icon type="question-circle-o"/>
                                </Popover>
                            </div>
                        </div>
                        <div className={styles.payTip}>
                            剩余短信条数{Helper.getIn(userInfo, 'company.crm_sms_count')}条，本次需发送{list.length * messages.length}条
                        </div>
                    </Col>
                </Row>
                {this.state.showTemplate ?
                    <Modal title="选择短信内容" visible={true}
                        width={600}
                        onCancel={this.hideTemplates}
                        maskClosable={false}
                        footer={[
                            <Button key="cancel" size="large" onClick={this.hideTemplates}>取消</Button>
                        ]}
                    >
                        <div className={styles.templates}>
                            {_templates.map((item, key) => {
                                return <Row key={key} className={styles.template}>
                                    <Col span={20}>
                                        {item.template}
                                    </Col>
                                    <Col span={4} className="textCenter">
                                        <Button size="small" onClick={this.insertTemplate.bind(this, item)}><Icon
                                            type="check"/>引用</Button>
                                    </Col>
                                </Row>
                            })}
                        </div>
                    </Modal>
                    : ''}
            </Modal>
        )
    }
}

export default Send
// <Popover content="请到【系统设置->短信签名】中申请签名，一个工作日内审核通过" title={null}>
// <span className={styles.tip}>设置自定义签名</span><Icon type="question-circle-o"/>
// </Popover>

/*
                            <FormItem  {...formItemLayout} label='选择模版'>
                                <Select placeholder="选择模版" style={{width: '100%'}}
                                        onChange={this.handleChangeTemplate}>
                                    {templates.map((item) => {
                                        return <Option key={item.id} value={item.id + ''}>{item.name}</Option>
                                    })}
                                </Select>
                            </FormItem>
*/
