
import React,{Fragment} from 'react'
import {connect} from 'dva'
import Page, { DEFAULT_PAGER , DEFAULT_PAGER_FILTER} from '../../../../components/business/Page'
import {Form, Row, Col,Modal} from 'antd'
import {jine} from '../../../../utils/display'
import {Link} from 'dva/router'
import documentTitleDecorator from 'hoc/documentTitle'
import  styles  from './index.less'

const VERSION_RECOMMENDED = 1

@connect(({base,setting_version_information}) => ({
    base,setting_version_information
}))
@Form.create()
@documentTitleDecorator({
    title:'版本信息'
})
export default class versionInformation   extends React.Component{
    constructor(){
        super()
        this.state ={
            highTap:1,
            visible:false,
            consultType:''
        }
    }
    componentDidMount () {
        this.props.dispatch({
            type:'setting_version_information/currentVersion',
            payload:{},
            callback:(value)=>{
                
            }
        })
    }
    handleMouseEnter =(e)=>{
        this.setState({
            highTap:e
        })
    }
    handleMouseLeave =()=>{
        this.setState({
            highTap:1
        })
    }

    versionList = ()=>{
        const { versionInfo } = this.props.setting_version_information
        const {highTap} = this.state
        return  <Fragment>{
            versionInfo.product_version_list.map((value,index)=>{
                return <div  key={value.id}   onMouseLeave={()=>{this.handleMouseLeave()}}   onMouseEnter={()=>{this.handleMouseEnter(index)}}  className={ `${ value.recommended === VERSION_RECOMMENDED && value.recommended === highTap   ? styles.recommend   :''}`  }>

                    <p className={styles.title}>{value.name}</p>
                    <pre className={styles.versionDesc}>
                        微商小单量客户的心头好<br/> 
                        {   versionInfo.id ===10?<Fragment>个人号聚合聊天<br/>统一管理客户<br/>打造在线CRM</Fragment> :
                            <Fragment>电商单多量大的客户别着急<br/>右侧有您的专属定制</Fragment> 
                        }
                    </pre>
                    <p>
                        <span>微信号管控数</span>
                        <span>{value.wechat_count !== null ? `${value.wechat_count}个`:'不限'}</span>   
                    </p>
                    <p>
                        <span>群管理数</span>
                        <span>{value.sync_chat_room_count !== null ? `${value.sync_chat_room_count}个`:'不限'}</span>   
                    </p>
                    <p>
                        <span>个人号聚合聊天</span>
                        <img src={require('@/pages/setting/assets/images/check.svg')}  style={{width:18}}   alt=""/>    
                    </p>
                    <p>
                        <span>标签管理</span>
                        <img src={require('@/pages/setting/assets/images/check.svg')}  style={{width:18}}   alt=""/>  
                    </p>
                    <p>
                        <span>智能朋友圈营销</span>
                        <img src={require('@/pages/setting/assets/images/check.svg')}  style={{width:18}}   alt=""/>     
                    </p>
                    <p>
                        <span>客户群发</span>
                        <img src={require('@/pages/setting/assets/images/check.svg')}  style={{width:18}}   alt=""/>  
                    </p>
                    {/*
                        versionInfo.first_buy === 1?<Fragment>
                            <p className={styles.price}><span>￥{jine(value.price-value.save_price,'','Fen')}</span><span>/个</span> </p>
                            <p className={styles.save_price}><span>首单立减</span><span>￥{jine(value.save_price,'','Fen')}</span></p>
                        </Fragment>:
                            <Fragment>
                                <p className={styles.price}  style={{marginTop:54}}><span>￥{jine(value.price,'','Fen')}</span><span>/个</span> </p>
                            </Fragment>
                    */}
                    <p className={styles.price}  style={{marginTop:versionInfo.id===10?34:54}}><span>￥{jine(value.price,'','Fen')}</span><span>/个</span> </p>
                    <Link  to={{'pathname':'/setting/version_information/buyversion',query:{type:value.id,first_buy:versionInfo.first_buy }}}  className={styles.buy}>立即购买</Link>
                    {/*<p  onClick={()=>{this.handleConsult(1)}} className={styles.buy} style={{marginTop:110}}>立即咨询</p>*/}
                    {
                        versionInfo.first_buy === 1?<Fragment>
                            <p className={styles.triangle}  style={{borderWidth:30}}></p> 
                            <p className={styles.stewardIcon} >限时折扣</p>
                        </Fragment>:''
                    }            
                </div>
            })
        }
        </Fragment>
    }
    handleConsult = (value)=>{
        this.setState({
            visible:true,
            consultType:value
        })
    }
    handleCancel=()=>{
        this.setState({
            visible:false
        })
    }
    grand = ()=>{
        const {highTap} = this.state
        return<Fragment>
            <div  onMouseLeave={()=>{this.handleMouseLeave()}}   onMouseEnter={()=>{this.handleMouseEnter(2)}}  className={ `${ 2 === highTap   ? styles.recommend   :''}`  }>
                <p className={styles.title}>电商版</p>
                <pre className={styles.versionDesc} >
                    电商单多量大客户的掌中宝<br/>
                    打通淘宝、天猫、京东、有赞等电商平台<br/>
                    构建电商平台新生态
                </pre>
                <p>
                    <span>微信号管控数</span>
                    <span>30+</span>   
                </p>
                <p>
                    <span>群管理数</span>
                    <span>150+</span>   
                </p>
                <p>
                    <span>基础版全功能</span>
                    <img src={require('@/pages/setting/assets/images/check.svg')}  style={{width:18}}   alt=""/>  
                </p>
                <p>
                    <span>晒图返现</span>
                    <img src={require('@/pages/setting/assets/images/check.svg')}  style={{width:18}}   alt=""/>  
                </p>
                <p>
                    <span>商品推荐</span>
                    <img src={require('@/pages/setting/assets/images/check.svg')}  style={{width:18}}   alt=""/>  
                </p>
                <p>
                    <span>多元会员权益</span>
                    <img src={require('@/pages/setting/assets/images/check.svg')}  style={{width:18}}   alt=""/>    
                </p>
                <p style={{marginBottom:80}}>
                    <span>客户模型</span>
                    <img src={require('@/pages/setting/assets/images/check.svg')}  style={{width:18}}   alt=""/>  
                </p>
                <p  onClick={()=>{this.handleConsult()}} className={styles.buy}>立即咨询</p>
            </div>
        </Fragment>
    }

