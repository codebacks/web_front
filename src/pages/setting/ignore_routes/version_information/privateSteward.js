

import React,{Fragment} from 'react'
import {connect} from 'dva'
import Page, { DEFAULT_PAGER , DEFAULT_PAGER_FILTER} from '../../../../components/business/Page'
import {Form, Row, Col} from 'antd'
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
            highTap:1
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
    render(){
        const { versionInfo } = this.props.setting_version_information
        const {highTap} = this.state
        let created_at =  versionInfo.created_at ? versionInfo.created_at.substr(0,10):''
        return (
            <Page>
                <Page.ContentHeader
                    title="版本信息"
                />
                {versionInfo.wx_mps_count?
                    <Fragment>
                        <Page.ContentBlock title='当前版本' hasDivider={false} style={{marginTop: '-16px'}}>
                            <Form className={styles.currentVersion} style={{width:960}}>
                                <Row>
                                    <Col  span={3}    className={styles.versionName} >{versionInfo.name}</Col>
                                    <Col span={21}>
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
                                            <Col  span={8}>
                                                <strong>公众号数：</strong>{versionInfo.wx_mps_count !==null? `${versionInfo.wx_mps_count}个`:'不限'}
                                            </Col>
                                            <Col  span={8}>
                                                <strong>云存储空间：</strong>{versionInfo.cdn_size !==null? `${versionInfo.cdn_size}`:'不限'}
                                            </Col>
                                        </Row> 
                                    </Col>
                                </Row>
                                
                            </Form>
                            
                        </Page.ContentBlock>
                        {
                            versionInfo.hasOwnProperty('product_version_list')?<Page.ContentBlock title='高级服务' hasDivider={false}>
                                <div className={styles.VIP}>
                                    {
                                        versionInfo.product_version_list.map((value,index)=>{
                                            return <div  key={value.id}   className={  styles.recommend  }>

                                                <p className={styles.title}>{value.name}</p>
                                                <pre className={styles.versionDesc}>{value.description}</pre>
                                                {
                                                    versionInfo.first_buy === 1?<Fragment>
                                                        <p className={styles.price}><span>￥{jine(value.price-value.save_price,'','Fen')}</span><span>/年</span> </p>
                                                        <p className={styles.save_price}><span>首单立减</span><span>￥{jine(value.save_price,'','Fen')}</span></p>
                                                    </Fragment>:<p className={styles.price}><span>￥{jine(value.price,'','Fen')}</span><span>/年</span> </p>
                                                }
                                                <p>
                                                    <span>微信号管控数</span>
                                                    <span>{value.wechat_count !== null ? `${value.wechat_count}个`:'不限'}</span>   
                                                </p>
                                                <p>
                                                    <span>群管理数</span>
                                                    <span>{value.sync_chat_room_count !== null ? `${value.sync_chat_room_count}个`:'不限'}</span>   
                                                </p>
                                                <p>
                                                    <span>店铺数</span>
                                                    <span>{value.shop_count !== null ? `${value.shop_count}个`:'不限'}</span>   
                                                </p>
                                                <p>
                                                    <span>云存储空间</span>
                                                    <span>{value.cdn_size !==null ? `${value.cdn_size}`:'不限'}</span>   
                                                </p>
                                                <Link  to={{'pathname':'/setting/version_information/stewardversion',query:{type:value.id,first_buy:versionInfo.first_buy }}}  className={styles.buy}>立即购买</Link>
                                                {
                                                    versionInfo.first_buy === 1?<Fragment>
                                                        <p className={styles.triangle}  style={{borderWidth:30}}></p> 
                                                        <p className={styles.stewardIcon} >限时折扣</p>
                                                    </Fragment>:''
                                                }            
                                            </div>
                                        })
                                    }
                                </div>
                            </Page.ContentBlock>:""
                        }
                    </Fragment>:""
                }
            </Page>
        )
    }

}