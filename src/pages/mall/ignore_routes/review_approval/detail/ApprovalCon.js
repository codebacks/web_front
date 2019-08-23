// 评论内容
import { Fragment } from 'react'
import { connect } from 'dva'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../../components/business/Page'
import { Form,  Button, List, Pagination  } from 'antd'
import styles from './index.less'
const DEFAULT_CONDITION = {
    id: '',
    status: '',
}

@connect(({base, review_approval}) => ({
    base,
    review_approval,
}))
@Form.create()
export default class extends Page.ListPureComponent {
    state = {
        loading: false,
    }
    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
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
            type: 'review_approval/getCommentData',
            payload: {
                page: pager.current,
                per_page: pager.pageSize,
                feed_id: condition.id,
                status: condition.status,
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
        if(item.status === 3){
            return (
                <div className={styles.contentRight}>
                    <img src={require('mall/assets/images/failed.png')} alt=''/>
                </div>
            )
        }else if(item.status === 2){
            return (
                <div className={styles.contentRight}>
                    <img src={require('mall/assets/images/passed.png')} alt=''/>
                </div>
            )
        }else if(item.status === 1){
            return (
                <div className={styles.contentRight}>
                    <div className={styles.rightReplay}>
                        <Button type='primary' className={styles.rightReplayPass} onClick={()=>this.onClickPass(item)}>通过</Button>
                        <Button onClick={()=>this.onClickRefuse(item)}>不通过</Button>
                    </div>
                </div>
            )
        }else{
            return null
        }
    }
    onClickPass = (item)=> {
        const { id } = this.props
        this.props.dispatch({
            type: 'review_approval/changeCommentStatus',
            payload:{
                id: item.id,
                status: 2,
                feed_id: parseInt(id,10),
            },
            callback: (data)=>{
                // console.log(data)
                this.reloadComment()
            }
        })
    }
    onClickRefuse = (item)=> {
        const { id } = this.props
        this.props.dispatch({
            type: 'review_approval/changeCommentStatus',
            payload:{
                id: item.id,
                status: 3,
                feed_id: parseInt(id,10),
            },
            callback: (data)=>{
                // console.log(data)
                this.reloadComment()
            }
        })
    }
    reloadComment = ()=> {
        this.searchData()
    }
    render(){
        const { commentData, commentCurrentPage, commentPerPage, commentTotalSize } = this.props.review_approval
        const { loading } = this.state
        return (
            <Fragment>
                <div>
                    {
                        commentData.length>0
                            ?
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
                                                <div className={styles.comList}>
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
                                                        {
                                                            this.renderRight(item)
                                                        }
                                                        <div style={{clear: 'both'}}></div>
                                                    </div>
                                                </div>
                                            </Fragment> 
                                        </List.Item>
                                    )}
                                />
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
                            </Fragment>
                            :(<div className={styles.comNoComment}>暂无评论</div>) 
                    }
                </div>
            </Fragment>
        )
    }
}