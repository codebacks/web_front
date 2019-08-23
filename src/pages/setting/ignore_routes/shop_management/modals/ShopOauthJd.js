import React , {Component} from 'react'
import {connect} from 'dva'
import { Modal, Button } from 'antd'
import { REDIRECT_URL } from '../../../../../common/shopConf'
import api from 'setting/common/api/shops'

@connect(({setting_shopManagement, base}) => ({
    setting_shopManagement,
    base,
}))

export default class ShopOauthTao extends Component {
    state = {
        skipUrl: 'http://fw.jd.com/385802.html',
    }
    onClose = () => { 
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload: { shopJdVisible: false }
        })
    }
    goToBuy = () => { 
        this.jdBuy.click()
        this.onClose()
    }
    goToOauth = () => { 
        this.jdRefs.click()
        this.onClose()
    }
    render(){
        const { shopJdVisible, currentShop } = this.props.setting_shopManagement
        return (<div>
            <Modal
                title="提示"
                visible={shopJdVisible}
                onCancel={this.onClose}
                footer={(
                    <div>
                        <Button onClick={this.goToBuy}>去购买</Button>
                        <Button type='primary' onClick={this.goToOauth}>去授权</Button>
                    </div>
                )}
                width={400}
            > 
                <div>如果你尚未购买京东订单同步服务，请先购买订单同步服务，如购买了请授权。</div>
                <a ref={node => this.jdRefs = node} href={`${api.getJdOauthUrl.url}?oauth_domain=${encodeURIComponent(`${REDIRECT_URL}?shop_id=${currentShop.id}&auth_source=2`)}`} target='_blank' rel="noopener noreferrer" style={{display: 'none'}}>授权</a>
                <a ref={node => this.jdBuy = node} href={this.state.skipUrl} target='_blank' rel="noopener noreferrer" style={{display: 'none'}}>去购买</a>
            </Modal>

        </div>)
    }
}
