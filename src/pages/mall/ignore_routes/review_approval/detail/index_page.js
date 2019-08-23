import { Component } from 'react'
import {connect} from 'dva'
import router from 'umi/router'
import Page from 'components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import DocumentTitle from 'react-document-title'
import ApprovalCon from './ApprovalCon'
import { Spin, Icon } from 'antd'
import styles from './index.less'

@connect(({base, trends_management, review_approval}) => ({
    base,
    trends_management,
    review_approval,
}))
@documentTitleDecorator()
export default class Index extends Component {
    state= {
        type: '', 
        title: '', 
        img: '', 
        content: '', 
        updateTime: '', 
        id: '',
        status: '',
        pageTit: '未审批',
        loading: false,
    }
    componentDidMount(){
        this.props.dispatch({
            type: 'trends_management/getToken',
            payload: {
                type: 'image',
            }
        })
        this.checkShow()
    }
    checkShow = ()=> {
        const { id, status } = this.props.location.query
        if(parseInt(status,10) === 1){
            this.setState({
                pageTit: '未审批',
            })
        }else if(parseInt(status,10) === 2){
            this.setState({
                pageTit: '已通过',
            })   
        }else{
            this.setState({
                pageTit: '未通过',
            })
        }
        if (id) {
            this.setState({
                loading: true
            })
            this.props.dispatch({
                type: 'trends_management/getTrendDetail',
                payload:{
                    id: id
                },
                callback: (data) => {
                    this.setState({
                        loading: false
                    })
                    if(data.type === 1){
                        this.setState({
                            type: 1,
                            title: data.content,
                            img: data.images,
                            updateTime: data.created_at,
                        })
                    }else{
                        this.setState({
                            type: 2,
                            title: data.title,
                            content: data.content,
                            updateTime: data.created_at,
                            img: [{
                                id: 1,
                                img_url: data.cover_url,
                            }],
                        })
                    }
                }
            })
            this.setState({
                id: id,
                status: status
            })
        }
    }
    onClickAll = ()=> {
        const { id } = this.props.location.query
        router.push(`/mall/trends_management/trendDetail?id=${id}`)
    }
    render(){
        const { photoPrefix } = this.props.trends_management
        const { commentTotalSize } = this.props.review_approval
        const { type, title, img, content, updateTime, id, status, pageTit, loading } = this.state
        return (
            <DocumentTitle title={pageTit}>
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '评论审批',
                            path: '/mall/review_approval'
                        },{
                            name: pageTit
                        }]} 
                    />
                    <div className={styles.detailWarp}>
                        {/* 头部 */}
                        <Spin spinning={loading}>
                            <div className={styles.detailCont}>
                                {
                                    type===1&&(
                                        <div>
                                            <span className={styles.detailShort}>{title.length>60?(`${title.slice(0,60)}...`):title}<a className={styles.detailAll} onClick={this.onClickAll}>全文></a></span>
                                            <span className={styles.detailTime}>{updateTime}</span>
                                        </div>
                                    )
                                }
                                {
                                    type===2&&(
                                        <div>
                                            <span className={styles.detailTitle}>{title.length>60?(`${title.slice(0,60)}...`):title}</span>
                                            <span className={styles.detailTime}>{updateTime}</span>
                                        </div>
                                    )
                                }
                                {
                                    content&&(<div className={styles.detailContent}><div style={{display: 'inline-block'}} dangerouslySetInnerHTML={{__html: content}}></div><a className={styles.detailAll} onClick={this.onClickAll}>全文<Icon style={{fontSize: 12, marginLeft:4}} type="down" theme="outlined" /></a></div>)
                                }
                                <div>
                                    {
                                        img.length>0&&
                                        (                                       
                                            img.map((item,index)=>{
                                                return <img key={index} src={`//${photoPrefix}/${item.img_url}`} alt=''/>
                                            })
                                        )
                                    }
                                </div>
                            </div>
                        </Spin>
                        {/* 评论内容 */}
                        <Page.ContentBlock title={`评论（${commentTotalSize}）`} hasDivider={false}>
                            <div className={styles.contentBorder}></div>
                            <ApprovalCon id={id} status={status} location={this.props.location} history={this.props.history}/>
                        </Page.ContentBlock>
                    </div>
                </Page>
            </DocumentTitle>
        )
    }
}