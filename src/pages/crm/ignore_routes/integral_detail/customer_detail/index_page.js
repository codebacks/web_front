/**
 **@time: 2018/12/19
 **@Description:客户积分详情页
 **@author: zhousong
 */

import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from 'components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import { Table ,Pagination} from 'antd'
import router from 'umi/router'
import { connect } from 'dva'
import styles from '../index.less'


const DEFAULT_CONDITION = {
    id:''
}

@documentTitleDecorator({
    overrideTitle: '明细',
})
@connect(({ base,crm_intergral }) => ({
    base,
    crm_intergral
}))
export default class Index extends Page.ListPureComponent {
    state = {
        loading: true,
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER }
    }
    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        const {query} = this.props.location
        if(query.id){
            this.getPageData(condition, pager, isSetHistory)
        }else{
            router.push(`/crm/integral_detail`)
        }
        
    }
    getPageData = (condition, pager, isSetHistory = true, callback) => {
        if (isSetHistory) {
            this.history(condition, pager)
        }
        this.setState({
            condition: condition,
            pager: pager,
            loading: true
        })
        this.props.dispatch({
            type:'crm_intergral/pointsListDetail',
            payload:{
                point_id:condition.id,
                offset: pager.current - 1,
                limit: pager.pageSize,
            }
        })
    }
    /**页面事件 */
    render() {
        const columns = [
            {
                title: '时间',
                dataIndex: 'created_at'
            },
            {
                title: '积分变化',
                dataIndex: 'count',
                render:(text,record,index)=>{
                    if(text){
                        return <span>{record.type === 1 ? '+' : '-'}{text/100}</span>
                    }else{
                        return text
                    }
                }
            },
            {
                title: '来源/用途',
                dataIndex: 'description'
            },
            {
                title: '积分剩余',
                dataIndex: 'balance_count',
                render:(text,record,index)=>{
                    if(text){
                        return text/100
                    }else{
                        return text
                    }
                }
            },{
                title: '操作人',
                dataIndex: 'operation_name'
            }
        ]
        const {pointsListDetail,pointsListDetailTotal,pointDetailLoading} = this.props.crm_intergral
        const { current, pageSize } = this.state.pager
        return (
            <Page>
                <Page.ContentHeader
                    
                    hasGutter={false}
                    breadcrumbData={[{
                        name: '积分明细',
                        path: '/crm/integral_detail'
                    },{
                        name: '明细'
                    }]}
                /> 
                {/*搜索条件框*/}
                <div className={styles.wxChat_info}>
                    <span>微信昵称：</span>{pointsListDetail.name}
                    <span style={{marginLeft:'16px'}}>微信号：</span>{pointsListDetail.wx_id}
                </div>
                <Table
                    rowKey='id'
                    columns={columns}
                    pagination={false}
                    loading={pointDetailLoading}
                    dataSource={pointsListDetail.items}
                />
                {pointsListDetail.items&&pointsListDetail.items.length>0 ?
                    <Pagination
                        className="ant-table-pagination"
                        current={current}
                        total={pointsListDetailTotal}
                        showTotal={(total) => `共 ${total} 条`} 
                        showQuickJumper={true} 
                        showSizeChanger={true}  
                        pageSize={pageSize} 
                        pageSizeOptions= {['10', '20', '50', '100']}
                        onShowSizeChange={this.handleListPageChangeSize}
                        onChange={this.handleListPageChange} />
                    : ''
                }
            </Page>
        )
    }
}
