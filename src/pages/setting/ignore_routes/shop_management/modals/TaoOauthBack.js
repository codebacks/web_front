import React , {Component} from 'react'
import {connect} from 'dva'
import { Modal, Button } from 'antd'
import { REDIRECT_URL } from '../../../../../common/shopConf'

@connect(({setting_shopManagement, base}) => ({
    setting_shopManagement,
    base,
}))
export default class TaoOauthBack extends Component {  
    skipToPage = ()=>{
        window.open(this.props.setting_shopManagement.auth_url) 
    }
    oauthFail = () => {
        const id = this.props.setting_shopManagement.currentShop.id
        const oauth_type = this.props.setting_shopManagement.oauth_type
        this.props.dispatch({
            type: 'setting_shopManagement/getOauthUrl',
            payload:{ 
                type: oauth_type,  
                shop_id: id,  
                redirect_uri: encodeURIComponent(`${REDIRECT_URL}?type=${oauth_type}&shop_id=${id}&auth_source=1`),  
            },
            callback: (data) => {
                if(!data.error){
                    this.skipToPage()
                }
            }
        })
    }
    oauthLearn = () => {
        window.open('#')
    }
    oauthSuccess = () => {
        this.closeShopOauth()
        this.props.dispatch({
            type: 'setting_shopManagement/getShopList',
            payload:{}
        })
    }
    closeShopOauth = () => {
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload:{ taoOauthBackVisible: false }
        }) 
    }
    render(){
        const { taoOauthBackVisible } = this.props.setting_shopManagement
        return (<div>
            <Modal
                title="店铺授权"
                visible={taoOauthBackVisible}
                onCancel={this.closeShopOauth}
                onOk={this.saveShopOauth}
                width={400}
                footer={(
                    <div>
                        <Button onClick={this.oauthFail}>授权失败，重试</Button>
                        <Button type="primary" onClick={this.oauthSuccess}>已成功授权</Button>
                    </div>
                )}
            > 
                <div>
                    <span>请在新窗口完成淘宝店铺授权</span>
                    <span style={{marginLeft: 10,color: '#4492FF'}} onClick={this.oauthLearn}>使用教程</span>
                </div>
            </Modal>  
        </div>)
    }
}