import React, {Component} from 'react'
import {connect} from 'dva'
import router from 'umi/router'
import {message} from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.less'
import _ from "lodash"

@connect(({login, loading, base, oem}) => ({
    login,
    base,
    oem,
    submitting: loading.effects['login/login'],
}))
@documentTitleDecorator({
    title: '自动登录',
})
export default class AutoLogin extends Component {
    state = {
    }

    componentDidMount() {

        const query = _.get(this.props.location, 'query')
        if(!query?.phone) {
            message.warning('phone参数错误！')
        }else {
            this.props.dispatch({
                type: 'login/login',
                payload: {
                    'username': query?.phone,
                    'password': 'huzan8888',
                    'grant_type': 'password',
                    'client_id': 9,
                },
                callback: (meta, data, error) => {
                    if(meta?.code !== 200) {
                        message.warning(meta?.message)
                    }
                    console.log('login success！', meta)
                },
            })
        }

    }

    render() {
        return (
            <div className={styles.autoLogin}>
                <div className={styles.tip}>跳转中.....</div>
            </div>
        )
    }
}
