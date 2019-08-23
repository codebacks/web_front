import React from 'react'
import DocumentTitle from 'react-document-title'
import {Spin} from 'antd'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../../components/business/Page'
// import Page from '@/components/business/Page'
import { connect } from 'dva'
import router from 'umi/router'
import styles from '../index.less'

const DEFAULT_CONDITION = {
    id:''
}

@connect(({base,setting_notice}) => ({
    base,
    setting_notice
}))
export default class extends Page.ListPureComponent {
    state = {
        condition: { ...DEFAULT_CONDITION },
        loading:false,
    }
    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        const {id} = condition
        if(id){
            this.getPageData(condition, pager, isSetHistory)
        }else{
            router.push('/setting/notice')
        } 
    }
    getPageData = (condition, pager, isSetHistory = true, callback) => {
        if (isSetHistory) {
            this.history(condition, pager)
        }
        this.setState({
            condition: condition,
            loading:true
        })
        this.props.dispatch({
            type:'setting_notice/getNoticeDetail',
            payload:{
                id:Number(condition.id)
            },
            callback:(res)=>{
                if(res.data && res.meta.code === 200){
                    if(res.data.status === 2 && !res.data.read){
                        // 已发布并且未读状态
                        this.setReadStaus()
                    }
                }
                this.setState({
                    loading:false
                })
            }
        })
    }
    componentDidUpdate(prevProps, prevState){
        if(prevProps.location.pathname === this.props.location.pathname && prevProps.location.search !== this.props.location.search){
            // 后退或前进按钮，重新触发initPage事件
            this.initPage()
        }
    }
    // 设置为已读
    setReadStaus = () =>{
        const {query} = this.props.location
        this.props.dispatch({
            type:'setting_notice/setReadStatus',
            payload:{
                id:Number(query.id),
                read:true
            }
        })
    }
    render () {
        const {getNoticeDetail} = this.props.setting_notice
        const {query} = this.props.location
        return(
            <DocumentTitle title="消息详情">
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '系统公告',
                            path: '/setting/notice'
                        },{
                            name: '消息详情'
                        }]}
                    />
                    <Spin spinning={this.state.loading}>
                        {
                            getNoticeDetail.status === 2 && (
                                <div className={styles.noticeDetailPage}>
                                    <div className={styles.noticeTitle}>{getNoticeDetail.title}</div>
                                    <div className={styles.noticeTime}>{getNoticeDetail.online_at}</div>
                                    {
                                        query.id && (
                                            <div dangerouslySetInnerHTML={{__html:getNoticeDetail.content}}></div>
                                        )
                                    }
                                </div>
                            )
                        }
                        {
                            getNoticeDetail.status === 3 && (
                                <div className={styles.recallnoticePage}>
                                    <img src={require('../../../assets/images/recallnotice.png')} alt=""/>
                                    <p>您看的内容不存在哦～</p>
                                </div>
                            )
                        }
                    </Spin>  
                </Page>
            </DocumentTitle>
        )
    }
}
