'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/29
 */


import React from 'react'
import {Icon, Modal, message} from 'antd'
import Helper from '../../utils/helper'
import styles from './Login.scss'

class Login extends React.Component {
    constructor(props) {
        super()
        this.state = {
            url: '',
            token: ''
        }
    }

  timer = 0;

  refreshResult = () => {
      this.timer = setInterval(() => {
          this.props.dispatch({
              type: 'wx_wechats/result',
              payload: {params: {token: this.state.token}},
              callback: (response) => {
                  if (response) {
                      if (response.status >= 200 && response.status < 300) {
                          response.json().then((res) => {
                              if (res.error && Helper.getIn(res.error, 'responseJson.meta.code') === 1050) {
                                  clearInterval(this.timer)
                                  this.loadQrcode()
                              }
                              if (res.data && res.data.is_used) {
                                  message.success(`${res.data.nickname}已经绑定客户账号`)
                                  clearInterval(this.timer)
                                  this.props.reload()
                                  this.handleCancel()
                              }
                              if (res.data && res.data.is_expired) {
                                  clearInterval(this.timer)
                                  this.loadQrcode()
                              }
                          }).catch((error) => {
                              this.cancel()
                          })
                      } else {
                          this.cancel()
                      }
                  } else {
                      this.cancel()
                  }
              }
          })
      }, 2000)
  };

  cancel = () => {
      clearInterval(this.timer)
      this.handleCancel()
  }

  loadQrcode = () => {
      this.props.dispatch({
          type: 'wx_wechats/login',
          payload: {params: {username: this.props.record.username}},
          callback: (res) => {
              if (res.token) {
                  this.setState({url: res.url, token: res.token}, () => {
                      this.refreshResult()
                  })
              }
          }
      })
  };
  componentDidMount() {
      this.loadQrcode()
  }

  handleCancel = () => {
      clearInterval(this.timer)
      this.props.dispatch({
          type: 'wx_wechats/setProperty',
          payload: {loginModal: false}
      })
  };

  render() {
      const {loginModal} = this.props.wx_wechats
      const {accessToken} = this.props.base
      const {record={}} = this.props

      return (
          <Modal title={record.username ? '重新绑定' : '新增微信号'}
              visible={loginModal}
              style={{width: 500}}
              maskClosable={false}
              className={styles.login}
              onCancel={this.handleCancel}
              footer={null}>
              <h3>打开手机客户端【牛客服】<img className={styles.app} src={require('../../assets/images/niukefu.png')} alt="牛客服"/>扫码登录</h3>
              <div className={styles.qrcode}>
                  {this.state.url ?
                      <img src={Helper.getAccessTokenUrl(this.state.url, accessToken)} alt=""/>
                      :
                      <Icon type="loading"/>
                  }
              </div>
              {record.nickname ? <p style={{textAlign: 'center'}}>
                  {
                      record.remark ? `微信备注：${record.remark}` : `微信昵称：${record.nickname}`
                  }
              </p> : ''
              }
              <p>
                  为满足您的聚合聊天管理服务需求，您自愿委托【牛客服】存储您的社交软件对话内容及日志等信息。若您的上述委托行为需要获得第三方授权同意的，您承诺已经取得了必要的授权且不会侵犯任何第三方的合法权益。请您务必保护账户安全并定期备份相关数据。
              </p>
          </Modal>
      )
  }
}

export default Login
