/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import {Icon, message} from "antd"
import hooksModalDecorator from 'hoc/hooksModal'
import {hot} from 'react-hot-loader'
import styles from './index.less'
import _ from 'lodash'

@hot(module)
@hooksModalDecorator({
    title: '新增设备',
    width: 520,
    destroyOnClose: true,
    maskClosable: false,
    footer: null,
})
export default class Index extends React.Component {
    state = {
        url: '',
        token: '',
    }

    loadQrcode = () => {
        clearInterval(this.timer)
        this.props.dispatch({
            type: 'risk_control_deviceManagement/devicesLogin',
            callback: (res) => {
                if (res.token) {
                    this.setState({url: res.url, token: res.token}, () => {
                        this.refreshResult()
                    })
                }
            },
        })
    }

    refreshResult = () => {
        this.timer = setInterval(() => {
            this.props.dispatch({
                type: 'risk_control_deviceManagement/devicesResult',
                payload: {token: this.state.token},
                callback: (response) => {
                    if (response) {
                        if (response.status >= 200 && response.status < 300) {
                            response.json().then((res) => {
                                if (res.error && _.get(res.error, 'responseJson.meta.code') === 1050) {
                                    this.loadQrcode()
                                }
                                if (res.data && res.data.is_used) {
                                    message.success(`${res.data.nickname}已经绑定客户账号`)
                                    this.cancel()
                                    this.props.goPage()
                                }
                                if (res.data && res.data.is_expired) {
                                    this.loadQrcode()
                                }
                            }).catch((error) => {
                                this.cancel()
                            })
                        }else {
                            this.cancel()
                        }
                    }else {
                        this.cancel()
                    }
                },
            })
        }, 2000)
    }

    cancel = () => {
        clearInterval(this.timer)
        this.props.onModalCancel()
    }

    componentDidMount() {
        this.loadQrcode()
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    getAccessTokenUrl(url, accessToken) {
        let sp = url.indexOf('?') !== -1 ? '&' : '?'
        return url + sp + 'access_token=' + accessToken
    }

    render() {
        const {base = {}} = this.props
        const {accessToken} = base
        const {url} = this.state

        return (
            <div className={styles.main}>
                <h3>
                    打开手机客户端【牛客服】
                    <img
                        className={styles.app}
                        src={require('./images/niukefu.png')}
                        alt="牛客服"
                    />
                    扫码登录
                </h3>
                <div className={styles.qrcode}>
                    {url ?
                        <img
                            src={this.getAccessTokenUrl(url, accessToken)}
                            alt=""
                        />
                        : <Icon type="loading"/>
                    }
                </div>
                <p>
                    为满足您的聚合聊天管理服务需求，您自愿委托【牛客服】存储您的社交软件对话内容及日志等信息。若您的上述委托行为需要获得第三方授权同意的，您承诺已经取得了必要的授权且不会侵犯任何第三方的合法权益。请您务必保护账户安全并定期备份相关数据。
                </p>
            </div>
        )
    }
}
