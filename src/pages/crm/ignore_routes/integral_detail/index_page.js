/**
 **@time: 2018/12/17
 **@Description:积分明细
 **@author: yecuilin
 */
import React, {Component, Fragment} from 'react'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '@/components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import { Form, Row, Col, Input, InputNumber,Button, Icon, Table ,Pagination ,Popover,message} from 'antd'
import { connect } from 'dva'
import router from 'umi/router'
// import numeral from 'numeral'
import styles from './index.less'
import {getPlatformTypeByVal} from '../../../../common/shopConf'
import DownloadSvg from '@/assets/font_icons/download.svg'
// import api from '../../common/api/integral'


const DEFAULT_CONDITION = {
    wx_id:'',
    platform_user_id:''
}

@documentTitleDecorator()
@Form.create()
@connect(({ base,crm_intergral }) => ({
    base,
    crm_intergral
}))
export default class Index extends Page.ListPureComponent {
    state = {
        loading: true,
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER },
        visible:false,
        id:'',
        changePointsLoading:false
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        this.getPageData(condition, pager, isSetHistory)
        const { wx_id, platform_user_id } = condition
        this.props.form.setFieldsValue({
            'wx_id': wx_id,
            'platform_user_id': platform_user_id
        })
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
            type: 'crm_intergral/searchPointsList',
            payload:{
                offset: pager.current - 1,
                limit: pager.pageSize,
                wx_id:condition.wx_id,
                platform_user_id:condition.platform_user_id,
            }

        })
    }

    /**公共方法 */

    /**页面事件 */
    onSubmit = (e) => {
        e.preventDefault()
        this.handleSearch()
    }
    onReset = () => {
        this.props.form.resetFields()
        this.handleSearch()
    }
    handleSearch = () =>{
        const { form } = this.props
        form.validateFields((error,value) => {
            const condition = {
                ...this.state.condition,
                ...{
                    wx_id: value.wx_id || '',
                    platform_user_id: value.platform_user_id || ''
                }
            }
            const pager = {
                pageSize : this.state.pager.pageSize,
                current : DEFAULT_PAGER.current
            }
            this.getPageData(condition, pager)
        })
    }
    // 导出记录
    export = () =>{
        this.props.dispatch({
            type:'crm_intergral/exportReport',
            callback:(data) =>{
                if(data && data.meta.code === 200){
                    window.location.href = data.data.url
                }
            }
        })
    }
    handleDetail = (id) => {
        router.push(`/crm/integral_detail/customer_detail?id=${id}`)
    }
    make = (type,v) =>{
        let platform_type = ''  
        return v.map((v,i) =>{
            platform_type = getPlatformTypeByVal(v.platform)
            return <p className={styles.showPlatformItem} key={v.id}>{platform_type}：{v.platform_user_id} <span>{type === 'two'&& i === 1 ? '...' : ''}</span></p>
        })
    }
    checkPlatform = (val) =>{
        if(val && val.length){
            if(val.length > 2){
                return <Popover placement="topLeft" content={
                    <div>
                        {this.make('all',val)}
                    </div>
                } title={null} trigger="hover">
                    <div className={styles.shoppingClass}>
                        {this.make('two',val.slice(0,2))}     
                    </div>         
                </Popover>                
            }else{
                return <div>
                    {this.make('all',val)}
                </div>
            }            
        }else{
            return ''
        }
    }
    showPoints = (text) =>{
        if(text){
            return <span>{text/100}</span>
        }else{
            return <span>{text}</span>
        }
    }
    changePoints = (data) =>{
        this.setState({
            visible:true,
            id:data.id
        })
    }
    
    handleOk = () =>{
        this.formContent.validateFields((err, values)=>{
            if(!err){          
                this.changePoint(values.points_limit)
            }
        }) 
        
    }
    changePoint = (num) =>{
        this.setState({
            changePointsLoading:true
        })
        this.props.dispatch({
            type:'crm_intergral/changeIntegral',
            payload:{
                id:this.state.id,
                balance_count:num*100
            },
            callback:(res) =>{
                this.setState({
                    changePointsLoading:false
                })
                if(res.data && res.meta.code === 200){
                    message.success('积分修改成功!')
                    this.setState({
                        visible:false,
                        id:''
                    })
                    const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
                    const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
                    this.getPageData(condition, pager)
                }
                
            }
        })
    }
    handleCancel = () =>{
        this.setState({
            visible:false,
            id:''
        })
    }
    render() {
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '80px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const columns = [
            {
                title: '微信昵称',
                dataIndex: 'name'
            },
            {
                title: '微信号',
                dataIndex: 'wx_id'
            },
            {
                title: '绑定时间',
                dataIndex: 'binded_at'
            },
            {
                title: '绑定购物号',
                dataIndex: 'member',
                key: 'member',
                render:(text,record,indx) => (
                    this.checkPlatform(record.member)
                )
            },
            {
                title: '获取积分',
                dataIndex: 'recieved_count',
                align:'center',
                render:(text,record,index)=>(
                    this.showPoints(text)
                )
            },
            {
                title: '消耗积分',
                dataIndex: 'consumed_count',
                align:'center',
                render:(text,record,index)=>(
                    this.showPoints(text)
                )
            },
            {
                title: '剩余积分',
                dataIndex: 'balance_count',
                align:'center',
                render:(text,record,index)=>{
                    return(
                        <Popover
                            placement="bottom"
                            content={(
                                <div>
                                    <FormComponent
                                        ref={node => this.formContent = node}
                                        visible={this.state.visible} 
                                    >
                                    </FormComponent>
                                    <div style={{textAlign:'right'}}>
                                        <Button size="small" style={{marginRight:8}} onClick={this.handleCancel}>取消</Button>
                                        <Button type="primary" size="small" loading={this.state.changePointsLoading} onClick={this.handleOk}>确定</Button>
                                    </div>
                                </div>
                            )}
                            title="修改剩余积分"
                            trigger="click"
                            visible={this.state.visible && this.state.id === record.id}
                            onVisibleChange={this.handleClickChange}
                        >
                            <span href="javascript:void(0)" onClick={()=>this.changePoints(record)}>
                                {text/100}
                                <Icon type="edit" style={{color:'#4391FF',fontSize:14,marginLeft:8}}/>
                            </span>
                        </Popover>
                        
                    )
                }
            },
            {
                title: '操作',
                dataIndex: 'action',
                render: (value, {id}) => {
                    return <a href='javascript:;' onClick={() => this.handleDetail(id)}>明细</a>
                }
            },
        ]
        const { getFieldDecorator } = this.props.form
        const {searchPointsList,PointsListTotal,PointsListLoading,exportReportLoading} = this.props.crm_intergral
        const { current, pageSize } = this.state.pager
        const {visible} = this.state
        return (
            <Page>
                {/*头部面包屑*/}
                <Page.ContentHeader
                    title={this.props.documentTitle}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E5%AE%A2%E6%88%B7%E7%AE%A1%E7%90%86/%E7%A7%AF%E5%88%86%E8%BF%90%E8%90%A5.md"
                />
                {/*搜索条件框*/}
                <Page.ContentAdvSearch>
                    <Form onSubmit={this.onSubmit}>
                        <Row>
                            <Col span={8}>
                                <Form.Item label='购物账号' {...formItemLayout} style={{marginBottom:'0'}}>
                                    {getFieldDecorator('platform_user_id', {})(
                                        <Input placeholder='请输入客户的购物账号' />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label='客户微信' {...formItemLayout} style={{marginBottom:'0'}}>
                                    {getFieldDecorator('wx_id', {})(
                                        <Input placeholder='请输入客户微信昵称/微信号' />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8} style={{marginTop:'4px'}}>
                                <Button type='primary' htmlType='submit' loading={PointsListLoading} disabled={PointsListLoading}>
                                    <Icon type="search" />
                                    搜索
                                </Button>
                                <Button className="hz-btn-width-default hz-margin-small-left" style={{marginLeft:'16px'}} onClick={this.onReset}>重置</Button>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                <Row style={{marginBottom: '16px'}} type="flex" justify="end">
                    <Col style={{textAlign: 'right'}}>
                        <Button onClick={this.export} loading={exportReportLoading} disabled={exportReportLoading}>
                            <Icon component={DownloadSvg} style={{fontSize:'15px'}}/>
                            下载记录
                        </Button>
                    </Col>
                </Row>
                <Table
                    rowKey='id'
                    columns={columns}
                    pagination={false}
                    loading={PointsListLoading}
                    dataSource={searchPointsList}
                />
                {searchPointsList.length ?
                    <Pagination
                        className="ant-table-pagination"
                        current={current}
                        total={PointsListTotal}
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


class FormContent extends Component{
    constructor(props){
        super(props)
        this.state = {
            changePointsLoading:false,
        }
    }
    componentDidMount(){}
    componentDidUpdate(prev){
        if(this.props.visible && !prev.visible){
           this.props.form.setFieldsValue({
             points_limit: '',
            })   
        }

    }
    // 输入1~9整数
    formatterInt = (value) => {
        const reg = /[^\d]/g
        if (typeof value === 'string' && (Number(value) >= 1 && Number(value) <= 99999)) {
            return !isNaN(Number(value)) ? value.replace(reg, '') : ''
        } else if ((typeof value === 'number') && (value >= 1 && value <= 99999)) {
            return !isNaN(value) ? String(value).replace(reg, '') : ''
        } else {
            return ''
        }
    }
    render(){
        const {getFieldDecorator} = this.props.form
        return(
            <Fragment>
                <Form layout="horizontal" className="hz-from-search">
                    <Row>
                        <Col>
                            <Form.Item>
                                {getFieldDecorator('points_limit', {
                                    rules: [
                                        {required:true,message:'输入值不在设定范围内'},
                                        // { validator: this.validateDayValue }
                                    ],
                                    initialValue:''
                                })(
                                    <InputNumber style={{width:200}} placeholder="请输入剩余积分" min={1} max={99999} formatter={this.formatterInt} parser={this.formatterInt}/>
                                    
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

            </Fragment>
            
        )
    }
}

const FormComponent = Form.create()(FormContent)
