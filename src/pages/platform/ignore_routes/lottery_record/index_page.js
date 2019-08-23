import React from 'react'
import { connect } from 'dva'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import DocumentTitle from 'react-document-title'
import { Form, Select, Input, Button, Row, Col, DatePicker, Icon, Table, Divider, Modal, Pagination, message,Popconfirm,Badge } from 'antd'
import UserSelect from 'components/business/UserSelect'
import router from 'umi/router'
import { Link } from 'dva/router'
import styles from './index.less'
import { getQrCodeUrl } from '../../services/lottery_activity'
import { datetime } from '@/utils/display'
import HzInput from '@/components/HzInput'
import { ACTIVIT_STATUS,ACTIVIT_TYPE,LOTTEY_SEND_TYPE } from '../../services/lottery_activity'
import moment from 'moment'
let  _ACTIVIT_TYPE= ACTIVIT_TYPE.slice()
_ACTIVIT_TYPE.splice(3,1)

const FormItem = Form.Item
const { RangePicker } = DatePicker
const Option = Select.Option

const {error} = Modal
const DEFAULT_CONDITION = {
    name: '',
    status: '',
    begin_at: '',
    end_at: '',
    creator: '',
    nick_name: '',
    prize_type:''
}


@Form.create({})
@connect(({ base, lottery_record }) => ({
    base, lottery_record
}))
export default class extends Page.ListPureComponent {
    state = {
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER },
        currentDetailsID: '',
        creator: '',
        loading: true,
        isOpenShopModal: false,
        isOpenShopButton: false,
        shops_type: '',
        qrCodeUrl:'',
        qrCodeName:'',
        qrCodeVisible:false
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        this.getPageData(condition, pager, isSetHistory)

        const { name, status, begin_at, end_at, creator } = condition
        this.setState({
            creator: creator && parseInt(creator)
        })