    phoneList = () =>{
        const {highTap} = this.state
        const { versionInfo } = this.props.setting_version_information
        let minPrice = versionInfo.phone_list? versionInfo.phone_list.sort((a,b)=>a.price-b.price)[0].price : 0
        return<Fragment>
            <div  onMouseLeave={()=>{this.handleMouseLeave()}}   onMouseEnter={()=>{this.handleMouseEnter(3)}}  className={ `${ 3 === highTap   ? styles.recommend   :''}`  }>
                <p className={styles.title}>专用手机</p>
                <pre className={styles.versionDesc}>员工工作手机<br/>
                无需调试、即买即用<br/>                 
                操作简单、安全稳定<br/> 
                客户精细化运营、员工高效管理必备神器</pre>
                <p className={styles.price}  style={{marginTop:222}}><span>￥{jine(minPrice,'','Fen')}</span><s className={styles.descTip}>起购</s> </p>
                <Link  to={{'pathname':'/setting/version_information/buyphone'}}  className={styles.buy}>立即购买</Link>
            </div>
        </Fragment>
                
    }
    render(){
        const { versionInfo } = this.props.setting_version_information
        const {highTap} = this.state
        let sign_up_time =  versionInfo.sign_up_time ? versionInfo.sign_up_time.substr(0,10):''
        return (
            <Page>
                <Page.ContentHeader
                    title="版本信息"
                />
                <Page.ContentBlock title='当前版本' hasDivider={false} style={{marginTop: '-16px'}}>
                    <Form className={styles.currentVersion}>
                        <Row>
                            <Col  span={3}    className={styles.versionName}>{versionInfo.name}</Col>
                            <Col span={21}>
                                {
                                    versionInfo.id !==10?<Row>
                                        <Col  span={8}><strong>开通时间：</strong>{sign_up_time}</Col>
                                        <Col  span={8}><strong>到期时间：</strong>{versionInfo.expire_in}</Col>
                                    </Row> :<Row><Col>微信号到期时间：个人号-微信号管理-总授权数页面中查看</Col></Row>
                                }
                                <Row>
                                    <Col  span={8}>
                                        <strong>子账号数：</strong>{versionInfo.sub_account_count !==null ? `${versionInfo.sub_account_count}个`:'不限'}
                                    </Col>
                                    <Col  span={8}>
                                        <strong>微信号管控数：</strong>{versionInfo.wechat_count !==null? `${versionInfo.wechat_count}个`:'不限'}
                                    </Col>
                                    <Col  span={8}>
                                        <strong>群管理数：</strong>{versionInfo.sync_chat_room_count !==null ? `${versionInfo.sync_chat_room_count}个`:'不限'}
                                    </Col>
                                </Row> 
                                <Row>
                                    <Col  span={8}>
                                        <strong>店铺数：</strong>{versionInfo.shop_count !==null? `${versionInfo.shop_count}个`:'不限'}
                                    </Col>
                                    {
                                        versionInfo.hasOwnProperty('wx_mps_count')?  <Col  span={8}>
                                            <strong>公众号数：</strong>{versionInfo.wx_mps_count !==null? `${versionInfo.wx_mps_count}个`:'不限'}
                                        </Col>:''
                                    }
                                    <Col  span={8}>
                                     
                                        <strong>云存储空间：</strong>{versionInfo.cdn_size !==null? `${versionInfo.cdn_size}`:'不限'}
                                    </Col>
                                </Row> 
                            </Col>
                        </Row>
                        
                    </Form>
                    
                </Page.ContentBlock>

                <Page.ContentBlock title='高级服务' hasDivider={false}>
                    <div className={styles.VIP}   >
                        {
                            versionInfo.hasOwnProperty('product_version_list')?  
                                this.versionList():''
                        }
                        {
                            versionInfo.status===0?
                                this.grand():''
                        }
                        {
                            this.phoneList()
                        }
                    </div>
                    
                </Page.ContentBlock>
                <Modal
                    title={this.state.consultType?'基础版高级顾问':"电商版高级顾问"}
                    visible={this.state.visible}
                    footer={null}
                    width={480}
                    onCancel={this.handleCancel}
                >
                    <img src={this.state.consultType?require('@/pages/setting/assets/images/wechat_consult.jpg'):require('@/pages/setting/assets/images/counselor.jpg')} style={{width:200,margin:'0 auto',display:'block'}} alt=""/>
                    <p style={{textAlign:'center',color:'#4391FF'}}>手机号：{this.state.consultType?'13816255294':"18616859416"}</p>
                </Modal>
            </Page>
        )
    }

}