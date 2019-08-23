/**
 **@time: 2018/11/30
 **@Description:首绑有礼-活动列表
 **@author: wangchunting
 */

import React from 'react'
import { connect } from 'dva'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import DocumentTitle from 'react-document-title'
import { Form, Select, Input, Button, Row, Col, DatePicker, Icon, Table, Divider, Modal, Pagination, message } from 'antd'
import UserSelect from 'components/business/UserSelect'
import router from 'umi/router'
import { Link } from 'dva/router'
import styles from './index.less'
import ActivitiesDetails from './modals/ActivitiesDetails'
import { datetime } from '../../../../utils/display'
import { ACTIVIT_STATUS, SHOP_TYPE } from '../../services/first_binding'
import moment from 'moment'

const DEFAULT_CONDITION = {
    name: '',
    status: '',
    begin_at: '',
    end_at: '',
    creator: ''
}

@Form.create({})
@connect(({ base, platform_first_binding }) => ({
    base, platform_first_binding
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
        shops_type: ''
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        this.isOpen()
        this.getshopsData()

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
            type: 'platform_first_binding/listData',
            payload: {
                offset: (pager.current - 1) * pager.pageSize,
                limit: pager.pageSize,
                begin_at: condition.begin_at,
                end_at: condition.end_at,
                status: condition.status,
                name: condition.name,
                creator: condition.creator
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
            content: '活动下线后不可再次编辑上线，是否确定下线该活动?',
            okText: '确定',
            cancelText: '取消',
            iconType: 'question-circle',
            onOk: () => {
                this.getDownlineData(id)
            },
        })
    }

    getDownlineData = (id) => {
        this.props.dispatch({
            type: 'platform_first_binding/downline',
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

    // 编辑
    showUpdateConfirm = (id) => {
        router.push(`/platform/first_binding/create?id=${id}`)
    }

    // 数据
    showDataConfirm = (id) => {
        router.push(`/platform/first_binding/data?id=${id}`)
    }

    // modal--活动详情
    showDetailsModal = (id) => {
        this.setState({
            currentDetailsID: id
        })
    }

    hideActivityDetailsModal = () => {
        this.setState({
            currentDetailsID: ''
        })
    }

    // 新建活动
    showConfirm = () => {
        router.push(`/platform/first_binding/create`)
    }

    // Btn-未开通(创建活动)
    isOpen() {
        this.props.dispatch({
            type: 'platform_first_binding/isOpen',
            payload: {
                has_wx_pay: 2
            }
        })
    }

    isOpenShopConfirm = () => {
        this.setState({
            isOpenShopModal: true
        })
    }

    handleShopCancel = () => {
        this.setState({
            isOpenShopModal: false
        })
    }

    // 店铺列表
    getshopsData = () => {
        this.props.dispatch({
            type: 'platform_first_binding/shops',
            payload: {},
            callback: () => {
                const { shopsData } = this.props.platform_first_binding
                let data = []
                if (shopsData && shopsData.length) {
                    shopsData.forEach(item => {
                        data.push(item.type)
                    })
                    const openBtn = SHOP_TYPE.some((item, i) => {
                        return data.includes(item.value) === true
                    })
                    this.setState({
                        isOpenShopButton: !openBtn
                    })
                } else {
                    this.setState({
                        isOpenShopButton: true
                    })
                }
            }
        })
    }

    render() {
        const FormItem = Form.Item
        const { RangePicker } = DatePicker
        const Option = Select.Option
        const { getFieldDecorator } = this.props.form
        const { current, pageSize } = this.state.pager
        const { rows_found, listData, isOpen } = this.props.platform_first_binding

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
            render: (text, item) => {
                return < div >
                    <a href="javascript:;" onClick={() => this.showDetailsModal(item.id)}>{text}</a>
                </div >
            }
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
            title: '最后编辑时间',
            dataIndex: 'last_operate_at',
        }, {
            title: '创建人',
            dataIndex: 'creator',
        }, {
            title: '参与人数',
            dataIndex: 'user_count',
            align: 'center'
        }, {
            title: '绑定人数',
            dataIndex: 'bind_count',
            align: 'center'
        }, {
            title: '操作',
            render: (text, record) => {
                switch (record.status) {
                    case ACTIVIT_STATUS[0].value: //未开始
                        return <span>
                            <a href="javascript:;" onClick={() => this.showUpdateConfirm(record.id)}>编辑</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={() => this.showDownlineConfirm(record.id)}>下线</a>
                        </span>
                    case ACTIVIT_STATUS[1].value: //进行中
                        return <span>
                            <a href="javascript:;" onClick={() => this.showDataConfirm(record.id)}>数据</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={() => this.showUpdateConfirm(record.id)}>编辑</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={() => this.showDownlineConfirm(record.id)}>下线</a>
                        </span>
                    case ACTIVIT_STATUS[2].value: //已结束
                        return <span>
                            <a href="javascript:;" onClick={() => this.showDataConfirm(record.id)}>数据</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={() => this.showDeleteConfirm(record.id)}>删除</a>
                        </span>
                    default:
                        return ''
                }
            }
        }]

        const action = (
            <div>
                {
                    !isOpen.length ? <div>
                        <Button type="primary" className={styles.open}><Link to='/setting/authorization/subscription?type=openFirstBindingAuthorization'>创建活动</Link></Button>
                        <span className="hz-page-content-action-description">请注意支付配置信息完善，并保障公众号商户平台余额充足。</span>
                    </div> : this.state.isOpenShopButton ? <div>
                        <Button type="primary" onClick={this.isOpenShopConfirm}><Icon type="plus" />创建活动</Button>
                        <span className="hz-page-content-action-description">后台创建首绑有礼活动，通过牛客服将活动链接发送给客户，可以将客户的购物账号和微信号进行关联绑定，进而完善客户信息！</span>
                    </div> : <div> <Button type="primary" onClick={this.showConfirm}><Icon type="plus" />创建活动</Button><span className="hz-page-content-action-description">后台创建首绑有礼活动，通过牛客服将活动链接发送给客户，可以将客户的购物账号和微信号进行关联绑定，进而完善客户信息！</span></div>
                }
            </div>
        )
        return (
            <DocumentTitle title="活动列表">
                <Page>
                    <Page.ContentHeader
                        title="活动列表"
                        action={action}
                        helpUrl='http://newhelp.51zan.cn/manual/content/%E8%90%A5%E9%94%80%E5%B9%B3%E5%8F%B0/%E9%A6%96%E7%BB%91%E6%9C%89%E7%A4%BC.md'
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
                        dataSource={listData}
                        loading={loading}
                        rowKey="id"
                    />
                    {
                        listData && listData.length > 0 && !loading ?
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
                        key={'detail' + this.state.currentDetailsID}
                        id={this.state.currentDetailsID}
                        onClose={this.hideActivityDetailsModal}
                    ></ActivitiesDetails>

                    <Modal title="提示"
                        visible={this.state.isOpenShopModal}
                        onCancel={this.handleShopCancel}
                        footer={[<Button key="submit" type="primary" onClick={this.handleShopCancel}>确定</Button>]}>
                        <div>
                            <span className={styles.subAuthTips}>请先创建淘宝、天猫、京东或有赞四个类型平台店铺</span>
                        </div>
                    </Modal>
                </Page>
            </DocumentTitle>
        )
    }
}
