// 首页概况

import { Component, Fragment } from 'react'
import { connect } from 'dva'
import router from 'umi/router'
import Page from '@/components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import { Form, Row, Col, Popover, Button } from 'antd'
import styles from './index.less'
import MyEcharts from './MyEcharts'
import { jine } from 'utils/display'
import safeSetState from 'hoc/safeSetState'

@connect(({base, home_overview,shop_fitment}) => ({
    base,
    home_overview,
    shop_fitment
}))
@documentTitleDecorator()
@Form.create()
@safeSetState()
export default class Index extends Component {
    state = {
        isConfig: '',
    }
    componentDidMount () {
        this.getProcedure()
        this.props.dispatch({
            type: 'shop_fitment/getCurrentTemplate'
        })
    }
    getProcedure = () => { 
        this.props.dispatch({
            type: 'home_overview/procedure',
            payload: {},
            callback: (data) => {
                // 状态为6的时候说明全部配置完成，正常进入页面，否则进入配置页面
                let status = data.status
                if (status !== 6) {
                    this.setState({
                        isConfig: false,
                    })
                    router.push({
                        pathname: '/mall/initialization',
                    })
                } else { 
                    this.setState({
                        isConfig: true,
                    })
                    this.props.dispatch({
                        type: 'home_overview/getToken',
                        payload: {
                            type: 'image',
                        }
                    }) 
                    this.props.dispatch({
                        type: 'home_overview/getMerchantInfo',
                        payload: {},
                        callback: () => {
                            const { mpa } = this.props.home_overview
                            if (mpa&&!mpa.template_version) {
                                this.props.dispatch({
                                    type: 'home_overview/getMapStatus',
                                    payload: {}, 
                                })
                            }
                        }
                    }) 
                    this.props.dispatch({
                        type: 'home_overview/getTradeInfo',
                        payload: {}
                    }) 
                    this.props.dispatch({
                        type: 'home_overview/getQRCode',
                        payload: {}
                    }) 
                }
            }
        })
    }
    onSkipExp = () => { 
        router.push({
            pathname: '/setting/shop_management/mp_setting',
            params: {
                key:2
            }
        })
    }
    shopInfoEdite = () => { 
        router.push('/setting/shop_management/mp_setting')
    }
    showAccount = () => { 
        router.push('/mall/account')
    }
    editeAccount = () => { 
        router.push('/setting/authorization/pay_setting')
    }
    showRelease = () => { 
        router.push({
            pathname: '/setting/shop_management/mp_setting',
            params: {
                key:3
            }
        })
    }
    setStyle = () => {
        router.push({
            pathname: '/setting/shop_management/mp_setting',
            params: {
                key:4
            }
        })
    }
    render(){
        const CountCard = ({num, title, hasDivider=true})=>{
            return (
                <div className={hasDivider ?  styles.warp : styles.warpNoBorder }>
                    <div className={styles.content}>
                        <div className={styles.contentTitle} style={{marginBottom: 8}}>{num}</div>
                        <div className={styles.contentNum}>{title}</div>
                    </div>
                </div>
            )
        }
        const { shopName, logoUrl, photoPrefix, shopDetail, QRcode, expQRcode, mpa, status } = this.props.home_overview
        const { isConfig } = this.state
        const { template } = this.props.shop_fitment
        
        return (
            <Page>
                <Page.ContentHeader
                    title={this.props.documentTitle}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E8%99%8E%E8%B5%9E%E5%B0%8F%E5%BA%97/%E6%A6%82%E5%86%B5.md"
                />
                {
                    isConfig === true && (
                        <Fragment>
                            <Page.ContentBlock title='店铺信息' hasDivider={false} style={{marginTop: '-16px'}}>
                                {/* 二维码 */}
                                <div className={styles.shopCon}>
                                    <div className={styles.shopList + ' ' + styles.shopInfo}>
                                        <div className={styles.shopInfoLeft}>
                                            {
                                                logoUrl&&(<img src={`//${photoPrefix}/${logoUrl}`} alt='logo' className={styles.shopLogo} />)
                                            }
                                        </div>
                                        <div className={styles.shopInfoRight}>
                                            <div className={styles.shopInfoTop}>
                                                <div className={styles.shopInfoName}>{shopName}</div>
                                                <div className={styles.shopInfoEdite}>
                                                    <span onClick={this.shopInfoEdite}>
                                                        <img src={require('mall/assets/images/editer.svg')} alt='' className={styles.iconClass} />
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={styles.shopInfoBot}>
                                                <div className={styles.shopBotLeft}>
                                                    <div className={styles.shopBotLeftText}>支付商户:{mpa.merchant_no || '暂未设置'}</div>
                                                    <span onClick={this.showAccount}>
                                                        <img src={require('mall/assets/images/show.svg')} alt='' className={styles.iconClass} style={{marginRight: 8}} />
                                                    </span>
                                                    <span onClick={this.editeAccount}>
                                                        <img src={require('mall/assets/images/editer.svg')} alt='' className={styles.iconClass} />
                                                    </span>
                                                </div>
                                                <div className={styles.shopBotRight}>
                                                    <div className={styles.shopBotRightText}>版本:{mpa.template_version? mpa.template_version : (status===1?'未提交审核':(status===2?'审核中':''))}</div>
                                                    <span onClick={this.showRelease}>
                                                        <img src={require('mall/assets/images/editer.svg')} alt='' className={styles.iconClass} />
                                                    </span>
                                                </div>
                                                <div className={styles.shopBotStyle}>
                                                    <div className={styles.shopBotRightText}>界面风格: {template && template.title}</div>
                                                    <span onClick={this.setStyle}>
                                                        <img src={require('mall/assets/images/editer.svg')} alt='' className={styles.iconClass} />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.shopList + ' ' + styles.qrcodeFormal}>
                                        <div className={styles.qrcodeLeft}>
                                            <Popover placement="right" content={(<img className={styles.hoverQrcode} src={`${QRcode?`//${photoPrefix}/${QRcode}`:''}`} alt=''/>)}>
                                                {QRcode&&(<img src={`//${photoPrefix}/${QRcode}`} alt=''/>)}
                                            </Popover>
                                        </div>
                                        <div className={styles.qrcodeRight}>
                                            <div className={styles.qrcodeType}>正式版二维码</div>
                                            <div className={styles.qrcodeText}>欢迎来扫哦</div>
                                        </div>
                
                                    </div>
                                    <div className={styles.shopList + ' ' + styles.qrcodeExpried}>
                                        <div className={styles.qrcodeLeft}>
                                            <Popover placement="right" content={(<img className={styles.hoverQrcode} src={`${expQRcode?`//${photoPrefix}/${expQRcode}`:''}`} alt=''/>)}>
                                                {expQRcode&&(<img src={`//${photoPrefix}/${expQRcode}`} alt=''/>)}
                                            </Popover>
                                        </div>
                                        <div className={styles.qrcodeRight}>
                                            <div className={styles.qrcodeType}>体验版二维码</div>
                                            <div className={styles.qrcodeAdd}>
                                                <Button type='primary' onClick={this.onSkipExp}>添加体验账户</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Page.ContentBlock>


                            <Page.ContentBlock title='数据概览' hasDivider={false}>
                                <Row className={styles.countList}>
                                    <Col span={4}>
                                        <CountCard 
                                            num={
                                                (
                                                    <div>
                                                        <span>今日交易额</span>
                                                    </div>
                                                )
                                            } 
                                            title={
                                                (
                                                    <div className={styles.numColor}>
                                                        <span>￥</span>
                                                        <span>{jine(shopDetail.today_trade,'','Fen')}</span>
                                                    </div>
                                                )   
                                            }
                                        ></CountCard>
                                    </Col>
                                    <Col span={4}>
                                        <CountCard
                                            num={
                                                (
                                                    <div>
                                                        <span>昨日交易额</span>
                                                    </div> 
                                                )
                                            } 
                                            title={
                                                (
                                                    <div className={styles.numColor}>
                                                        <span>￥</span>
                                                        <span>{jine(shopDetail.yesterday_trade,'','Fen')}</span>
                                                    </div>
                                                )   
                                            }
                                        ></CountCard>
                                    </Col>
                                    <Col span={4}>
                                        <CountCard
                                            num={
                                                (
                                                    <div><span>今日订单</span></div>
                                                )
                                            } 
                                            title={(<div className={styles.numFont}>
                                                <span>{shopDetail.today_order || 0}</span>
                                            </div>)} 
                                        ></CountCard>
                                    </Col>
                                    <Col span={4}>
                                        <CountCard
                                            num={
                                                (
                                                    <div><span>昨日订单</span></div>
                                                )
                                            } 
                                            title={(<div className={styles.numFont}>
                                                <span>{shopDetail.yesterday_order || 0}</span>
                                            </div>)} 
                                        ></CountCard>
                                    </Col>
                                    <Col span={4}>
                                        <CountCard
                                            num={
                                                (
                                                    <div><span>维权订单</span></div>
                                                )
                                            } 
                                            title={(<div className={styles.numFont}>
                                                <span>{shopDetail.total_after_sale || 0}</span>
                                            </div>)} 
                                        ></CountCard>
                                    </Col>
                                    <Col span={4}>
                                        <CountCard
                                            num={
                                                (
                                                    <div><span>待发订单</span></div>
                                                )
                                            } 
                                            title={(<div className={styles.numFont}>
                                                <span>{shopDetail.express_order || 0}</span>
                                            </div>)}  
                                            hasDivider={false} 
                                        ></CountCard>
                                    </Col>
                                </Row>
                            </Page.ContentBlock>

                            <Page.ContentBlock title='用户流量图' hasDivider={false}>
                                {/* 图表 */}
                                <Col className={styles.echartsContent}>
                                    <MyEcharts/>
                                </Col>
                            </Page.ContentBlock>
                        </Fragment>
                    )
                }
            </Page>
        )
    }
}