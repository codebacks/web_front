import React , {Component} from 'react'
import {connect} from 'dva'
import { Modal, Icon, Row, Col, Popover, Checkbox } from 'antd'
import { OAUTH_TYPE, REDIRECT_URL } from '../../../../../common/shopConf'

@connect(({setting_shopManagement, base}) => ({
    setting_shopManagement,
    base,
}))

export default class ShopOauthTao extends Component {
    constructor(){
        super()
        this.state = {
            isChecked: false,
            ishowTip: false,
        }
    }
    closeShopOauth = () => {
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload:{ shopOauthTaoVisible: false }
        }) 
    }
    skipToPage = ()=>{
        window.open(this.props.setting_shopManagement.auth_url) 
    }
    showOauthBack = ()=>{
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload:{ taoOauthBackVisible: true }
        }) 
    }
    oauthTao = (type) => {
        let typeStr = ''
        if (type === 1) {
            typeStr =  OAUTH_TYPE.OauthByYear
        } else { 
            typeStr =  OAUTH_TYPE.OauthByMonth
        }
        if(this.state.isChecked === false){
            this.setState({
                ishowTip: true
            })
            return
        }
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload:{ oauth_type: typeStr }
        })
        const id = this.props.setting_shopManagement.currentShop.id
        this.props.dispatch({
            type: 'setting_shopManagement/getOauthUrl',
            payload:{ 
                type: typeStr,
                shop_id: id,  
                redirect_uri: encodeURIComponent(`${REDIRECT_URL}?type=${typeStr}&shop_id=${id}&auth_source=1`),  
            },
            callback: (data) => {
                if(!data.error){
                    this.closeShopOauth()
                    this.showOauthBack()
                    this.skipToPage()
                }
            }
        })
    }
    checkChange = (e)=> {
        this.setState({
            isChecked: e.target.checked
        })
        if(e.target.checked === true){
            this.setState({
                ishowTip: false
            })
        }
    }
    OpenXieyiForm = () => {
        this.XieyiForm.openXieyi()
    }
    render(){
        const { shopOauthTaoVisible } = this.props.setting_shopManagement
        const { isChecked } = this.state
        return (<div>
            <Modal
                title="绑定店铺"
                visible={shopOauthTaoVisible}
                onCancel={this.closeShopOauth}
                footer={null}
                width={400}
            > 
                <div style={{color: '#FA8C16',padding: 10, paddingTop: 0 }}>淘宝、天猫店铺初次绑定只同步三个月内的数据，三个月前数据需要下载历史订单上传。</div>
                <Row>
                    <Col span={12} style={{textAlign: 'center',cursor: 'pointer'}} onClick={()=>this.oauthTao(1)}>
                        <div>
                            <img src={require('assets/images/taobao.png')} alt={'淘宝店铺(按年授权)'} />
                        </div>
                        <div style={{marginTop: 10, fontSize: 14}}>
                            <Popover 
                                content="【推荐】付费购买按年授权，店铺自授权日起一年内无需重新授权绑定。" 
                                placement="top"
                                overlayStyle={{width: 180}}
                            > 
                                <span>淘宝店铺(按年授权)</span>
                                <Icon type="question-circle" style={{ color: '#4492FF', marginLeft: 10 }} />
                            </Popover>
                        </div>
                    </Col>
                    <Col span={12} style={{textAlign: 'center',cursor: 'pointer'}}  onClick={()=>this.oauthTao(2)}>
                        <div>
                            <img src={require('assets/images/taobao.png')} alt={'淘宝店铺(按月授权)'} />
                        </div>
                        <div style={{marginTop: 10, fontSize: 14}}>
                            <Popover 
                                content="【免费】淘宝的接口限制，店铺每个月需要重新授权绑定，过期未授权无法同步数据。" 
                                placement="top"
                                overlayStyle={{width: 180}}
                            >
                                <span>淘宝店铺(按月授权)</span>
                                <Icon type="question-circle" style={{ color: '#4492FF', marginLeft: 10 }} />
                            </Popover>
                        </div>
                    </Col>
                </Row>
                <div style={{padding: 10, paddingBottom: 0,  paddingTop: 10 }}>
                    <div style={{ marginLeft: 5 }}>
                        <Checkbox checked={isChecked} onChange={this.checkChange}>已阅读并同意签署</Checkbox>
                        <span style={{marginLeft: -20, color: '#4391FF'}} onClick={this.OpenXieyiForm}>《XXX协议》</span>
                    </div>
                    <div style={{marginTop: 5}}>
                        {
                            this.state.ishowTip===true?
                                <div>
                                    <Icon type="exclamation-circle" style={{color: '#FA8C16',marginRight: 10 }} />
                                    <span>请阅读并同意协议</span>
                                </div>
                                :''
                        }
                    </div>
                </div>
            </Modal>
            <FormContent ref={ node => this.XieyiForm = node}></FormContent>
        </div>)
    }
}


class FormContent extends Component {
    constructor(){
        super()
        this.state = {
            visible : false
        }
    }
    closeXieyi = ()=> {
        this.setState({
            visible : false
        })
    }
    openXieyi = ()=> {
        this.setState({
            visible : true
        })
    }
    render(){
        return (
            <Modal
                title="协议"
                visible={this.state.visible}
                onCancel={this.closeXieyi}
                footer={null}
                width={400}
            >
                <Row>
                    <Col>
                        <div>一、服务条款的确认及接受</div>
                        <div>1、xx客户端软件（以下称“本软件”）各项电子服务的所有权和运作权归属于“XX”所有，本软件提供的服务将完全按照其发布的服务条款和操作规则严格执行。您确认所有服务条款并完成注册程序时，本协议在您与本软件间成立并发生法律效力，同时您成为本软件正式用户。</div>
                        <div>2、根据国家法律法规变化及本软件运营需要，XX有权对本协议条款及相关规则不时地进行修改，修改后的内容一旦以任何形式公布在本软件上即生效，并取代此前相关内容，您应不时关注本软件公告、提示信息及协议、规则等相关内容的变动。您知悉并确认，如您不同意更新后的内容，应立即停止使用本软件；如您继续使用本软件，即视为知悉变动内容并同意接受。</div>
                        <div>二、服务需知</div>
                        <div>1、本软件运用自身开发的操作系统通过国际互联网络为用户提供购买商品等服务。使用本软件，您必须：</div>
                        <div>（1）自行配备上网的所需设备，包括个人手机、平板电脑、调制解调器、路由器等；</div>
                        <div>（2）自行负担个人上网所支付的与此服务有关的电话费用、网络费用等；</div>
                        <div>（3）选择与所安装终端设备相匹配的软件版本，包括但不限于iOS、Android、iPad、Windows Phone等多个XX发布的应用版本。</div>
                        <div>2、基于本软件所提供的网络服务的重要性，您确认并同意：</div>
                        <div>（1）提供的注册资料真实、准确、完整、合法有效，注册资料如有变动的，应及时更新；</div>
                        <div>（2）如果您提供的注册资料不合法、不真实、不准确、不详尽的，您需承担因此引起的相应责任及后果，并且XX保留终止您使用本软件各项服务的权利。</div>
                    </Col>

                </Row>
            </Modal>
        )
    }
}