import React, {Component} from 'react'
import {connect} from 'dva'
import router from 'umi/router'
import { Button, Form, Checkbox, Divider, message } from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import {winOpen} from '@/utils'
import styles from './index.less'

@connect(({base}) => ({
    base,
}))
@documentTitleDecorator()
@Form.create()
export default class Index extends Component {
    constructor(props){
        super(props)
        const { accessToken } = this.props.base
        if(!accessToken){
            router.replace('/login')
        }
        this.state = {
            checked: false
        }
    }
    onClick = ()=>{
        this.props.form.validateFields((err, values) =>{
            if(!err){
                let skipUrl = this.props.location&&this.props.location.query&&this.props.location.query.name || ''
                const parrten = /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:\/~+#]*[\w\-@?^=%&\/~+#])?$/
                skipUrl = skipUrl&&this.atou(skipUrl)
                if(skipUrl&&parrten.test(skipUrl)){
                    winOpen(skipUrl)
                }else{
                    message.warning('出错啦~~')
                }
            }
        })
    }
    atou = (str)=>{
        return decodeURIComponent(escape(window.atob(str)))
    }
    showAgreeMent = ()=>{
        router.push('/setting/oauth_agreement/detial')
    }
    onChange = (e) => { 
        let value = e.target.checked
        let data
        if (value === true) {
            data = 1
        } else { 
            data = null
        }
        this.setState({
            checked: value
        },()=>{
            this.props.form.setFieldsValue({
                agreement: data
            })
        })
    }
    render(){
        const { getFieldDecorator } = this.props.form
        return (
            <div className={styles.mainWrap}>
                <div className={styles.content}>
                    <div className={styles.head}>
                        <img src={require('../../assets/images/huzan_logo.png')} alt='' />
                        <Divider type="vertical" />
                        <div>店铺授权服务</div>
                    </div>
                    <div className={styles.listTop}>该服务由<b>「虎赞科技&传奇交易」</b>提供，将获得以下权限：</div>
                    <div className={styles.list}>
                        <ul>
                            <li>读取您的用户名等基本信息</li>
                            <li>读取或更新您店铺的商品数据</li>
                            <li>读取或更新您店铺的订单、评价、退款等信息</li>
                            <li>读取或更新您店铺的商品运费模板、订单发货等物流相关信息</li>
                            <li>读取或更新您的“分销业务”信息</li>
                        </ul>
                    </div>
                    <Form.Item className={styles.agree}>
                        {getFieldDecorator('agreement', {
                            rules: [{
                                required: true,
                                message: '请阅读并同意协议',
                            }],
                            valuePropName: 'checked',
                        })(
                            <span>
                                <Checkbox onChange={this.onChange} checked={this.state.checked}>已阅读并同意</Checkbox>
                            </span>
                        )}
                        <div className={styles.agreeStyle} onClick={this.showAgreeMent}>《授权协议》</div>
                    </Form.Item>
                    <Form.Item>
                        <Button type='primary' onClick={this.onClick} style={{width: '100%'}}>前往店铺授权</Button>
                    </Form.Item> 
                </div>
            </div>
        )
    }
}