        this.props.form.setFieldsValue({
            'rangePicker': begin_at && end_at ? [moment(begin_at), moment(end_at)] : [],
            name: name,
            status: status && parseInt(status),
            creator: creator && parseInt(creator)
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
            type: 'lottery_record/getLotteryRocordList',
            payload: {
                offset: (pager.current - 1) * pager.pageSize,
                limit: pager.pageSize,
                begin_at: condition.begin_at,
                end_at: condition.end_at,
                status: condition.status || '',
                nick_name: condition.nick_name || '',
                prize_type: condition.prize_type  || ''
                
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
                callback && callback(data)
            }
        })
    }

    // 搜索
    searchData = () => {
        this.props.form.validateFields((err, values) => {
            let data = {
                begin_at: '',
                end_at: '', 
            }

            if (values.rangePicker) {
                const range = values.rangePicker.map(item => item.format('YYYY-MM-DD'))
                data.begin_at = range[0]
                data.end_at = range[1]
            }

            const condition = {
                ...this.state.condition,
                ...{
                    begin_at: data.begin_at,
                    end_at: data.end_at,
                    status: values.status || '',
                    nick_name: values.nick_name || '',
                    prize_type: values.prize_type  || ''
                }
            }

            const pager = {
                pageSize: this.state.pager.pageSize,
                current: DEFAULT_PAGER.current
            }

            this.getPageData(condition, pager)
        })
    }

    searchSubmitHandle = () => {
        this.searchData()
    }

    resetSearchHandler = () => {
        this.setState({
            creator: ''
        }, () => {
            this.props.form.resetFields()
            this.searchData()
        })

    }

    operatorChange = (value) => {
        this.setState({
            creator: value,
            offset: 1
        })
    }

    // 下线
    showDownlineConfirm = (id) => {
        Modal.confirm({
            title: "下线活动？",
            content: '活动下线后不可再次编辑上线，是否确定下线该活动?',
            okText: '确定',
            cancelText: '取消',
            iconType: 'question-circle',
            onOk: () => {
                this.getDownlineData(id)
            },
        })
    }

    // 删除
    showDeleteConfirm = (id) => {
        Modal.confirm({
            title: "确认删除",
            content: '确认删除该活动?',
            okText: '确定',
            cancelText: '取消',
            iconType: 'question-circle',
            onOk: () => {
                this.getDeleteData(id)
            },
        })
    }

    getDeleteData = (id) => {
        this.props.dispatch({
            type: 'platform_first_binding/remove',
            payload: {
                id: id,
            },
            callback: () => {
                let { condition, pager } = this.state
                this.getPageData(condition, pager)
                message.success(`删除成功`)
            }
        })
    }

    
    showQrCodeModal = (recorde) =>{
        let qrCodeUrl = getQrCodeUrl(recorde.id|1)
        this.setState({
            qrCodeUrl,
            qrCodeName: recorde.name,
            qrCodeVisible: true
        })
    }
    qrCodeModalClose = ()=>{
        this.setState({
            qrCodeUrl: '',
            qrCodeName: '',
            qrCodeVisible: false
        })
    }
    showErr = (row) =>{
        Modal.error({
            title: '领取失败',
            content: `失败原因：${row.packet_remark}`,
        })
    }

    render() {
        
        const { getFieldDecorator } = this.props.form
        const { current, pageSize } = this.state.pager
        const { total, list } = this.props.lottery_record

        const { loading } = this.state
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '69px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const getBadge = (row)=> {
            let state = {
                1:<Badge status="default" text={`${row.prize_type === 3 ?'未领取':'未发放'}`} />,
                2:<Badge status="success" text='领取成功' />,
                4:<a onClick={()=>this.showErr(row)} className={styles.error}><Badge status="error" text='领取失败' /></a>,
                5:<Badge status="default" text='发放中' />,
                6:<Badge status="success" text='已发放' />,
            }
            return state[row.status]
        }

        const columns = [{
            title: '活动名称',
            dataIndex: 'activity_name',
        }, {
            title: '抽奖时间',
            dataIndex: 'created_at',
        }, {
            title: '活动时间',
            dataIndex: 'time',
            render: (text, item) => {
                return <div>{datetime(item.begin_at)} ~ {datetime(item.end_at)} </div>
            }
        },{
            title: '发放状态',
            dataIndex: 'status',
            render: (text, row) => getBadge(row)
        }, {
            title: '奖品',
            dataIndex: 'prize_name',
        }, {
            title: '抽奖人',
            dataIndex: 'nick_name',
        },{
            title: '备注',
            dataIndex: 'remark',
            width:260,
            render:(_,row)=> <Remark 
                dispatch={this.props.dispatch} 
                getData={this.searchSubmitHandle} 
                row={row} />
        }, {
            title: '操作',
            render: (text, record) =>record.prize_type === 2 && record.status === 5 ?  <Link to={`/platform/lottery_record/send?id=${record.id}`} > 发放 </Link> : '--'
        }]

        return (
            <DocumentTitle title="活动记录">
                <Page>
                    <Page.ContentHeader
                        title="活动记录"
                    />
                    <Page.ContentAdvSearch>
                        <Form layout="horizontal" className="hz-from-search">
                            
                            <Row>
                                <Col span={8}>
                                    <FormItem label="活动时间" {...formItemLayout}>
                                        {getFieldDecorator('rangePicker', {})(
                                            <RangePicker placeholder={['不限', '不限']} />
                                        )}
                                    </FormItem>
                                </Col>
                                
                                <Col span={8}>
                                    <FormItem label="发送状态" {...formItemLayout}>
                                        {getFieldDecorator('status', {})(
                                            <Select
                                                placeholder="全部"
                                                getPopupContainer={triggerNode => triggerNode.parentNode}
                                            >
                                                <Option value="">全部</Option>
                                                {
                                                    LOTTEY_SEND_TYPE.map((item) => {
                                                        return <Option key={item.value} value={item.value}>{item.label}</Option>
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="抽奖人" {...formItemLayout}>
                                        {getFieldDecorator('nick_name', {})(
                                            <Input placeholder='请输入抽奖人' />
                                        )}
                                    </FormItem>
                                </Col>
                                
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <FormItem label="奖品类型" {...formItemLayout}>
                                        {getFieldDecorator('prize_type', {})(
                                            <Select
                                                placeholder="全部"
                                                getPopupContainer={triggerNode => triggerNode.parentNode}
                                            >
                                                <Option value="">全部</Option>
                                                {
                                                    _ACTIVIT_TYPE.map((item) => {
                                                        return <Option key={item.value} value={item.value}>{item.label}</Option>
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <Col span={3} style={{ width: '69px' }}></Col>
                                    <Col span={16}>
                                        <Button className="hz-btn-width-default" type="primary" htmlType="submit" onClick={this.searchSubmitHandle}>
                                            <Icon type="search" />
                                            搜索
                                        </Button>
                                        <Button className="hz-btn-width-default hz-margin-base-left" onClick={this.resetSearchHandler}>
                                            重置
                                        </Button>
                                    </Col>
                                </Col>
                            </Row>
                        </Form>
                    </Page.ContentAdvSearch>
                    <Table
                        pagination={false}
                        columns={columns}
                        dataSource={list}
                        loading={loading}
                        rowKey="id"
                    />
                    {
                        list && list.length > 0 && !loading ?
                            <Pagination
                                className={styles.wxPagination + ' ant-table-pagination'}
                                total={total}
                                current={current}
                                showQuickJumper={true}
                                showTotal={total => `共 ${total} 条`}
                                pageSize={pageSize}
                                pageSizeOptions={['10', '20', '50', '100']}
                                showSizeChanger={true}
                                onShowSizeChange={this.handleListPageChangeSize}
                                onChange={this.handleListPageChange}
                            /> : null
                    }
                </Page>
            </DocumentTitle>
        )
    }
}


class Remark extends React.Component {
    state = {
        value: '',
        set: false
    }
    static getDerivedStateFromProps(nextProps, prevState){
        if(!prevState.set){
            return {
                value: nextProps.row.remark || '',
                set: true
            }
        }
        return null
    }

    onChange = (e) => {
        console.log(e.target.value,'e.target.value')
        this.setState({ value:e.target.value })
    }
    confirm = () =>{
        const {row} = this.props
        this.props.dispatch({
            type:'lottery_record/putLotteryRocord',
            payload:{
                id: row.id,
                remark: this.state.value
            },
            callback: () => {
                this.props.getData && this.props.getData()
            }
        })
    }
    onCancel = () =>{
        this.setState({
            set:false
        })
    }
    popconfirmClick = () =>{
        this.setState({
            set:false
        })
    }
    render(){
        const {row} = this.props
        return <> {row.remark} <Popconfirm
            icon={null}
            placement="bottomRight"
            arrowPointAtCenter
            title={
                <div style={{width:288,marginLeft: -20}}>
                    <FormItem label="备注" colon={false} >
                        <HzInput
                            maxLength={12}
                            onChange={this.onChange}
                            value={this.state.value}
                        />
                    </FormItem>
                </div>
            }
            onClick={this.popconfirmClick}
            onConfirm={this.confirm}
            okText="确定"
            onCancel={this.onCancel}
            cancelText="取消" >
            <Icon type="edit" style={{ color: '#4391FF', fontSize: 14 }} />
        </Popconfirm></>
    }
}


