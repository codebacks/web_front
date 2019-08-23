import { Component, Fragment } from 'react'
import {connect} from 'dva'
import router from 'umi/router'
import { List, Icon  } from 'antd'
import styles from './index.less'

@connect(({base, review_approval,trends_management}) => ({
    base,
    review_approval,
    trends_management,
}))
export default class Index extends  Component{
    state = {
        loading: false,
        showAll: false,
        currentId: '',
    }
    static getDerivedStateFromProps (nextProps, state) { 
        // console.log(nextProps)
        if (nextProps.loading !== state.loading) { 
            return {
                loading: nextProps.loading
            }
        }
        return null
    }
    onClick = (item) => {
        const { currentKey } = this.props.review_approval
        router.push(`/mall/review_approval/detail?id=${item.id}&status=${currentKey}`)
    }
    showAll = (item)=> {
        this.setState({
            showAll: true,
            currentId: item.id,
        })
    }
    showPart = (item)=> {
        this.setState({
            showAll: false,
            currentId: item.id,
        })
    }
    renderShow = (item)=> {
        const { showAll, currentId } = this.state
        if(item.id===currentId && showAll=== true){
            return (
                <span>${item.description}<span onClick={()=>this.showPart(item)} className={styles.cardContentPart}>收起<Icon style={{fontSize: 12, marginLeft:4}} type="up" theme="outlined" /></span></span>
            )
        }else{
            return (
                <span>${item.description.slice(0,90)}<span onClick={()=>this.showAll(item)} className={styles.cardContentPart}>...全文<Icon style={{fontSize: 12, marginLeft:4}} type="down" theme="outlined" /></span></span>
            ) 
        } 
    } 
    renderText = (item) => {
        let { currentKey } = this.props.review_approval
        currentKey = parseInt(currentKey, 10)
        let { photoPrefix } =this.props.trends_management
        photoPrefix = photoPrefix || 'image.51zan.com'
        if(parseInt(item.type,10) === 1){
            return (
                <div key={item.id} className={styles.itemWarp}>
                    {
                        item.images.length>0&&(<img src={`//${photoPrefix}/${item.images[0].img_url}`} alt='图片' />)
                    }
                    <div className={styles.itemContent}>
                        <div>
                            <span className={styles.itemTitle}>{item.content}</span>
                            <span className={styles.itemTime}>{item.created_at}</span>
                        </div>
                    </div>
                    <div className={styles.itemStatus} onClick={() => this.onClick(item)}>{`${currentKey===1?`未审批（${item.comment_rank_count}）`:(`${currentKey===2?`已通过（${item.comment_success_count}）`:`未通过（${item.comment_fail_count}）`}`)}`}</div>
                </div>
            )
        }else{
            return (
                <div key={item.id} className={styles.itemWarp}>
                    {
                        item.cover_url&&(
                            <img src={`//${photoPrefix}/${item.cover_url}`} alt='图片' />
                        )
                    }
                    <div className={styles.itemContent}>
                        <div>
                            <span className={styles.itemTitle}>{item.title}</span>
                            <span className={styles.itemTime}>{item.created_at}</span>
                        </div>
                        <div className={styles.itemDec}>
                            {item.description.length>90
                                ?
                                this.renderShow(item)
                                :
                                `${item.description}`
                            }  
                        </div>
                    </div>
                    <div className={styles.itemStatus}   onClick={()=>this.onClick(item)}>{`${currentKey===1?`未审批（${item.comment_rank_count}）`:(`${currentKey===2?`已通过（${item.comment_success_count}）`:`未通过（${item.comment_fail_count}）`}`)}`}</div>
                </div>
            )
        }
    }
    
    render(){
        const { approvalList } =this.props.review_approval
        const { loading } = this.state
        return (
            <Fragment>
                <List 
                    itemLayout="vertical"
                    bordered={false}
                    locale={'暂无数据'}
                    split={false}
                    loading={loading}
                    pagination={false}
                    dataSource={approvalList}
                    renderItem={item => (
                        <List.Item className={styles.userList}>
                            {this.renderText(item)}
                        </List.Item>
                    )}
                />
            </Fragment>
        )
    }
}

