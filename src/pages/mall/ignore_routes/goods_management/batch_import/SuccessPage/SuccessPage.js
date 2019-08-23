/*
 * @Author: zhousong 
 * @Date: 2019-2-25
 * @Discription: 商品批量导入完成页面组件
 */

import { PureComponent } from 'react'
import { Button } from 'antd'
import styles from './index.less'
import router from 'umi/router'

export default class extends PureComponent {
    state = {
        countDown: 5
    }
    
    componentDidMount () {
        let { countDown } = this.state
        let timer = setInterval(() => {
            this.setState({
                countDown: countDown--
            }, () => {
                if (this.state.countDown === 0) {
                    clearInterval(timer)
                    router.replace({pathname: '/mall/goods_management'})
                }
            })
        }, 1000)
    }

    onJump = () => {
        router.replace({pathname: '/mall/goods_management'})
    }

    render () {
        const { countDown } = this.state

        return (
            <div className={styles.successImport}>
                <div className={styles.title}>
                    <img src={require(`mall/assets/images/complete.svg`)} alt=''></img>
                    <span>商品导入完成</span>
                </div>
                
                <div className={styles.tips}>操作成功，数据将会在5-10分钟内陆续写入，请耐心等待。</div>
                <div className={styles.tips}>{countDown}秒后自动跳转商品库界面，<a href='javascript:;' onClick={this.onJump}>点击手动跳转</a></div>
            </div>
        )
    }
}