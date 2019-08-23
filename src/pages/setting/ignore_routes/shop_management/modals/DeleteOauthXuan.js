//解除虎赞小店店铺授权
import React , {Component} from 'react'
import {connect} from 'dva'
import { Modal, message } from 'antd'

@connect(({setting_shopManagement, base}) => ({
    setting_shopManagement,
    base,
}))
export default class DeleteOauthXuan extends Component {
    closeShopOauth = ()=>{
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload:{ shopDeleteXuanVisible: false }
        })  
    }
    saveShopOauth = ()=>{
        const id = this.props.setting_shopManagement.currentShop.id
        this.props.dispatch({
            type: 'setting_shopManagement/deleteOauthXuan',
            payload:{ 
                id:  id
            },
            callback: (data) => {
                this.props.dispatch({
                    type: 'setting_shopManagement/setProperty',
                    payload:{ shopDeleteXuanVisible: false }
                })
                if(!data.error){
                    message.success('删除授权成功')
                    this.props.dispatch({
                        type: 'setting_shopManagement/getShopList',
                        payload:{}
                    }) 
                }
            }
        })
    }
    render(){
        const { shopDeleteXuanVisible } = this.props.setting_shopManagement
        return (<div>
            <Modal
                closable={false}
                visible={shopDeleteXuanVisible}
                onCancel={this.closeShopOauth}
                onOk={this.saveShopOauth}
                width={400}
            > 
                <div style={{fontSize: 14,fontWeight: 'bold',marginBottom: 10}}>是否确定解除？</div>
                <div>解除后客户、订单数据不再同步</div>  
            </Modal>  
        </div>)
    }
}