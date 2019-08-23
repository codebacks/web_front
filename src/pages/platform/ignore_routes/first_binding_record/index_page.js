/**
 **@Description:首绑有礼-参与记录
 **@author: wangchunting
 */

import React from 'react'
import { connect } from 'dva'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import DocumentTitle from 'react-document-title'
import { Form, Select, Input, Button, Row, Col, DatePicker, Icon, Table, Modal, Pagination } from 'antd'
import styles from './index.less'
import firstStyles from '../first_binding/index.less'
import ActivitiesDetails from '../first_binding/modals/ActivitiesDetails'
import { RECEIVE_STATUS, getPlatformType, PLATFORM_ID, FORCE } from '../../services/first_binding_record'
import { getAwardType } from '../../services/first_binding'
import { jine } from '../../../../utils/display'
import _ from 'lodash'
import moment from 'moment'
const DEFAULT_CONDITION = {
    nick_name: '',
    platform_id: '',
    shop_account: '',
    bind_at_begin: '',
    bind_at_end: '',
    activity_id: '',
    receive_status: '',
}

@Form.create({})
@connect(({ base, first_binding_record }) => ({
    base, first_binding_record
}))

export default class extends Page.ListPureComponent {
    state = {
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER },
        currentDetailsID: '',
        nameInputValue: '',
        nameInputData: [],
        hasFeedback: false

    }
    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)

        this.listData()
        this.getPageData(condition, pager, isSetHistory)

        const { nick_name, platform_id, shop_account, bind_at_begin, bind_at_end, activity_id, receive_status } = condition
        this.props.form.setFieldsValue({
            'rangePicker': bind_at_begin && bind_at_end ? [moment(bind_at_begin), moment(bind_at_end)] : [],
            nick_name: nick_name,
            platform_id: platform_id && parseInt(platform_id),
            shop_account: shop_account,
            activity_id: activity_id && parseInt(activity_id),
            receive_status: receive_status && parseInt(receive_status)
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
            type: 'first_binding_record/firstListData',
            payload: {
                offset: (pager.current - 1) * pager.pageSize,
                limit: pager.pageSize,
                nick_name: condition.nick_name,
                platform_id: condition.platform_id,
                shop_account: condition.shop_account,
                bind_at_begin: condition.bind_at_begin,
                bind_at_end: condition.bind_at_end,
                activity_id: condition.activity_id,
                receive_status: condition.receive_status
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
                callback && callback(data)
            }
        })
    }

    // 活动列表
    listData = _.debounce((value) => {
        this.props.dispatch({
            type: 'first_binding_record/listData',
            payload: {
                name: value,
                force: FORCE.force,
            },
            callback: (data) => {
                this.setState({
                    nameInputData: data,
                    hasFeedback: false
                })
            }
        })
    }, 500)

    handleNameChange = (value) => {
        this.setState({
            nameInputValue: value
        }, () => {
            this.props.form.setFieldsValue({
                name: this.state.nameInputValue
            })
        })
    }

    handleNameSearch = (value) => {
        this.setState({
            hasFeedback: true
        }, () => {
            this.listData(_.trim(value))
        })
    }

    // 搜索
    searchData = () => {
        this.props.form.validateFields((err, values) => {
            let data = {
                bind_at_begin: '',
                bind_at_end: '',
            }

            if (values.rangePicker) {
                const range = values.rangePicker.map(item => item.format('YYYY-MM-DD'))
                data.bind_at_begin = range[0]
                data.bind_at_end = range[1]
            }

            const condition = {
                ...this.state.condition,
                ...{
                    bind_at_begin: data.bind_at_begin,
                    bind_at_end: data.bind_at_end,
                    nick_name: values.nick_name || '',
                    platform_id: values.platform_id || '',
                    shop_account: values.shop_account || '',
                    activity_id: values.activity_id || '',
                    receive_status: values.receive_status || '',
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
            nameInputData: []
        }, () => {
            this.props.form.resetFields()
            this.searchData()
        })
    }

    // 付款失败
    showFailDetailModal = (receive_fail_message) => {
        Modal.info({
            title: '失败说明',
            content: (
                <div>{receive_fail_message}</div>
            ),
        })
    }

    // modal--活动详情
    showActivityDetailsModal = (id) => {
        this.setState({
            currentDetailsID: id
        })
    }

    hideActivityDetailsModal = () => {
        this.setState({
            currentDetailsID: ''
        })
    }

    render() {
        const FormItem = Form.Item
        const { RangePicker } = DatePicker
        const Option = Select.Option
        const { getFieldDecorator } = this.props.form
        const { current, pageSize } = this.state.pager
        const { rows_found, firstListData } = this.props.first_binding_record
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
            title: '微信昵称',
            dataIndex: 'nick_name',
        }, {
            title: '微信号',
            dataIndex: 'wechat_account',
        }, {
            title: '平台类型',
            dataIndex: 'platform_id',
            render: (text, item) => {
                return <div>{getPlatformType(item.platform_id)}</div>
            }
        }, {
            title: '购物账号',
            dataIndex: 'shop_account',
        }, {
            title: '绑定时间',
            dataIndex: 'bind_at',
        }, {
            title: '活动名称',
            dataIndex: 'name',
            render: (text, item) => {
                return < div >
                    {item.activity_first_binding ? <a href="javascript:;" onClick={() => this.showActivityDetailsModal(item.activity_first_binding.id)}>{item.activity_first_binding.name}</a> : '--'}
                </div >
            }
        }, {
            title: '领取状态',
            dataIndex: 'receive_status',
            render: (text, item) => {
                if (item.receive_status === RECEIVE_STATUS[0].value) {
                    return <span className={firstStyles.yellowStatus}>未领取</span>
                } else if (item.receive_status === RECEIVE_STATUS[1].value) {
                    return <span className={firstStyles.redStatus}><a href="javascript:;" onClick={() => this.showFailDetailModal(item.receive_fail_message)}>领取失败</a></span>
                } else if (item.receive_status === RECEIVE_STATUS[2].value) {
                    return <span className={firstStyles.grayStatus}>已领取</span>
                } else if (item.receive_status === RECEIVE_STATUS[3].value) {
                    return <span className={firstStyles.grayStatus}>已过期</span>
                }
            }
        }, {
            title: '奖品类型',
            dataIndex: 'award_type',
            render: (text, item) => {
                return <div>{item.activity_first_binding ? getAwardType(item.activity_first_binding.award_type) : '--'}</div>
            }
        }, {
            title: '金额(元)',
            dataIndex: 'price',
            align: 'right',
            render: (text, item) => {
                return <div>{jine(text, '0,0.00', 'Fen')}</div>
            }
        }]

        return (
            <DocumentTitle title="绑定记录" >
                <Page>
                    <Page.ContentHeader
                        title="绑定记录"
                        helpUrl='http://newhelp.51zan.cn/manual/content/%E8%90%A5%E9%94%80%E5%B9%B3%E5%8F%B0/%E9%A6%96%E7%BB%91%E6%9C%89%E7%A4%BC.md'
                    />
                    <Page.ContentAdvSearch>
                        <Form layout="horizontal" className="hz-from-search">
                            <Row>
                                <Col span={8}>
                                    <FormItem label="微信昵称" {...formItemLayout}>
                                        {getFieldDecorator('nick_name', {})(
                                            <Input placeholder='请输入微信昵称' />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="平台类型" {...formItemLayout}>
                                        {getFieldDecorator('platform_id', {})(
                                            <Select
                                                placeholder="全部"
                                                getPopupContainer={triggerNode => triggerNode.parentNode}
                                            >
                                                <Option value="">全部类型</Option>
                                                {
                                                    PLATFORM_ID.map((item) => {
                                                        return <Option key={item.value} value={item.value}>{item.text}</Option>
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="购物账号" {...formItemLayout}>
                                        {getFieldDecorator('shop_account', {})(
                                            <Input placeholder='请输入购物账号' />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <FormItem label="绑定时间" {...formItemLayout}>
                                        {getFieldDecorator('rangePicker', {})(
                                            <RangePicker placeholder={['不限', '不限']} />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="活动名称"
                                        {...formItemLayout}
                                        validateStatus="validating"
                                        hasFeedback={this.state.hasFeedback}
                                    >
                                        {getFieldDecorator('activity_id', {})(
                                            <Select
                                                showSearch
                                                allowClear
                                                showArrow={false}
                                                filterOption={false}
                                                placeholder="请输入活动名称"
                                                notFoundContent="请输入活动名称"
                                                onSearch={this.handleNameSearch}
                                                onChange={this.handleNameChange}
                                                getPopupContainer={triggerNode => triggerNode.parentNode}
                                            >
                                                {
                                                    this.state.nameInputData && this.state.nameInputData.map((item) => {
                                                        return <Option key={item.id} value={item.id}>{item.name}</Option>
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="领取状态" {...formItemLayout}>
                                        {getFieldDecorator('receive_status', {})(
                                            <Select
                                                placeholder="全部"
                                                getPopupContainer={triggerNode => triggerNode.parentNode}
                                            >
                                                <Option value="">全部状态</Option>
                                                {
                                                    RECEIVE_STATUS.map((item) => {
                                                        return <Option key={item.value} value={item.value}>{item.text}</Option>
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
                        dataSource={firstListData}
                        loading={loading}
                        rowKey="id"
                    />
                    {
                        firstListData && firstListData.length > 0 && !loading ?
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
                            : ''
                    }

                    {/* modal--活动详情 */}
                    <ActivitiesDetails
                        key={this.state.currentDetailsID}
                        id={this.state.currentDetailsID}
                        onClose={this.hideActivityDetailsModal}
                    ></ActivitiesDetails>
                </Page>
            </DocumentTitle>
        )
    }
}
