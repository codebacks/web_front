/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import {Form} from 'antd'
import toggleModalWarp from 'hoc/toggleModalWarp'
import {hot} from 'react-hot-loader'
import moment from 'moment'
import config from "risk_control/common/constants"
import _ from "lodash"

const {DateTimeFormat} = config
const FormItem = Form.Item

const statusMap = {
    '0': '异常',
    '1': '正常',
}

@hot(module)
@Form.create()
@toggleModalWarp({
    title: '详情',
    width: 520,
    destroyOnClose: true,
    maskClosable: false,
})
export default class Index extends React.Component {
    constructor(props) {
        super(props)
        props.setModalOkFn(this.handleOk)
        this.state = {
            info: {},
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'risk_control_sensitiveMsg/sensitiveTextMessagesInfo',
            payload: {id: this.props.record.id},
            callback: (data) => {
                this.setState({info: data})
            },
        })
    }

    handleOk = (e) => {
        e.preventDefault()
        this.props.onModalCancel()
    }

    handleCancel = () => {
        this.props.onModalCancel()
    }

    render() {
        const {
            info,
        } = this.state

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        }

        const departments = _.get(info, 'user.departments', [])

        return (
            <Form layout={'horizontal'} {...formItemLayout}>
                <FormItem label="敏感信息" required={false}>
                    {info['sensitive_words']}
                </FormItem>
                <FormItem label="设备编号" required={false}>
                    {info['number']}
                </FormItem>
                <FormItem label="序列号" required={false}>
                    {info['serialno']}
                </FormItem>
                <FormItem label="设备备注" required={false}>
                    {info['remark']}
                </FormItem>
                <FormItem label="当时所属客服" required={false}>
                    {_.get(info, 'user.nickname')}
                </FormItem>
                <FormItem label="所属部门" required={false}>
                    {
                        departments.map((item) => {
                            return item.name
                        }).join('，')
                    }
                </FormItem>
                <FormItem label="类型" required={false}>
                    {
                        info['type'] === 1 ? '接收' : '发送'
                    }
                </FormItem>
                <FormItem label="时间" required={false}>
                    {
                        info['send_time'] && moment(info['send_time'] * 1000).format(DateTimeFormat)
                    }
                </FormItem>
                <FormItem label="手机号" required={false}>
                    {info['mobile']}
                </FormItem>
                <FormItem label="短信内容" required={false}>
                    {info['content']}
                </FormItem>
                <FormItem label="处理结果" required={false}>
                    {
                        info['operate_status'] === 0 ? '待处理' : statusMap[info['status']]
                    }
                </FormItem>
                {
                    info['operate_status'] === 1 && (
                        <FormItem label="处理备注" required={false}>
                            {info['operate_remark']}
                        </FormItem>
                    )
                }
                {
                    info['operate_status'] === 1 && (
                        <FormItem label="处理人" required={false}>
                            {info['operate_user_nickname']}
                        </FormItem>
                    )
                }
            </Form>
        )
    }
}
