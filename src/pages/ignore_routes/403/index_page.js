import React from 'react'
import styles from './index.less'
import Link from 'umi/link'
import router from "umi/router"
import {connect} from 'dva'

@connect(({base}) => ({
    base,
}))
export default class LogoutPage extends React.Component {
    constructor(props) {
        super(props)
        const {accessToken} = this.props.base
        if(!accessToken) {
            router.replace('/login')
        }
    }

    render() {
        return (
            <div className={styles.main}>
                <div className={styles.loseImg}>
                    <img alt={'403'} src={require('./images/403.png')}/>
                </div>
                <div className={styles.title}>
                    抱歉，你无权访问该界面
                </div>
                <Link to={'/home'} className={styles.btn}>返回首页</Link>
            </div>
        )
    }
}