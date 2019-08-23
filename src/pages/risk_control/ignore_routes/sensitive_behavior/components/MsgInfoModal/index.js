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
import {getOptionsMap} from '../../utils'
import styles from './index.less'

const {DateTimeFormat} = config
const FormItem = Form.Item

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
    }

    componentDidMount() {
    }

    handleOk = (e) => {
        e.preventDefault()
        this.props.onModalCancel()
    }

    handleCancel = () => {
        this.props.onModalCancel()
    }

    renderMsg = (record) => {
        const target_friend = record.target_friend || {}
        return target_friend.remark || target_friend.nickname
    }

    render() {
        const {
            record,
        } = this.props

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        }

        return (
            <Form layout={'horizontal'} {...formItemLayout}>
                <FormItem label="敏感行为" required={false}>
                    {record['sensitive_operation_title']}
                    {
                        record.sensitive_operation_id === 99999 && (
                            <span className={styles.sensitiveWord}>{record.extra}</span>
                        )
                    }
                </FormItem>
                <FormItem label="好友信息" required={false}>
                    {
                        this.renderMsg(record)
                    }
                </FormItem>
                <FormItem label="微信信息" required={false}>
                    {record['wechat'].remark ? `${record['wechat'].remark}/${record['wechat'].nickname}` : record['wechat'].nickname}
                </FormItem>
                <FormItem label="微信号所属客服" required={false}>
                    {record['current_user_nickname']}
                </FormItem>
                {/*<FormItem label="设备备注" required={false}>*/}
                {/*    {record['remark']}*/}
                {/*</FormItem>*/}
                {/*<FormItem label="设备所属客服" required={false}>*/}
                {/*    {_.get(record, 'user_nickname')}*/}
                {/*</FormItem>*/}
                <FormItem label="时间" required={false}>
                    {
                        record['msg_create_time'] && moment(record['msg_create_time']).format(DateTimeFormat)
                    }
                </FormItem>
                <FormItem label="处理结果" required={false}>
                    {
                        record['handle_status'] === 0 ? '待处理' : getOptionsMap('status')[record['status']]
                    }
                </FormItem>
                {
                    record['handle_status'] === 1 && (
                        <FormItem label="处理备注" required={false}>
                            {record['handle_remark']}
                        </FormItem>
                    )
                }
                {
                    record['handle_status'] === 1 && (
                        <FormItem label="处理人" required={false}>
                            {record['handle_user_nickname']}
                        </FormItem>
                    )
                }
            </Form>
        )
    }
}
