/*
 * @Author: sunlzhi 
 * @Date: 2018-09-07 10:30:15 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-09-12 11:25:02
 */

import React, {Component} from 'react'
import { Modal, Select } from 'antd'
import styles from './index.less'
import {Link} from 'dva/router'

const Option = Select.Option

export default class Index extends Component {
    state = {
        payConfigure: [],
        subAppId: '',
        subAppRecord: {},
        loading: false,
        editPayConfigureOption: '',
        editPayConfigureId: '',
    }

    componentDidMount () {
        let subAppId = this.props.subAppId
        let subAppRecord = this.props.subAppRecord
        this.getPayConfigure(subAppId, subAppRecord)
        this.setState({
            subAppId,
            subAppRecord
        })
    }

    // 获取当前公众号配置详情
    getPayConfigure = (status, item) => {
        
        // 如果已经存在支付设置列表则不再请求接口
        this.props.dispatch({
            type: 'setting_mpa/payConfigure',
            payload: {},
            callback: () => {
                this.setState({payConfigure: this.props.setting_mpa.payConfigureList})
                // console.log(this.state.payConfigure)
                for (let v of this.state.payConfigure) {
                    if (v.pay_conf_id === item.pay_conf_id) {
                        this.setState({
                            editPayConfigureOption: v.key,
                            editPayConfigureId: item.pay_conf_id
                        })
                    }
                }
                this.setState({
                    payConfigureVisible: true,
                })
            }
        })
    }

    // 选择支付配置
    getPayConfigureId = (key, value) => {
        // console.log(key, value)
        this.setState({
            editPayConfigureOption: value.props.children[1],
            editPayConfigureId: key
        })
    }

    // 支付设置确认
    paySetOk = (app_id) => {
        this.setState({
            loading: true
        })
        this.props.dispatch({
            type: 'setting_mpa/putSubConfigure',
            payload: {
                app_id: app_id,
                pay_conf_id: this.state.editPayConfigureId
            },
            callback: (data, meta) => {
                let subDataArr = this.props.setting_mpa.mpas
                for (let v of subDataArr) {
                    if (v.app_id === this.state.subAppId) {
                        Object.assign(v,  { has_pay_conf: 1, pay_conf_id: this.state.editPayConfigureId })
                        this.setState({subData: subDataArr})
                        break
                    }
                }
                this.setState({
                    loading: false
                })
                this.handleCancel()
            }
        })
    }

    handleCancel = () => {
        this.props.handleCancel()
    }

    render() {
        // 选择支付配置下拉框内容
        const payConfigureOption = this.state.payConfigure.map(payConf => <Option key={payConf.pay_conf_id}>商户号：{payConf.key}</Option>)

        return (
            <Modal title="支付配置"
                visible={this.props.payConfigureVisible}
                onOk={() => this.paySetOk(this.state.subAppId)}
                confirmLoading={this.state.loading}
                onCancel={this.handleCancel}
            >
                <p>
                    <span>当前小程序的商户号，需与选择的支付配置商户号一致</span>
                </p>
                <div className={styles.payConfirm}>
                    <div className={styles.currentSub}>
                        <span className={styles.describe}>当前小程序：</span>
                        <span className={styles.sub}>{this.state.subAppRecord.name}</span>
                    </div>
                    <div>
                        <span className={styles.describe}>选择支付配置：</span>
                        <span>
                            <Select value={this.state.editPayConfigureOption} onChange={this.getPayConfigureId} style={{width: 240,marginRight: 20}}>
                                {payConfigureOption}
                            </Select>
                        </span>
                        <Link to='pay_setting' className={styles.toAdd}>去添加</Link>
                    </div>
                </div>
            </Modal>
        )
    }
}