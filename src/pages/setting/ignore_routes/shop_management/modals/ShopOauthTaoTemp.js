import React , {Component} from 'react'
import {connect} from 'dva'
import router from 'umi/router'
import { Modal, Row, Col } from 'antd'

@connect(({setting_shopManagement, base}) => ({
    setting_shopManagement,
    base,
}))

export default class ShopOauthTaoTemp extends Component {
    closeShopOauth = () => {
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload:{ shopOauthTaoVisible: false }
        }) 
    }
    onOk = ()=>{
        router.push('/setting/orders_import')
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload:{ shopOauthTaoVisible: false }
        }) 
    }
    render(){
        const { shopOauthTaoVisible } = this.props.setting_shopManagement
        return (<div>
            <Modal
                title="提示"
                visible={shopOauthTaoVisible}
                onCancel={this.closeShopOauth}
                width={400}
                okText="去导入"
                onOk={this.onOk}
            > 
                <Row>
                    <Col style={{ lineHeight: 2}}>
                        <div>淘系订单同步支持：</div>
                        <div>1.订单自动同步，服务开通请联系您的专属客服；</div>
                        <div>2.手动导入订单，请直接点击“去导入”按钮。</div>
                    </Col>
                </Row>
            </Modal>
        </div>)
    }
}

