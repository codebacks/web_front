import React from 'react'
import { connect } from 'dva'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import DocumentTitle from 'react-document-title'
import { Form, Select, Input, Button, Row, Col, DatePicker, Icon, Table, Divider, Modal, Pagination, message,Popconfirm } from 'antd'
import UserSelect from 'components/business/UserSelect'
import router from 'umi/router'
import { Link } from 'dva/router'
import styles from './index.less'
import ActivitiesDetails from './modals/ActivitiesDetails'
import LinkQr from './modals/LinkQr'
import { getQrCodeUrl } from '../../services/lottery_activity'
import { datetime } from '@/utils/display'
import { ACTIVIT_STATUS } from '../../services/lottery_activity'
import moment from 'moment'

const {confirm} = Modal

const DEFAULT_CONDITION = {
    name: '',
    status: '',
    begin_at: '',
    end_at: '',
    creator: ''
}

@Form.create({})
@connect(({lottery_activity }) => ({ lottery_activity}))
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
        qrCodeVisible:false,
        isPublice:false,
    }

    initPage = (isSetHistory = false) => {
        this.props.dispatch({
            type: 'lottery_activity/subData',
            payload: {},
            callback:(data)=>{
                if( !Array.isArray(data) || !data.length){
                    this.setState({
                        isPublice: true 
                    })
                }
            }
        })
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
            type: 'lottery_activity/getLotteryActivitiesList',
            payload: {
                offset: (pager.current - 1) * pager.pageSize,
                limit: pager.pageSize,
                begin_at: condition.begin_at,
                end_at: condition.end_at,
                status: condition.status,
                name: condition.name,
                operator_id: condition.creator
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
                    creator: this.state.creator,
                    status: values.status || '',
                    name: values.name || '',
                },
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
            content: '是否确定下线该活动?',
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                this.getDownlineData(id)
            },
        })
    }
    getDownlineData = (id) =>{
        this.props.dispatch({
            type: 'lottery_activity/activitiesDown',
            payload: { id },
            callback: () => {
                let { condition, pager } = this.state
                this.getPageData(condition, pager)
                message.success(`删除成功`)
            }
        })
    }
    // 删除
    showDeleteConfirm = (id) => {
        Modal.confirm({
            title: "确认删除",
            content: '确认删除该活动?',
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                this.getDeleteData(id)
            },
        })
    }

    getDeleteData = (id) => {
        this.props.dispatch({
            type: 'lottery_activity/deleteLotteryActivities',
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
        let qrCodeUrl = getQrCodeUrl(recorde.id)
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
    showModal = (id) => {
        this.setState({
            currentDetailsID:id,
            visible:true
        })
    }
    hideActivityDetailsModal = () =>{
        this.setState({
            currentDetailsID:null,
            visible:false
        })
    }
    toCreate = () =>{
        if(this.state.isPublice){
            confirm({
                title: '提示',
                content: '使用抽奖功能，请您先授权公众号',
                okText: '去设置',
                iconType: 'info-circle',
                cancelText: '再想想',
                onOk: () => {
                    router.push('/setting/authorization/subscription')
                },
                onCancel: () => {},
            })
        }else{
            router.push('/platform/lottery_activity/operation')
        }
    }


    render() {
        const FormItem = Form.Item
        const { RangePicker } = DatePicker
        const Option = Select.Option
        const { getFieldDecorator } = this.props.form
        const { current, pageSize } = this.state.pager
        const { total, list } = this.props.lottery_activity

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

        const columns = [{
            title: '活动名称',
            dataIndex: 'name',
        }, {
            title: '活动状态',
            dataIndex: 'status',
            render: (text, item) => {
                if (item.status === ACTIVIT_STATUS[0].value) {
                    return <span className={styles.yellowStatus}>未开始</span>
                } else if (item.status === ACTIVIT_STATUS[1].value) {
                    return <span className={styles.blueStatus}>进行中</span>
                } else if (item.status === ACTIVIT_STATUS[2].value) {
                    return <span className={styles.grayStatus}>已结束</span>
                }
            }
        }, {
            title: '创建时间',
            dataIndex: 'created_at',
        },{
            title: '活动时间',
            dataIndex: 'time',
            render: (text, item) => {
                return <div>
                    <span>
                        {datetime(item.begin_at)}</span> ~ <span>{datetime(item.end_at)}
                    </span>
                </div>
            }
        }, {
            title: '创建人',
            dataIndex: 'operator',
        }, {
            title: '操作',
            render: (text, record) => <>
            {record.status > 1 ? <><a href='javascript:;' onClick={() => this.showModal(record.id)}>数据</a><Divider type="vertical" /></>:<><Link to={`/platform/lottery_activity/operation?id=${record.id}`}>编辑</Link><Divider type="vertical" /></>}
            <a href="javascript:;" onClick={() => this.showQrCodeModal(record)}>链接二维码</a>
            {record.status === 2 ? <><Divider type="vertical" /><a href="javascript:;" onClick={() => this.showDownlineConfirm(record.id)}>下线</a></> :null}
            {record.status === 3 || record.status === 1 ?<>
                <Divider type="vertical" />
                <Popconfirm placement="bottomRight" title={"您是否确定删除此活动？"} onConfirm={e => this.getDeleteData(record.id)} okText="删除" cancelText="取消">
                    <a href="javascript:;" onClick={e => e.preventDefault()}>删除</a>
                </Popconfirm>
                </>:null
            }
            </>
        }]
        
        return (
            <DocumentTitle title="活动列表">
                <Page>
                    <Page.ContentHeader
                        title="活动列表"
                        action={
                            <Button type="primary" onClick={this.toCreate} className={styles.open}> <Icon type="plus" /> 创建活动</Button>
                        }
                    />
                    <Page.ContentAdvSearch>
                        <Form layout="horizontal" className="hz-from-search">
                            <Row>
                                <Col span={8}>
                                    <FormItem label="活动名称" {...formItemLayout}>
                                        {getFieldDecorator('name', {})(
                                            <Input placeholder='请输入活动名称' />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="活动状态" {...formItemLayout}>
                                        {getFieldDecorator('status', {})(
                                            <Select
                                                placeholder="全部状态"
                                                getPopupContainer={triggerNode => triggerNode.parentNode}
                                            >
                                                <Option value="">全部</Option>
                                                {
                                                    ACTIVIT_STATUS.map((item) => {
                                                        return <Option key={item.value} value={item.value}>{item.text}</Option>
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="活动时间" {...formItemLayout}>
                                        {getFieldDecorator('rangePicker', {})(
                                            <RangePicker placeholder={['不限', '不限']} />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <FormItem label="创建人" {...formItemLayout}>
                                        {getFieldDecorator('creator', {})(
                                            <UserSelect
                                                placeholder="选择创建人"
                                                userId={this.state.creator}
                                                onChange={(value) => { this.operatorChange(value) }}
                                            />
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
                            />
                            : null
                    }
                    <ActivitiesDetails
                        id={this.state.currentDetailsID}
                        visible={this.state.visible}
                        onClose={this.hideActivityDetailsModal}
                    />

                    <LinkQr
                        name={this.state.qrCodeName}
                        url={this.state.qrCodeUrl}
                        visible={this.state.qrCodeVisible}
                        onClose={this.qrCodeModalClose}
                        isShowCopy={false} /> 
                </Page>
            </DocumentTitle>
        )
    }
}
