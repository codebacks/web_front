import { Component, Fragment } from 'react'
import {connect} from 'dva'
import Page from 'components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import DocumentTitle from 'react-document-title'
import { Form, Spin } from 'antd'
import styles from './index.less'
import CommentCon from './CommentCon'
import AccorLayout from 'mall/components/AccorLayout'

@connect(({base, trends_management}) => ({
    base,
    trends_management,
}))
@documentTitleDecorator()
@Form.create()
export default class Index extends Component {
    state ={
        type: '',
        title: '',
        content: '',
        img: [],
        updateTime: '',
        id: '',
        cover_url: '',
        loading: false,
    }
    componentDidMount () {
        this.props.dispatch({
            type: 'trends_management/getToken',
            payload: {
                type: 'image',
            }
        })
        this.checkShow()
    }
    checkShow = ()=> {
        // console.log(this.props)
        const { id } = this.props.location.query
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
                            updateTime: data.updated_at,
                        })
                    }else{
                        this.setState({
                            type: 2,
                            title: data.title,
                            content: data.content,
                            updateTime: data.updated_at,
                            cover_url: data.cover_url,
                        })
                    }
                }
            })
            // console.log(id)
            this.setState({
                id: id
            })
        }
    }
    render(){
        const { photoPrefix, commentTotalSize } = this.props.trends_management
        const Protocol = window.location.protocol
        const { type, title, content, img, updateTime, id, cover_url, loading } = this.state
        return (
            <DocumentTitle title={'查看动态'}>
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '动态管理',
                            path: '/mall/trends_management'
                        },{
                            name: '查看动态'
                        }]} 
                    /> 
                    {/*详细内容*/}
                    <Page.ContentBlock title='内容' hasDivider={false}>
                        <Spin spinning={loading}>
                            <Form> 
                                {
                                    type===1 && (
                                        <Fragment>
                                            <AccorLayout title='内容：' width={48}>
                                                <span className={styles.contentTitle}>{title}</span>
                                            </AccorLayout>
                                            <AccorLayout title='配图：' width={48} style={{marginBottom: 0}}>
                                                <div>
                                                    {
                                                        img.map(item=>{
                                                            return <div key={item.id} className={styles.imgDetial}><img src={`${Protocol}//${photoPrefix}/${item.img_url}`} alt='' /></div>
                                                        })
                                                    }
                                                </div>
                                                <div className={styles.contentTime}>修改时间：{updateTime}</div>
                                            </AccorLayout>
                                        </Fragment>
                                    )
                                }
                                {
                                    type===2 && (
                                        <Fragment>
                                            <AccorLayout title='标题：' width={48}>
                                                <span className={styles.contentTitle}>{title}</span>
                                            </AccorLayout>
                                            {
                                                cover_url ? (
                                                    <Fragment>
                                                        <AccorLayout title='内容：' width={48}>
                                                            <div className={styles.contentText}><div dangerouslySetInnerHTML={{ __html: content }}></div></div>
                                                        </AccorLayout>
                                                        <AccorLayout title='配图：' width={48} style={{marginBottom: 0}}>
                                                            <span>
                                                                <div className={styles.imgDetial}><img src={`${Protocol}//${photoPrefix}/${cover_url}`} alt='' /></div>
                                                                <div className={styles.contentTime}>修改时间：{updateTime}</div>
                                                            </span>
                                                        </AccorLayout>
                                                    </Fragment>    
                                                ) : (
                                                    <AccorLayout title='内容：' width={48} style={{marginBottom: 0}}>
                                                        <div className={styles.contentText}><div dangerouslySetInnerHTML={{ __html: content }}></div></div>
                                                        <div className={styles.contentTime}>修改时间：{updateTime}</div>
                                                    </AccorLayout>              
                                                )
                                            }
                                        </Fragment>
                                    )
                                }
                            </Form>
                        </Spin>
                    </Page.ContentBlock>
                    {/*评论*/}
                    <Page.ContentBlock title={`评论（${commentTotalSize}）`} hasDivider={false}>
                        <div className={styles.contentBorder}></div>
                        <CommentCon id={id} location={this.props.location} history={this.props.history} ></CommentCon>
                    </Page.ContentBlock>
                </Page>
            </DocumentTitle>
        )
    }
}