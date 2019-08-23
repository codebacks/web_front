import { Fragment } from 'react'
import {connect} from 'dva'
import router from 'umi/router'
import documentTitleDecorator from 'hoc/documentTitle'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import { Form, Row, Col, DatePicker, Button, List, Icon, Modal, Pagination, message  } from 'antd'
import { getImageAbsoulteUrl } from '../../../../utils/resource'
import moment from 'moment'
import styles from './index.less'
import SelectType from './modal/SelectType'
const { RangePicker } = DatePicker
const confirm = Modal.confirm
const DEFAULT_CONDITION = {
    beginAt: '',
    endAt: '',
}

@documentTitleDecorator({
    title: '签名管理'
})
@connect(({base, trends_management}) => ({
    base,
    trends_management,
}))
@Form.create()
export default class extends Page.ListPureComponent {
    state = {
        visible: false,
        loading: false,
        showAll: false,
        currentId: '',
        condition: {...DEFAULT_CONDITION},
        pager: {...DEFAULT_PAGER}
    }
    componentDidMount () { 
        super.componentDidMount()
        this.props.dispatch({
            type: 'trends_management/getToken',
            payload: {
                type: 'image',
            }
        })
    }
    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        const { beginAt, endAt } = condition
        this.getPageData(condition, pager, isSetHistory)
        this.props.form.setFieldsValue({
            'rangePicker': beginAt && endAt ? [moment(beginAt),moment(endAt)] : [],
        })
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
            type: 'trends_management/getTrendList',
            payload: {
                page: pager.current,
                per_page: pager.pageSize,
                begin_at: condition.beginAt,
                end_at: condition.endAt,
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
        const { form } = this.props
        form.validateFields((error,value) => {
            let beginAt = '', endAt = '' 
            if (value.rangePicker && value.rangePicker.length !== 0) {
                beginAt = value.rangePicker[0].format('YYYY-MM-DD')
                endAt = value.rangePicker[1].format('YYYY-MM-DD')
            }
            const condition = {
                ...this.state.condition,
                ...{
                    endAt: endAt,
                    beginAt: beginAt,
                }
            }
            const pager = {
                pageSize : this.state.pager.pageSize,
                current : DEFAULT_PAGER.current
            }
            this.getPageData(condition, pager)
        })
    }
    onSearch = ()=> {
        this.searchData()
    }
    onRelease = ()=> {
        this.openModal()
    }
    openModal = ()=> {
        this.setState({
            visible: true,
        })
    }
    closeModal = ()=> {
        this.setState({
            visible: false,
        })
    }
    editeTrend = (item)=> {
        // console.log(item)
        //短动态
        if(item.type === 1){
            router.push(`/mall/trends_management/addShort?id=${item.id}`)
        }else{
            router.push(`/mall/trends_management/addLong?id=${item.id}`)
        }     
    }
    showTrend = (item)=> {
        router.push(`/mall/trends_management/trendDetail?id=${item.id}`)
    }
    deleteTrend = (item)=> {
        const _this=this
        confirm({
            className: styles.confirmModal,
            title: '确定删除该条动态?',
            // content: '确定删除该条动态',
            onOk() {
                _this.props.dispatch({
                    type: 'trends_management/deleteTrend',
                    payload: {
                        id: item.id
                    },
                    callback: ()=>{
                        message.success('删除成功')
                        //删除后，重新请求数据刷新
                        _this.searchData() 
                    }
                })  
            },
            onCancel() {},
        })  
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
                <span>${item.description.slice(0,140)}<span onClick={()=>this.showAll(item)} className={styles.cardContentPart}>...全文<Icon style={{fontSize: 12, marginLeft:4}} type="down" theme="outlined" /></span></span>
            ) 
        } 
    }
    render(){
        const { trendList, currentPage, perPage, totalSize } =this.props.trends_management
        const { visible, loading } = this.state
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '70px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
                style: {
                    marginRight: '40px'
                } 
            },
        }
        return (
            <Page>
                <Page.ContentHeader
                    title={this.props.documentTitle}
                    action={(
                        <div>
                            <Button type="primary" onClick={this.onRelease}>发布动态</Button>
                        </div>
                    )} 
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E8%99%8E%E8%B5%9E%E5%B0%8F%E5%BA%97/%E5%8A%A8%E6%80%81%E7%AE%A1%E7%90%86.md"
                />
                <Page.ContentAdvSearch multiple={false}>
                    <Form layout="horizontal" className="hz-from-search">
                        <Row >
                            <Col span={8}>
                                <Form.Item label="发布时间" {...formItemLayout}>
                                    {getFieldDecorator("rangePicker")(
                                        <RangePicker onChange={this.datePickerChange}></RangePicker>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="" {...formItemLayout}>
                                    <Button type="primary" icon="search" onClick={this.onSearch}>搜索</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                {/*列表*/}
                <Row style={{marginBottom: 16}}>
                    <List
                        itemLayout="horizontal"
                        bordered={false}
                        locale={'暂无数据'}
                        split={false}
                        loading={loading}
                        pagination={false}
                        dataSource={trendList}
                        renderItem={item => (
                            <List.Item>
                                <div className={styles.cardStyle}>
                                    {item.type === 1?
                                        (
                                            <Fragment>
                                                <div className={styles.cardTitle}>
                                                    <div className={styles.title1}>{item.content}</div> 
                                                    <div>
                                                        <span className={styles.shortTag}>短动态</span>
                                                    </div>
                                                    <div className={styles.updateTime}>{item.created_at}</div>
                                                </div> 
                                                <div className={styles.cardImage}>
                                                    {
                                                        item.images.map(k=>{
                                                            return  <div className={styles.image} key={k.id}><img src={getImageAbsoulteUrl(k.img_url, { thumbnail: { width: 60, height: 60 } })} alt='' /></div>
                                                        })
                                                    }
                                                </div>
                                            </Fragment> 
                                        )
                                        :
                                        (
                                            <Fragment>
                                                <div className={styles.cardTitle}>
                                                    <div className={styles.title2}>{item.title}</div> 
                                                    <div>
                                                        <span  className={styles.longTag}>长动态</span>
                                                    </div>
                                                    <div className={styles.updateTime}>{item.created_at}</div>
                                                </div>  
                                                <div className={styles.cardContent}>
                                                    {item.description.length>140
                                                        ?
                                                        this.renderShow(item)
                                                        :
                                                        `${item.description}`
                                                    }
                                                </div>
                                                {
                                                    item.cover_url&&(
                                                        <div className={styles.cardImage}>
                                                            <div  className={styles.image} ><img src={getImageAbsoulteUrl(item.cover_url, { thumbnail: { width: 60, height: 60 } })} alt='' /></div>
                                                        </div>
                                                    )
                                                }
                                            </Fragment> 
                                        )
                                    }
                                    {/*操作*/}
                                    <div className={styles.cardOpreate}>
                                        <div className={styles.opreate}>
                                            <span onClick={()=>this.editeTrend(item)}>编辑</span>
                                            <span onClick={()=>this.showTrend(item)}>查看</span>
                                            <span onClick={()=>this.deleteTrend(item)}>删除</span>
                                        </div>
                                        <span className={styles.icon}>
                                            <img className={styles.iconImg1} src={require(`mall/assets/images/views.svg`)} alt=''/>
                                            {item.pv_browse}
                                        </span>
                                        <span className={styles.icon}>
                                            <img className={styles.iconImg2} src={require(`mall/assets/images/approval.svg`)} alt=''/>
                                            {item.comment_success_count}
                                        </span>
                                        <span className={styles.icon}>
                                            <img className={styles.iconImg3} src={require(`mall/assets/images/zan.svg`)} alt=''/>
                                            {item.pv_vote}
                                        </span>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />  
                    {
                        trendList.length>0&&(
                            <Pagination
                                className="ant-table-pagination"
                                current={currentPage}
                                total={totalSize}
                                showTotal={(total) => `共 ${total} 条`} 
                                showQuickJumper={true} 
                                showSizeChanger={true}
                                pageSize={perPage} 
                                pageSizeOptions= {['10', '20', '50', '100']}
                                onShowSizeChange={this.handleListPageChangeSize}
                                onChange={this.handleListPageChange}
                            />
                        ) 
                    }
                </Row>
                <SelectType closeModal={this.closeModal} visible={visible} key={new Date()}></SelectType>
            </Page>
        )
    }
}
