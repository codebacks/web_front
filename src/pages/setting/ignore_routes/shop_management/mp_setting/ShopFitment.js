import { Component } from 'react'
import { connect } from 'dva'
import router from 'umi/router'
import { Button } from 'antd'
import styles from './index.less'

@connect(({shop_fitment}) => ({
    shop_fitment
}))
export default class extends Component {
    componentDidMount(){
        this.props.dispatch({
            type: 'shop_fitment/getCurrentTemplate'
        })
    }
    go = (e) =>{
        router.push('/shop_fitment')
    }
    render(){
        const { template } = this.props.shop_fitment
        return <div className={styles.shop_fitment}>
            <p><span>当前风格：</span>{template && template.title}</p>
            <p><span>风格版本：</span>{template && template.version}</p>
            <Button type='primary' onClick={(e)=> this.go(e)}>开始装修</Button>
        </div>
    }
}


