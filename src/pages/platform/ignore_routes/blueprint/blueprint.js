/**
 **@time: 2018/9/21
 **@Description:晒图红包
 **@author: wangchunting
 */

import React from 'react'
import { connect } from 'dva'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import router from 'umi/router'
import { Link } from 'dva/router'
import { Form, Select, Input, Button, Row, Col, DatePicker, Icon, Table, Divider, Modal, message, Pagination, Badge } from 'antd'
import _ from 'lodash'
import styles from "./index.less"
import { datetime } from '../../../../utils/display'
import LinkQr from './modals/linkQr'
import Statistics from './modals/Statistics'
import ActivitiesDetails from '../blueprint_audit/modals/ActivitiesDetails'
import UserSelect from 'components/business/UserSelect'
import { ACTIVIT_STATUS, getQrCodeUrl, getActivitieCode } from '../../services/blueprint'
import moment from 'moment'
import Guide from '@/components/Guide'

const DEFAULT_CONDITION = {
    begin_at: '',
    end_at: '',
    status: '',
    name: '',
    operator_id: ''
}

@Form.create({})
@connect(({ base, platform_blueprint }) => ({
    base, platform_blueprint
}))

export default class extends Page.ListPureComponent {
    state = {
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER },
        currentDetailsID: "",
        currentStatisticsID: '',
        statisticsLoading: false,
        downloadVisible: false,
        downloadItemID: null,
        downloadItemName: '',
        operator_id: '',
        // guideVisible: false,
        // isGuideModal: false,
        // isUpdataGuide: false
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)

        this.getPageData(condition, pager, isSetHistory)
        // this.getGuidances()
        this.isOpen()

        const { begin_at, end_at, status, name, operator_id } = condition

        this.setState({
            operator_id: operator_id && parseInt(operator_id)
        })

        this.props.form.setFieldsValue({
            'rangePicker': begin_at && end_at ? [moment(begin_at), moment(end_at)] : [],
            status: status && parseInt(status, 10),
            name: name,
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
            type: 'platform_blueprint/listData',
            payload: {
                offset: (pager.current - 1) * pager.pageSize,
                limit: pager.pageSize,
                begin_at: condition.begin_at,
                end_at: condition.end_at,
                status: condition.status,
                name: condition.name,
                operator_id: condition.operator_id
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })

                callback && callback(data)
            }
        })
    }

    //搜索-创建人
    operatorChange = (value) => {
        this.setState({
            operator_id: value,
            offset: 1
        })
    }

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
                    operator_id: this.state.operator_id,
                    status: values.status,
                    name: values.name,
                },
            }

            const pager = {
                pageSize: this.state.pager.pageSize,
                current: DEFAULT_PAGER.current
            }

            this.getPageData(condition, pager)
        })
    }

    //搜索
    searchHandleSubmit = () => {
        this.searchData()
    }

    // 搜索-重置
    resetSearchHandler = () => {
        this.setState({
            operator_id: ''
        }, () => {
            this.props.form.resetFields()
            this.searchData()
        })

    }

    // 统计
    showCountModal = (item) => {
        this.setState({
            currentStatisticsID: item.id,
            statisticsLoading: true
        })
    }

    hideStatisticsModal = () => {
        this.setState({
            currentStatisticsID: ''
        })
    }

    // 下线
    getDownlineData = (id) => {
        this.props.dispatch({
            type: 'platform_blueprint/downline',
            payload: {
                id: id,
            },
            callback: () => {
                let { condition, pager } = this.state
                this.getPageData(condition, pager)

                message.success(`下线成功`)
            }
        })
    }

    // 删除活动
    getDeleteData = (id) => {
        this.props.dispatch({
            type: 'platform_blueprint/remove',
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

    showDownlineConfirm = (item) => {
        Modal.confirm({
            title: "下线活动",
            content: '晒图活动下线后不可再次编辑上线，确定下线该活动？',
            okText: '确定',
            cancelText: '取消',
            iconType: 'question-circle',
            onOk: () => {
                this.getDownlineData(item.id)
            },
            onCancel: () => {
            },
        })
    }

    // 删除活动
    showDeleteConfirm = (item) => {
        Modal.confirm({
            title: "删除晒图活动",
            content: '确定删除该晒图活动？',
            okText: '确定',
            cancelText: '取消',
            iconType: 'question-circle',
            onOk: () => {
                this.getDeleteData(item.id)
            },
            onCancel: () => {
            },
        })
    }

    // 编辑活动
    showUpdateModal = (item) => {
        router.push(`blueprint/edit/${item.id}`)
    }

    //modal----活动名称（活动详情）
    showDetailsModal = (id) => {
        this.setState({
            currentDetailsID: id
        })
    }

    // modal-链接二维码
    showDownloadConfirm = (item) => {
        this.setState({
            downloadItemID: item.id,
            downloadVisible: true,
            downloadItemName: item.name
        })
    }
    handleDownloadCancel = (e) => {
        this.setState({
            downloadItemID: null,
            downloadVisible: false,
            downloadItemName: ''
        })
    }

    generateDownloadUrl = (id) => {
        return getQrCodeUrl(`/public/packets/activities/${id}/fans`)
    }

    // Btn-创建活动
    createActivityHandler = () => {
        router.push(`blueprint/create`)
    }

    hideExamineDetailsModal = () => {
        this.setState({
            currentDetailsID: ''
        })
    }

    // Btn-未开通(创建活动)
    isOpen() {
        this.props.dispatch({
            type: 'platform_blueprint/isOpen',
            payload: {
                has_wx_pay: 2
            }
        })
    }

    render() {
        const { blueprintData, loading, rows_found, isOpen } = this.props.platform_blueprint
        const { current, pageSize } = this.state.pager
        const FormItem = Form.Item
        const Option = Select.Option
        const { getFieldDecorator } = this.props.form
        const { RangePicker } = DatePicker
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

        // table(列表)
        const columns = [{
            title: '最后编辑时间',
            dataIndex: 'updated_at',
        }, {
            title: '活动名称',
            dataIndex: 'name',
            render: (text, item) => {
                return < div >
                    <a href="javascript:;" onClick={() => this.showDetailsModal(item.id)}>{text}</a>
                </div >
            }
        }, {
            title: '活动状态',
            dataIndex: 'status',
            render: (text, item) => {
                switch (text) {
                    case getActivitieCode('rough').value:
                        return <Badge status="warning" text='未开始' />
                    case getActivitieCode('delay').value:
                        return <Badge status="processing" text='进行中' />
                    case getActivitieCode('finish').value:
                        return <Badge status="default" text='已结束' />
                    default:
                        return ''
                }
            }
        }, {
            title: '活动时间',
            dataIndex: 'time',
            render: (text, item) => {
                return <div>
                    <span>{datetime(item.begin_at)}</span>~<span>{datetime(item.end_at)}</span>
                </div>
            }
        }, {
            title: '创建人',
            dataIndex: 'operator',
        }, {
            title: '操作',
            key: 'action',
            render: (text, record) => {
                switch (record.status) {
                    case 3:
                        return <div>
                            <a href="javascript:;" onClick={() => this.showDownlineConfirm(record)}>下线 </a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={() => this.showUpdateModal(record)}>编辑</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={() => this.showDownloadConfirm(record)}>链接二维码</a>
                        </div>
                    case 1:
                        return <div>
                            <a href="javascript:;" onClick={() => this.showDownlineConfirm(record)}>下线 </a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={() => this.showCountModal(record)}>统计</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={() => this.showDownloadConfirm(record)}>链接二维码</a>
                        </div>
                    case 2:
                        return <div>
                            <a href="javascript:;" onClick={() => this.showDeleteConfirm(record)}>删除 </a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={() => this.showCountModal(record)}>统计</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={() => this.showDownloadConfirm(record)}>链接二维码</a>
                        </div>
                    default:
                        return ''
                }
            }
        }]

        return (
            <div>
                <div className='hz-margin-base-bottom'>
                    {isOpen.length ? <div>
                        <Button type="primary" onClick={this.createActivityHandler}>
                            <Icon type="plus" /> 创建活动 </Button>
                    </div>
                        :
                        <div>
                            <Button type="primary" className={styles.open}><Link to='/setting/authorization/subscription?type=openBlueprintAuthorization'>创建活动</Link></Button>
                            <span className="hz-page-content-action-description">请注意支付配置信息完善，并保障公众号商户平台余额充足。</span>
                        </div>
                    }
                </div>
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
                                <FormItem label="活动状态" {...formItemLayout}>
                                    {getFieldDecorator('status', {})(
                                        <Select
                                            placeholder="全部状态"
                                        >
                                            <Option value="">全部状态</Option>
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
                                <FormItem label="创建人" {...formItemLayout}>
                                    {getFieldDecorator('operator_id', {})(
                                        <UserSelect
                                            placeholder="选择创建人"
                                            userId={this.state.operator_id}
                                            onChange={(value) => { this.operatorChange(value) }}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <FormItem label="活动名称" {...formItemLayout}>
                                    {getFieldDecorator('name', {})(
                                        <Input placeholder='请输入活动名称' />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <Col span={3} style={{ width: '69px' }}></Col>
                                <Col span={16}>
                                    <Button className="hz-btn-width-default" type="primary" htmlType="submit" onClick={this.searchHandleSubmit}>
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
                    dataSource={blueprintData}
                    loading={loading}
                    rowKey="id" />
                {
                    blueprintData && blueprintData.length > 0 && (
                        <Pagination
                            className={styles.wxPagination + ' ant-table-pagination'}
                            total={rows_found}
                            current={current}
                            showQuickJumper={true}
                            showTotal={total => `共 ${rows_found} 条`}
                            pageSize={pageSize}
                            pageSizeOptions={['10', '20', '50', '100']}
                            showSizeChanger={true}
                            onShowSizeChange={this.handleListPageChangeSize}
                            onChange={this.handleListPageChange}
                        />
                    )
                }

                {/* modal--活动详情 */}
                <ActivitiesDetails
                    key={'blueprint' + this.state.currentDetailsID}
                    id={this.state.currentDetailsID}
                    onClose={this.hideExamineDetailsModal}
                ></ActivitiesDetails>

                {/* modal--统计 */}
                <Statistics
                    key={'statisics' + this.state.currentStatisticsID}
                    id={this.state.currentStatisticsID}
                    onClose={this.hideStatisticsModal}
                ></Statistics>

                {/* modal----链接二维码 */}
                <LinkQr key={'link' + this.state.downloadItemID}
                    name={this.state.downloadItemName}
                    url={this.generateDownloadUrl(this.state.downloadItemID)}
                    visible={this.state.downloadVisible}
                    onClose={this.handleDownloadCancel}
                    isShowCopy={true} />

                {/* 引导弹窗 guide*/}
                <Guide
                    type={'blueprint'}
                    guideTitle={'五个步骤教你如何玩转晒图红包!'}
                    guideFlowImg={require(`platform/assets/images/guide-buleprint.jpg`)}
                />
            </div >
        )
    }
}
