// 评论内容
import { Fragment } from 'react'
import {connect} from 'dva'
import { Form, Divider, Button, Input, Pagination, List  } from 'antd'
import styles from './index.less'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../../components/business/Page'
const DEFAULT_CONDITION = {
    id: '',
}

@connect(({base, trends_management}) => ({
    base,
    trends_management,
}))
@Form.create()
export default class extends Page.ListPureComponent {
    state = {
        clickId: '',
        isReplay: false,
        // 回复内容
        content: '', 
        loading: false,
    }
    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        console.log(condition)
        this.getPageData(condition, pager, isSetHistory)
    }
    getPageData = (condition, pager, isSetHistory = true,callback) => {
        if( isSetHistory ){
            this.history(condition, pager)
        }
        this.setState({
            condition: condition,
            pager: pager,
            loading: true
        })
        this.props.dispatch({
            type: 'trends_management/getTrendComment',
            payload: {
                page: pager.current,
                per_page: pager.pageSize,
                feed_id: condition.id,
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
                callback && callback(data)
            }
        })
    }
    searchData = () => {
        const condition = {
            ...this.state.condition,
        }
        const pager = {
            pageSize : this.state.pager.pageSize,
            current : DEFAULT_PAGER.current
        }
        this.getPageData(condition, pager)
    }

    renderRight = (item)=> {
        const { clickId } = this.state
        if(item.status === 3){
            return (
                <div className={styles.contentRight}>
                    <img src={require('mall/assets/images/unshow.png')} alt=''/>
                </div>
            )
        }else if(item.status === 2 && !item.reply && item.id!==clickId){
            return (
                <div className={styles.contentRight}>
                    <div className={styles.rightReplay}>
                        <Button type='primary' onClick={()=>this.onClickReplay(item)}>回复</Button>
                    </div>
                </div>
            )
        }else{
            return null
        }
    }
    renderReplay = (item)=> {
        const { clickId, content } = this.state
        if(item.id ===clickId){
            return (
                <div className={styles.comFoot}>
                    <Input placeholder={`回复:${item.nick_name}`} onChange={this.onChangeInput} addonAfter={<div className={content?styles.replayButtActive:styles.replayButt} disabled={content} onClick={()=>this.onReplay(item)}>回复</div>} />
                </div>     
            )
        }
    }
    onClickReplay = (item)=> {
        this.setState({
            clickId: item.id,
            isReplay: true,
        })
    }
    onChangeInput = (e)=> {
        this.setState({
            content: e.target.value,
        })  
    }
    onReplay = (item)=> {
        const { content } = this.state
        const { id } = this.props
        if(!!content){
            //请求接口保存评论回复
            this.props.dispatch({
                type: 'trends_management/postComment',
                payload:{
                    id: item.id,
                    content: content,
                    feed_id: parseInt(id, 10),
                },
                callback: (data)=>{
                    this.setState({
                        content: '',
                        isReplay: false,
                        clickId: '',
                    })  
                    //刷新评论内容
                    // 获取评论
                    this.searchData()
                }
            })
        }
    }
    render () {
        const { loading } = this.state
        const { commentData, commentCurrentPage, commentPerPage, commentTotalSize } = this.props.trends_management
        return (
            <Fragment>
                <List
                    className={styles.listContent}
                    itemLayout="vertical"
                    bordered={false}
                    locale={'暂无数据'}
                    split={false}
                    pagination={false}
                    loading={loading}
                    dataSource={commentData}
                    renderItem={item => (
                        <List.Item>  
                            <Fragment key={item.id}>
                                <div>
                                    <div className={styles.comHead}>
                                        <div className={styles.comTitle}>{item.nick_name}</div>
                                        <div className={styles.comTime}>{item.created_at}</div>
                                    </div>
                                    <div className={styles.comContent}>
                                        {/* 左侧内容 */}
                                        <div className={styles.contentLeft}>
                                            {
                                                item.user&&(<div className={styles.leftPhone}>手机号：{item.user.mobile}</div>)
                                            }
                                            <div className={styles.leftCon}>{item.content}</div>
                                        </div>
                                        {/* 右侧内容 */}
                                        {/* status为2时候且没有回复则显示回复按钮，status为3时候则为不显示 */}
                                        {
                                            this.renderRight(item)
                                        }
                                        <div style={{clear: 'both'}}></div>
                                    </div>
                                    {
                                        this.renderReplay(item)
                                    }
                                    {
                                        item.reply&&(
                                            <div className={styles.comFoot}>
                                                {/* 店家回复 */}
                                                <div className={styles.footReplay}>
                                                    <div className={styles.footRepCon}>
                                                        <div className={styles.footRep1}>店家回复:</div>
                                                        <div className={styles.footRep2}>
                                                            <div className={styles.footText}>{item.reply.content}</div>
                                                            <div className={styles.footTime}>{item.reply.created_at}</div>
                                                        </div>
                                                    </div>
                                                    <div className={styles.footArrow}></div>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                                <Divider style={{margin:'16px 0 0 0'}}></Divider>
                            </Fragment>
                        </List.Item>
                    )}
                />
                <div>
                    {
                        commentData.length>0&&(
                            <Pagination
                                className="ant-table-pagination"
                                current={commentCurrentPage}
                                total={commentTotalSize}
                                showTotal={(total) => `共 ${total} 条`} 
                                showQuickJumper={true} 
                                showSizeChanger={true}
                                pageSize={commentPerPage} 
                                pageSizeOptions= {['10', '20', '50', '100']}
                                onShowSizeChange={this.handleListPageChangeSize}
                                onChange={this.handleListPageChange}
                            />
                        )
                    }
                </div>
            </Fragment>
        )
    }
}