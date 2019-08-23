/*
 * @Author: yecuilin
 * @Date: 2019-03-11
 */

import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '@/components/business/Page'
import DocumentTitle from 'react-document-title'
import { List, Checkbox ,Row, Col,Pagination } from 'antd'
import { connect } from 'dva'
import router from 'umi/router'
import styles from "./index.less"

const DEFAULT_CONDITION = {
    read:''
}

@connect(({base,setting_notice}) => ({
    base,
    setting_notice
}))
export default class Index extends Page.ListPureComponent {
    state = {
        noticeListloading: false,
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER },
        read:'',
    }
    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        // 是否已读 read : 1=已读 0=未读 不传等于全部 
        const {read} = condition
        this.setState({
            read:read
        },()=>{
            this.getPageData(condition, pager, isSetHistory)
        })
    }
    getPageData = (condition, pager, isSetHistory = true, callback) =>{
        if (isSetHistory) {
            this.history(condition, pager)
        }
        this.setState({
            condition: condition,
            pager: pager,
            noticeListloading:true
        })
        this.props.dispatch({
            type:'setting_notice/getNoticeList',
            payload:{
                read:condition.read,
                offset: (pager.current - 1) * pager.pageSize,
                limit: pager.pageSize
            },
            callback:()=>{
                this.setState({
                    noticeListloading:false
                })
            }
        })        
    }
    getNoticeList = () =>{
        const condition = {
            ...this.state.condition,
            ...{
                read: this.state.read,
            }
        }
        const pager = {
            pageSize : this.state.pager.pageSize,
            current : DEFAULT_PAGER.current
        }
        this.getPageData(condition, pager)
    }
    onChange = (e) =>{
        this.setState({
            read:e.target.checked ? 0 : ''
        },()=>{
            this.getNoticeList()
        })
    }
    jumpDetail = (val) =>{
        router.push(`/setting/notice/detail?id=`+val.id)
    }
    render (){
        const {noticeListloading,read} = this.state
        const { current, pageSize } = this.state.pager
        const {getNoticeList,getNoticeList_total} = this.props.setting_notice
        return(
            <DocumentTitle title="系统公告">
                <Page>
                    <Page.ContentHeader
                        title="系统公告"
                    />
                    <div className={styles.CheckboxWrap}>
                        <Checkbox onChange={this.onChange} checked={read === '' ? false : true}>仅看未读</Checkbox>
                    </div>
                    <List 
                        itemLayout="horizontal"
                        bordered={false}
                        split={false}
                        loading={noticeListloading}
                        pagination={false}
                        dataSource={getNoticeList}
                        renderItem={item =>(
                            <div className={styles.listItemWrap} onClick={() =>this.jumpDetail(item)}>
                                <Row type="flex" justify="space-between" align="top" className={styles.title}>
                                    <Col style={{flex:'1'}} className={`${item.read ? styles.activeContent : null}`}>
                                        <div className={styles.titleText}>
                                            {
                                                !item.read &&(
                                                    <span className={styles.statusIcon}></span>
                                                )
                                            }
                                            <span style={{verticalAlign:'middle'}}>
                                                {item.title}
                                            </span>
                                        </div>
                                        <div className={`${styles.content} ${item.read ? null : styles.inactive}`}>{item.summary}</div>
                                    </Col>
                                    <Col  className={styles.time}>{item.online_at}</Col>
                                </Row>
                            </div>
                        )}
                    />
                    {
                        getNoticeList && getNoticeList.length > 0 && (
                            <div style={{width:'80%'}}>
                                <Pagination
                                    className="ant-table-pagination" 
                                    total={getNoticeList_total}
                                    current={current}
                                    showQuickJumper={true}
                                    showTotal={total => `共 ${getNoticeList_total} 条`}
                                    pageSize={pageSize}
                                    pageSizeOptions={['10', '20', '50', '100']}
                                    showSizeChanger={true}
                                    onShowSizeChange={this.handleListPageChangeSize}
                                    onChange={this.handleListPageChange}
                                />
                            </div>
                        )
                    }   
                </Page>
            </DocumentTitle>
        )
    }
}