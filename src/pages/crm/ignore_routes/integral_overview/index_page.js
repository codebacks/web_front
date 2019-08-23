/**
 **@time: 2018/12/17
 **@Description:积分总览
 **@author: yecuilin
 */
import { Fragment } from 'react'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '@/components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import { Form, Row, Col,DatePicker, Select, Table, Button, Icon ,Pagination, Radio ,Tabs } from 'antd'
import { connect } from 'dva'
import numeral from 'numeral'
import styles from './index.less'
import moment from 'moment'
import { AWARD_TYPE, getAwardTypeByVal } from 'crm/services/integral'
import {jine} from '../../../../utils/display'
// import Obtain from './components/Obtain'

const { RangePicker } = DatePicker
const Option = Select.Option
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const TabPane = Tabs.TabPane;
const panesList = [
    {
        tab:'获取数据',
        key:'1'
    },{
        tab:'消耗数据',
        key:'2'
    }
]
const DEFAULT_CONDITION = {
    source_type:'',
    good_type: '',
    begin_at:'',
    end_at:'',
    type: '1'
}

@documentTitleDecorator()
@Form.create()
@connect(({ base,crm_intergral}) => ({
    base,
    crm_intergral
}))
export default class Index extends Page.ListPureComponent {
    state = {
        loading: true,
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER },
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        
        this.getSummary()
        this.getPageData(condition, pager, isSetHistory)
        const { source_type, good_type, begin_at, end_at,type} = condition
        if(type === '1'){
            this.props.form.setFieldsValue({
                'luckyType': source_type || '',
                'rangePicker': begin_at && end_at ? [moment(begin_at),moment(end_at)] : []
            })
        }else{
            this.props.form.setFieldsValue({
                'good_type': good_type || '',
                'rangePicker': begin_at && end_at ? [moment(begin_at),moment(end_at)] : []
            })
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
            type: 'crm_intergral/searchSummaryList',
            payload:{
                offset: pager.current - 1,
                limit: pager.pageSize,
                begin_at:condition.begin_at,
                end_at: condition.end_at,
                source_type:condition.source_type,
                good_type:condition.good_type,
                type:condition.type,
            }

        })
    }
    getSummary = () =>{
        this.props.dispatch({
            type:'crm_intergral/getSummary'
        })
    }
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
            let begin_at = '', end_at = ''
            if (value.rangePicker && value.rangePicker.length !== 0) {
                begin_at = value.rangePicker[0].format('YYYY-MM-DD')
                end_at = value.rangePicker[1].format('YYYY-MM-DD')
            }

            const condition = {
                ...this.state.condition,
                ...{
                    source_type: value.luckyType || '',
                    good_type: value.good_type || '',
                    begin_at: begin_at,
                    end_at: end_at
                }
            }
            
            const pager = {
                pageSize : this.state.pager.pageSize,
                current : DEFAULT_PAGER.current
            }
            
            this.getPageData(condition, pager)
        })
    }
    handleTypeChange = (e)=>{
        const val = e
        let begin_at = '', end_at = ''
        const condition = {
            ...this.state.condition,
            ...{
                type: val,
                source_type: '',
                good_type: '',
                begin_at: begin_at,
                end_at: end_at
            }
        }
        this.props.form.setFieldsValue({
            'rangePicker':[]
        })
        const pager = {
            pageSize : this.state.pager.pageSize,
            current : DEFAULT_PAGER.current
        }
        this.setState({
            condition: condition
        },()=>{
            this.getPageData(condition, pager)
        })
    }


    /**页面事件 */
    render() {
        const { getFieldDecorator } = this.props.form
        const {dataSummary,searchSummaryList,SummaryTotal,SummaryListLoading} = this.props.crm_intergral
        const { current, pageSize } = this.state.pager
        const { type } = this.state.condition
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
        const columns = type&&parseInt(type, 10) ===1 ? [
            {
                title: '获取时间',
                dataIndex: 'begin_at',
                render:(text,record,index) =>{
                    return text ? moment(text).format("YYYY-MM-DD") : ''
                }
            },
            {
                title: '获取方式',
                dataIndex: 'source_type',
                render:(text,record,index) =>{
                    let type =''
                    switch(text){
                        case 1:
                            type = '绑定购物账号'
                            break
                        case 2:
                            type = '购物满送'
                            break
                        case 3:
                            type = '关注微信公众号'
                            break
                        case 4:
                            type = '签到送积分'
                            break
                        case 7:
                            type = '手动增加'
                            break
                        case 8:
                            type = '抽奖增加'
                            break
                        default:
                            type = ''
                    }
                    return type
                }              
            },
            {
                title: '获取次数',
                dataIndex: 'get_count',
                align:'center',
            },
            {
                title: '参与用户数',
                align:'center',
                dataIndex: 'join_count'
            },
            {
                title: '获取积分',
                dataIndex: 'recieved_count',
                align:'center',
                render:(text,record,index) =>{
                    return text&&jine(text, '0,00', 'Fen')
                }
            },
        ]:
        [
            {
                title: '消耗时间',
                dataIndex: 'begin_at',
                render:(text,record,index) =>{
                    return text ? moment(text).format("YYYY-MM-DD") : ''
                }
            },
            {
                title: '奖品名称',
                dataIndex: 'good_name',
                render:(text,record,index) =>{
                    return <span>{record.good_type === 127 ? '-' : text}</span>
                }
            },
            {
                title: '消耗方式',
                dataIndex: 'good_type',
                render:(text,record,index) =>{
                    let type =''
                    switch(text){
                        case 1:
                            type = '兑换红包'
                            break
                        case 2:
                            type = '兑换实物'
                            break
                        case 127:
                            type = '手动减少'
                            break
                        case 8:
                            type = '抽奖消耗'
                            break
                        default:
                            type = ''
                    }
                    return type
                    // return getAwardTypeByVal(text) || ''
                }              
            },
            {
                title: '订单量',
                align:'center',
                dataIndex: 'order_count',
                render:(text,record,index) =>{
                    return <span>{record.good_type === 127 ? '-' : text}</span>
                }
            },
            {
                title: '参与用户数',
                align:'center',
                dataIndex: 'join_count'
            },
            {
                title: '消耗积分',
                align:'center',
                dataIndex: 'consumed_count',
                render:(text,record,index) =>{
                    return text&&jine(text, '0,00', 'Fen')
                }
            },
        ]
        return (
            <Page>
                {/*头部面包屑*/}
                <Page.ContentHeader
                    title={this.props.documentTitle}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E5%AE%A2%E6%88%B7%E7%AE%A1%E7%90%86/%E7%A7%AF%E5%88%86%E8%BF%90%E8%90%A5.md"
                />
                {/*搜索条件框*/}
                
                <Row className={styles.overview_Card}>
                    <Col span={6}>
                        <dl>
                            <dt>总获取客户数</dt>
                            <dd>{numeral(dataSummary.join_count).format('0,0')}</dd>
                        </dl>
                    </Col>
                    <Col span={6}>
                        <dl>
                            <dt>总获取积分</dt>
                            <dd>{dataSummary.recieved_count && jine(dataSummary.recieved_count, '0,00', 'Fen') || 0}</dd>
                        </dl>
                    </Col>
                    <Col span={6}>
                        <dl>
                            <dt>总消耗积分</dt>
                            <dd>{dataSummary.consumed_count && jine(dataSummary.consumed_count, '0,00', 'Fen') || 0}</dd>
                        </dl>
                    </Col>
                    <Col span={6}>
                        <dl className={styles.lastchild_dl}>
                            <dt>总剩余积分</dt>
                            <dd>{dataSummary.balance_count && jine(dataSummary.balance_count, '0,00', 'Fen') || 0}</dd>
                        </dl>
                    </Col>
                </Row>
                {/* 积分第一期不做显示 */}
                <Tabs defaultActiveKey="1" onChange={this.handleTypeChange} activeKey={type}>
                    {/* <TabPane tab="获取数据" key="1"></TabPane>
                    <TabPane tab="消耗数据" key="2"></TabPane>                    */}
                    {
                        panesList.map(item =>
                            <TabPane tab={item.tab} key={item.key}>
                                <Page.ContentAdvSearch>
                                    <Form onSubmit={this.onSubmit}>
                                        <Row  type="flex" justify="start">
                                            <Fragment>
                                                <Col span={8}>
                                                    <Form.Item label={type&&parseInt(type, 10) ===1 ? '获取时间': '消耗时间'} {...formItemLayout} style={{marginBottom:'0'}}>
                                                        {getFieldDecorator('rangePicker',{})(
                                                            <RangePicker/>
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col span={8}>
                                                        {
                                                            type&&parseInt(type, 10) ===1 ? <Form.Item label='获取方式' {...formItemLayout} style={{marginBottom:'0'}}>
                                                                {getFieldDecorator('luckyType',{})(
                                                                    <Select placeholder="全部方式" >
                                                                        <Option value=''>全部方式</Option>
                                                                        <Option value='1'>绑定购物账号</Option>
                                                                        <Option value='3'>关注微信公众号</Option>
                                                                        <Option value='2'>购物满送</Option>
                                                                        <Option value='7'>手动增加</Option>
                                                                        <Option value='4'>签到送积分</Option>
                                                                        <Option value='8'>抽奖增加</Option>
                                                                        
                                                                    </Select>
                                                                )}
                                                            
                                                            </Form.Item> : <Form.Item label='消耗方式' {...formItemLayout} style={{marginBottom:'0'}}>
                                                                {getFieldDecorator('good_type',{})(
                                                                    <Select placeholder="全部类型" >
                                                                        <Option value=''>全部类型</Option>
                                                                        <Option value='127'>手动减少</Option>
                                                                        <Option value='1'>兑换红包</Option>
                                                                        <Option value='2'>兑换实物</Option>
                                                                        <Option value='8'>抽奖消耗</Option>
                                                                        {/* {
                                                                            AWARD_TYPE.map(item=>{
                                                                                return <Option value={item.value} key={item.value}>{item.type}</Option>
                                                                            })
                                                                        } */}
                                                                    </Select>
                                                                )}
                                                                
                                                            </Form.Item>
                                                        }
                                                    
                                                </Col>
                                            </Fragment>

                                            <Col style={{marginTop:'4px'}}>
                                                <Button type='primary'  htmlType='submit' loading={SummaryListLoading} disabled={SummaryListLoading}>
                                                    <Icon type="search" />
                                                    搜索
                                                </Button>
                                                <Button className="hz-btn-width-default hz-margin-small-left" style={{marginLeft:'16px'}} onClick={this.onReset}>
                                                        重置
                                                </Button>
                                            </Col>  
                                            
                                        </Row>
                                    </Form>
                                </Page.ContentAdvSearch>
                                                                    
                                <Row style={{marginBottom: '16px'}} type="flex" justify="start" className={styles.totalCountWrap}>
                                    <Col> 
                                        <span className={styles.totalCount}>{type&&parseInt(type, 10) ===1 ?'累计获取积分：':'累计消耗积分：' } </span> 
                                        <span style={{fontWeight:"600"}}>{searchSummaryList.totol_point && jine(searchSummaryList.totol_point, '0,00', 'Fen') || 0}</span>
                                        <span className={styles.totalCount} style={{marginLeft:'2px'}}>分</span>
                                    </Col>
                                </Row>
                                <Table
                                    columns={columns}
                                    pagination={false}
                                    dataSource={searchSummaryList.items}
                                    rowKey='id'
                                    loading={SummaryListLoading}
                                />
                            </TabPane>
                            
                        )
                    }
                </Tabs>
                { SummaryTotal > 0 ?
                    <Pagination
                        className="ant-table-pagination"
                        current={current}
                        total={SummaryTotal}
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
