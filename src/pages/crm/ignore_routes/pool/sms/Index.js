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
    Table,
    Button,
    Input,
    Modal,
    Form,
    Select,
    notification
} from 'antd'
import router from 'umi/router'

const FormItem = Form.Item
const Option = Select.Option

class Sms extends React.Component {
    constructor(props) {
        super()
        this.state = {
            visibleHistory: false,
            visibleCreatePlan: false,
            visible: false,
            name: '', //任务 ID
            wxid: '',  //添加到某个微信号
            template_id: '', //发送模版ID
            template: '',
            params: {} //模版变量
        }
    }

    componentDidMount() {
        setTimeout(() => {
            if (this.props.source === 'order') {
                this.props.dispatch({
                    type: 'crm_sms/queryOrders',
                    payload: {}
                })
            } else if (this.props.source === 'member') {
                this.props.dispatch({
                    type: 'crm_sms/queryMembers',
                    payload: {}
                })
            }

            this.props.dispatch({
                type: 'crm_sms/queryTemplates',
                payload: {includesSysTemplate: 1}
            })

            this.props.dispatch({
                type: 'crm_sms/queryWechatsByCompines',
                payload: {}
            })
            this.props.dispatch({
                type: 'application/querySmsCount',
                payload: {}
            })
        }, 0)
    };

    save = (data) => {
        this.props.dispatch({
            type: 'crm_sms/create',
            payload: {body: data},
            callback: () => {
                this.handleCancel()
                router.push('/wx/sms/tasks')
            }
        })
    };


    handleOk = () => {
        let list = this.props.crm_sms.list, members = []
        list.map((item) => {
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
        let data = {
            name: this.state.name,
            template_id: window.parseInt(this.state.template_id),
            params: this.state.params,
            wxid: this.state.wxid,
            members: members
        }
        if (!data.template_id) {
            notification.error({
                message: '错误提示',
                description: '短信模板不能为空',
            })
            return false
        }
        if (!data.wxid) {
            notification.error({
                message: '错误提示',
                description: '请选择添加到哪个微信号',
            })
            return false
        } else {
            this.save(data)
        }
    };

    handleRemove = (id) => {
        this.props.dispatch({
            type: 'crm_sms/removeItem',
            payload: {id: id}
        })
    };

    handleCancel = () => {
        this.props.dispatch({
            type: 'crm_sms/setProperty',
            payload: {modal: false}
        })
    }

    handleChange = (key, e) => {
        if (key === 'wxid') {
            this.setState({[key]: e})
        } else {
            this.setState({[key]: e.target.value})
        }
    };
    handleChangeTemplate = (val) => {
        let template_id = window.parseInt(val)
        let template = this.props.crm_sms.templates.filter((item) => {
            return item.id === template_id
        })
        this.setState({template: template[0], template_id: val, params: {...template[0].params}})
        this.formatTemplate()
    };
    formatTemplate = () => {
        setTimeout(() => {
            if (this.state.template_id) {
                let templateView = this.state.template.template
                let params = {...this.state.params}
                for (let key in params) {
                    if (params.hasOwnProperty(key)) {
                        if (params[key]) {
                            templateView = templateView.replace('${' + key + '}', params[key])
                        }
                    }
                }
                this.setState({templateView: templateView})
            }
        }, 0)
    };
    handleChangeParamValue = (key, e) => {
        let params = {...this.state.params}
        let val = e.target.value
        if (val.length > 15) {
            notification.error({
                message: '错误提示',
                description: '单个变量内容不能超过15个字',
            })
            return false
        }
        params[key] = val
        this.setState({params: params})
        this.formatTemplate()
    };

    render() {
        const {list, sms_count, invalid_mobile, templates, wechats, createLoading} = this.props.crm_sms
        const columns = [{
            title: '会员名[uid]',
            dataIndex: 'uid',
        }, {
            title: '联系电话[mobile]',
            dataIndex: 'mobile',
        }, {
            title: '姓名[name]',
            dataIndex: 'name',
        }, {
            title: '已发短信',
            dataIndex: 'sms_num',
            width: 85
        }, {
            title: '操作',
            dataIndex: 'option',
            width: 85,
            render: (text, record, index) => {
                return (<Button size="small" onClick={this.handleRemove.bind(this, record.id)}
                    loading={this.state.loading}>删除</Button>)
            }
        }]
        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }
        const getDis = () => {
            return sms_count < list.length
        }
        const getCls = () => {
            return sms_count < list.length ? 'strong' : ''
        }
        return (
            <Modal title="发送短信" visible={this.props.crm_sms.modal}
                width={1200}
                onCancel={this.handleCancel}
                maskClosable={false}
                footer={[<Button key="cancel" onClick={this.handleCancel}>取消</Button>,
                    <Button key="submit" type="primary" disabled={getDis()} loading={createLoading}
                        onClick={this.handleOk}>提交</Button>
                ]}
            >
                <Row>
                    <Col span="12">
                        <h3 style={{paddingBottom: 8}}>
                            给{list.length}用户发送短信{invalid_mobile ? `，已过滤掉${invalid_mobile}个不合法的手机号` : ''}</h3>
                        <Table dataSource={list}
                            rowKey={record => record.id}
                            columns={columns}
                            size="small"
                            showTotal={total => `共${list.length}条`}/>
                    </Col>
                    <Col span="12">
                        <Form layout="horizontal"
                            key="edit"
                            style={{padding: '0 16px', height: 500, overflowY: 'auto'}}
                            className="ant-advanced-search-form">
                            <FormItem {...formItemLayout} label={'任务名称'}>
                                <Input placeholder="请输入任务名称,内容无限制,用于管理识别" value={this.state.name}
                                    onChange={this.handleChange.bind(this, 'name')}/>
                            </FormItem>
                            <FormItem {...formItemLayout} label={'加到微信号'}>
                                <Select placeholder="选择微信号" style={{width: '100%'}}
                                    onChange={this.handleChange.bind(this, 'wxid')}>
                                    {wechats.map((item) => {
                                        return <Option key={item.id}
                                            value={item.username + ''}>{item.nickname}[{item.alias}]</Option>
                                    })}
                                </Select>
                            </FormItem>
                            <FormItem  {...formItemLayout} label={'选择模版'}>
                                <Select placeholder="选择模版" style={{width: '100%'}}
                                    onChange={this.handleChangeTemplate}>
                                    {templates.map((item) => {
                                        return <Option key={item.id}
                                            value={item.id + ''}>{item.template_type ?
                                                <span className="strong">[系统模板]</span> : ''}{item.name}</Option>
                                    })}
                                </Select>
                                {this.state.template.template_type === 1 ?
                                    <p className={getCls()}>剩余短信数{sms_count}条，已选人数{list.length}人</p>
                                    : ''}
                            </FormItem>
                            {this.state.template_id ?
                                <FormItem  {...formItemLayout} label={'短信内容'}>
                                    {this.state.templateView}
                                </FormItem>
                                : ''}
                            {Object.keys(this.state.params).map((key, idx) => {
                                return <FormItem {...formItemLayout} key={idx}
                                    label={key + '[' + sms.kv[key] + ']'}>
                                    {sms.sys.includes(key) ?
                                        <span>发送时动态使用订单中的值替换</span> :
                                        <Input placeholder="请输入对应内容" value={this.state.params[key]}
                                            onChange={this.handleChangeParamValue.bind(this, key)}/>
                                    }
                                </FormItem>
                            })}
                        </Form>

                    </Col>
                </Row>
            </Modal>)
    }
}

Sms.propTypes = {}

export default Form.create()(Sms)
