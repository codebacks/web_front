/*
 * @Author: sunlzhi 
 * @Date: 2018-10-16 15:10:24 
 * @Last Modified by: sunlizhi
 * @Last Modified time: 2018-11-28 11:34:19
 */

import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import { Button, Icon, Modal, Select, Table, Form, Row, Col, Input, Tabs, Cascader, Pagination, message, Popover, InputNumber } from 'antd'
import router from 'umi/router'
import styles from './index.less'
// import Page from 'components/business/Page'
import DocumentTitle from 'react-document-title'
import { getImageAbsoulteUrl } from '../../../../utils/resource'
import { jine } from 'utils/display'
import { STATUS } from '../../services/distributor/distributor_center'

const Option = Select.Option
const confirm = Modal.confirm
const TabPane = Tabs.TabPane

const DEFAULT_CONDITION = {
    status: '0',
    category_id: '',
    activity_type: undefined,
    goods_name: '',
}

@connect(({ goods_management, category_management, base }) => ({
    goods_management,
    category_management,
    base,
}))
@Form.create()

export default class Index extends Page.ListPureComponent {
    constructor(props) {
        super(props)
        this.state = {
            // 授权信息
            authInfoData: [],
            selectedRowKeys: [],
            categoryDefault: [],
            loading: false,
            condition: { ...DEFAULT_CONDITION },
            pager: { ...DEFAULT_PAGER },
            // 批量操作是否可用
            disabled: {
                grounding: false,
                undercarriage: false,
                delete: false,
            },
            disabledFunc: {
                recommend: true,
                unrecommend: true,
                grounding: true,
                undercarriage: true,
                delete: true,
            },
            commissionVisible: false,
            commissionID: false,
            commissionLoading: false,
            isCommission: false,
            virtualSale: {
                virtualSaleVisible: false,
                virtualID: false,
                virtualLoading: false
            }
        }
    }

    // 页面加载调用
    // componentDidMount() {
    //     this.getGoodsList(this.state.searchData)
    //     this.getGoodsCategory()
    // }

    // 记录搜索历史
    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)

        const { activity_type, goods_name } = condition

        this.getGoodsCategory(condition.category_id)
        this.getPageData(condition, pager, isSetHistory)
        this.getCenterList()

        this.props.form.setFieldsValue({
            // 'category_id': category_id,
            'activity_type': activity_type,
            'goods_name': goods_name
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
            type: 'goods_management/goodsList',
            payload: {
                page: pager.current - 1,
                per_page: pager.pageSize,
                status: condition.status,
                category_id: condition.category_id,
                activity_type: condition.activity_type,
                goods_name: condition.goods_name,
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
                this.clearState()

                callback && callback(data)
            }
        })
    }

    getCenterList = () => {
        this.props.dispatch({
            type: 'distributor_center/centerList',
            payload: {},
            callback: (data) => {
                if (data.created_at && data.status === STATUS.isStatus) {
                    this.setState({
                        isCommission: true
                    })
                }
            }
        })
    }

    getGoodsList = () => {
        const { form } = this.props

        form.validateFields((error, value) => {
            let category_id = ''
            if (value.category && value.category.length > 0) {
                category_id = value.category[value.category.length - 1]
            } else {
                category_id = ''
            }

            const condition = {
                ...this.state.condition,
                ...{
                    category_id: category_id,
                    activity_type: value.activity_type || '',
                    goods_name: value.goods_name || ''
                }
            }

            const pager = {
                pageSize: this.state.pager.pageSize,
                current: DEFAULT_PAGER.current
            }

            this.getPageData(condition, pager)
        })
    }

    // 清除状态
    clearState = () => {
        // 清空选中的商品
        this.setState({
            selectedRowKeys: []
        })
        this.initializationBatchOperation()
    }

    // 设置商品类目
    setCategory = (category_id) => {
        const { categoryList } = this.props.category_management
        const { categoryDefault } = this.state
        if (category_id) {
            for (let v of categoryList) {
                if (v.id === category_id) {
                    categoryDefault.push(v.id)
                    this.props.form.setFieldsValue({
                        'category': categoryDefault
                    })
                    return
                } else {
                    if (v.children && v.children.length > 0) {
                        for (let w of v.children) {
                            if (w.id === category_id) {
                                categoryDefault.push(v.id)
                                categoryDefault.push(w.id)
                                this.props.form.setFieldsValue({
                                    'category': categoryDefault
                                })
                                return
                            }
                        }
                    }
                }
            }
        }
    }

    // 获取商品分类
    getGoodsCategory = (category_id) => {
        this.props.dispatch({
            type: 'category_management/getCategory',
            payload: {},
            callback: () => {
                this.setCategory(window.parseInt(category_id))
            }
        })
    }

    // 模态弹窗取消（关闭）
    handleCancel = () => {
        this.setState({
            formVisible: false,
            payConfigureVisible: false,
        })
    }

    // 单个商品上下架
    upperLowerFrame = (data) => {
        this.lowerFrameConfirm(data)
    }

    // 单个商品推荐
    recommend = (data) => {
        this.recommendConfirm(data)
    }

    // 商品上下架确认框
    lowerFrameConfirm = (data) => {
        confirm({
            title: `确认操作`,
            content: `确定${data.status === 1 ? '下架' : '上架'}该商品？`,
            maskClosable: true,
            onOk: () => {
                this.props.dispatch({
                    type: 'goods_management/goodsBatch',
                    payload: {
                        ids: [data.id],
                        status: data.status === 1 ? 2 : 1
                    },
                    callback: (res) => {
                        if (!res.error) {
                            message.success(`已${data.status === 1 ? '下架' : '上架'}该商品`)
                            let { goodsList } = this.props.goods_management
                            for (let v of goodsList) {
                                if (v.id === data.id) {
                                    v.status = data.status === 1 ? 2 : 1
                                }
                            }
                            this.props.dispatch({
                                type: 'goods_management/setProperty',
                                payload: {
                                    goodsList: goodsList
                                }
                            })
                            this.clearState()
                        }
                    }
                })
            },
            onCancel() {
            },
        })
    }

    // 商品推荐确认框
    recommendConfirm = (data) => {
        confirm({
            title: `确认操作`,
            content: `确定${data.is_recommend === 1 ? '取消推荐' : '推荐'}该商品？`,
            maskClosable: true,
            onOk: () => {
                this.props.dispatch({
                    type: 'goods_management/batchRecommend',
                    payload: {
                        ids: [data.id],
                        is_recommend: data.is_recommend === 1 ? 0 : 1
                    },
                    callback: (res) => {
                        if (!res.error) {
                            message.success(`已${data.is_recommend === 1 ? '取消推荐' : '推荐'}该商品`)
                            let { goodsList } = this.props.goods_management
                            for (let v of goodsList) {
                                if (v.id === data.id) {
                                    v.is_recommend = data.is_recommend === 1 ? 0 : 1
                                }
                            }
                            this.props.dispatch({
                                type: 'goods_management/setProperty',
                                payload: {
                                    goodsList: goodsList
                                }
                            })
                            this.clearState()
                        }
                    }
                })
            },
            onCancel() {
            },
        })
    }

    // 点击搜索
    handleSubmit = (e) => {
        e.preventDefault()
        this.getGoodsList()
    }

    // 选择分类
    handleTabs = (value) => {
        let { condition, pager } = this.state
        condition.status = value
        pager.current = DEFAULT_PAGER.current

        this.getPageData(condition, pager)
    }

    // 选中商品类目
    onChangeCascader = (val) => {
        // console.log(val)
    }

    // 初始化批量操作
    initializationBatchOperation = (callback) => {
        this.setState({
            disabledFunc: {
                recommend: true,
                unrecommend: true,
                grounding: true,
                undercarriage: true,
                delete: true,
            },
            disabled: {
                grounding: false,
                undercarriage: false,
                delete: false,
            }
        }, () => {
            callback && callback()
        })
    }

    // table选中状态
    onSelectChange = (selectedRowKeys) => {
        let tableData = this.props.goods_management.goodsList

        this.initializationBatchOperation(() => {
            this.setState({ selectedRowKeys }, () => {
                let { disabled, disabledFunc } = this.state
                for (let v of tableData) {
                    for (let w of selectedRowKeys) {
                        if (v.id === w) {
                            if (v.is_recommend === 1) {
                                disabledFunc.unrecommend = false
                            } else {

                                disabledFunc.recommend = false
                            }

                            if (v.status === 1) {
                                disabledFunc.undercarriage = false
                                disabled.delete = true
                            } else if (v.status === 2) {
                                disabledFunc.grounding = false
                                disabledFunc.delete = false
                            }

                            this.setState({
                                disabledFunc: { ...disabledFunc },
                                disabled: { ...disabled }
                            })
                        }
                    }
                }
            })
        })
    }

    // 批量上下架点击
    onBatchShelf = (type) => {
        const { selectedRowKeys } = this.state
        this.batchLowerFrameConfirm(selectedRowKeys, type)
    }

    // 批量推荐点击
    onRecommend = (type) => {
        const { selectedRowKeys } = this.state
        this.batchRecommendConfirm(selectedRowKeys, type)
    }

    // 批量删除点击
    onDelete = () => {
        const { selectedRowKeys } = this.state
        this.batchDeleteConfirm(selectedRowKeys)
    }

    // 批量商品上下架确认框
    batchLowerFrameConfirm = (data, status) => {
        confirm({
            title: `确认操作`,
            content: `确定批量${status === 2 ? '下架' : '上架'}所选商品？`,
            maskClosable: true,
            onOk: () => {
                this.props.dispatch({
                    type: 'goods_management/goodsBatch',
                    payload: {
                        ids: data,
                        status: status
                    },
                    callback: (res) => {
                        if (!res.error) {
                            message.success(`已批量${status === 2 ? '下架' : '上架'}所选商品`)
                            let { goodsList } = this.props.goods_management
                            for (let v of goodsList) {
                                for (let w of data) {
                                    if (v.id === w) {
                                        v.status = status === 1 ? 1 : 2
                                    }
                                }
                            }
                            // 设置商品的上下架状态
                            this.props.dispatch({
                                type: 'goods_management/setProperty',
                                payload: {
                                    goodsList: goodsList
                                }
                            })
                            this.clearState()
                        }
                    }
                })
            },
            onCancel() {
            },
        })
    }

    // 批量商品推荐确认框
    batchRecommendConfirm = (data, is_recommend) => {
        confirm({
            title: `确认操作`,
            content: `确定批量${is_recommend === 2 ? '取消推荐' : '推荐'}所选商品？`,
            maskClosable: true,
            onOk: () => {
                this.props.dispatch({
                    type: 'goods_management/batchRecommend',
                    payload: {
                        ids: data,
                        is_recommend: is_recommend
                    },
                    callback: (res) => {
                        if (!res.error) {
                            message.success(`已批量${is_recommend === 2 ? '取消推荐' : '推荐'}所选商品`)
                            let { goodsList } = this.props.goods_management
                            for (let v of goodsList) {
                                for (let w of data) {
                                    if (v.id === w) {
                                        v.is_recommend = is_recommend === 1 ? 1 : 0
                                    }
                                }
                            }
                            // 设置商品的推荐状态
                            this.props.dispatch({
                                type: 'goods_management/setProperty',
                                payload: {
                                    goodsList: goodsList
                                }
                            })
                            this.clearState()
                        }
                    }
                })
            },
            onCancel() {
            },
        })
    }

    // 批量删除商品
    batchDeleteConfirm = (data) => {
        confirm({
            title: `确认操作`,
            content: `确定批量删除所选商品？`,
            maskClosable: true,
            onOk: () => {
                this.props.dispatch({
                    type: 'goods_management/batchDelete',
                    payload: {
                        ids: data,
                    },
                    callback: (res) => {
                        if (!res.error) {
                            message.success(`已批量删除所选商品`)
                            // 重新请求商品列表
                            this.getGoodsList(this.state.searchData)    
                        }
                    }
                })
            },
            onCancel() {
            },
        })
    }

    // 点击编辑跳转商品编辑页
    routerEdit = (id) => {
        router.push({
            pathname: '/mall/goods_management/add_good',
            query: {
                gid: id
            }
        })
    }

    // 点击新增商品
    routerAdd = () => {
        router.push({
            pathname: '/mall/goods_management/add_good',
        })
    }

    handleImport = () => {
        router.push({
            pathname: '/mall/goods_management/batch_import',
        })
    }

    // 虚拟销量
    handleVirtualChange = (item) => {
        this.setState({
            virtualSale: {
                virtualID: item.id,
                virtualSaleVisible: true,
                virtualLoading: false
            }
        })

        this.props.form.setFieldsValue({
            virtual_sales: item.virtual_sales
        })
    }

    handleVirtualSubmit = () => {
        const virtual_sales = this.props.form.getFieldValue('virtual_sales')
        this.props.form.validateFields((err, values) => {
            let data = {
                id: this.state.virtualSale.virtualID,
                virtual_sales: virtual_sales || 0,
            }

            this.setState({
                virtualSale: {
                    ...this.state.virtualSale,
                    virtualLoading: true
                }
            })
            this.props.dispatch({
                type: 'goods_management/updateVirtualSales',
                payload: {
                    ...data
                },
                callback: (res) => {
                    this.setState({
                        virtualSale: {
                            ...this.state.virtualSale,
                            virtualLoading: false,
                            virtualSaleVisible: false
                        }
                    }, () => {
                        this.props.form.resetFields()

                        let { condition, pager } = this.state
                        this.getPageData(condition, pager)
                    })

                }
            })
        })
    }

    handleVirtualCancel = () => {
        this.props.form.resetFields()

        this.setState({
            virtualSale: {
                ...this.state.virtualSale,
                virtualSaleVisible: false
            }
        })
    }

    // 编辑佣金比例
    handleCommissionChange = (record) => {
        this.setState({
            commissionID: record.id,
            commissionVisible: true
        })

        this.props.form.setFieldsValue({
            commission_rate: record.commission_rate
        })

    }

    handleCommissionSubmit = () => {
        const commission_rate = this.props.form.getFieldValue('commission_rate')
        if (commission_rate) {
            let data = {
                id: this.state.commissionID,
                commission_rate: commission_rate,
            }
            this.setState({
                commissionLoading: true
            })

            this.props.dispatch({
                type: 'goods_management/commissionUpdate',
                payload: {
                    data: { ...data }
                },
                callback: (res) => {
                    this.setState({
                        commissionVisible: false,
                        commissionLoading: false
                    }, () => {
                        this.props.form.resetFields()

                        let { condition, pager } = this.state
                        this.getPageData(condition, pager)
                    })

                }
            })
        }
    }

    handleCommissionCancel = () => {
        this.props.form.resetFields()

        this.setState({
            commissionVisible: false
        })
    }

    // 输入佣金比例
    formatterInteger = (value) => {
        const reg = /[^\d]/g
        if (typeof value === 'string' && (Number(value) > 0 && Number(value) <= 100)) {
            return !isNaN(Number(value)) ? value.replace(reg, '') : ''
        } else if ((typeof value === 'number') && (value > 0 && Number(value) <= 100)) {
            return !isNaN(value) ? String(value).replace(reg, '') : ''
        } else {
            return ''
        }
    }

    formatterVirtual = (value) => {
        const reg = /[^\d]/g
        if (typeof value === 'string' && Number(value) >= 0) {
            return !isNaN(Number(value)) ? value.replace(reg, '') : ''
        } else if ((typeof value === 'number') && value >= 0) {
            return !isNaN(value) ? String(value).replace(reg, '') : ''
        } else {
            return ''
        }
    }

    validateCommissionValue = (rule, value, callback) => {
        if (!value) {
            callback('请输入店铺佣金比例')
            return
        }
        callback()
    }

    render() {
        const { selectedRowKeys, disabledFunc, disabled, condition, loading, pager, } = this.state
        const { goodsList, totalCount } = this.props.goods_management
        const { categoryList } = this.props.category_management
        const { getFieldDecorator } = this.props.form

        // 商品列表table
        const columns = [
            {
                title: '商品',
                dataIndex: 'category',
                key: 'id',
                width: 360,
                render: (text, record) => {
                    let tag = null
                    if (record.activity_type) {
                        tag = record.activity_type === 1 ? (<span className={styles.redGroup}>拼团</span>) : (
                            record.activity_type === 2 ? (<span className={styles.yellowSpecial}>特价</span>) : ''
                        )
                    }
                    if (record.is_recommend === 1) {
                        tag = (
                            <Fragment>
                                {tag}
                                < span className={styles.goodsInfoSign} >推荐</span >
                            </Fragment>
                        )

                    }
                    return (
                        <div className={styles.goodsInfo}>
                            <div className={styles.goodsInfoImage}>
                                <img src={ getImageAbsoulteUrl(record.cover_url, { thumbnail: { width: 60, height: 60 } })} alt="" />
                            </div>
                            <div className={styles.goodsInfoBox}>
                                <p className={styles.goodsInfoName}>{record.name}</p>
                                <div className={styles.goodsInfoPriceSign}>
                                    <span className={styles.goodsInfoPrice}>￥{record.price_low === record.price_high ? jine(record.price, '0,0.00', 'Fen') : (jine(record.price_low, '0,0.00', 'Fen') + '~' + jine(record.price_high, '0,0.00', 'Fen'))}</span>
                                    {tag}
                                    {
                                        record.is_coupon === 2 ? <span className={styles.redGroup}>优惠券</span> : ''
                                    }
                                </div>
                            </div>
                        </div>
                    )
                },
            }, {
                title: '浏览量',
                dataIndex: 'view_count',
                key: 'view_count',
                align: 'center'
            }, {
                title: '总销量',
                dataIndex: 'sales_count',
                key: 'sales_count',
                align: 'center'
            }, {
                title: '虚拟销量',
                dataIndex: 'virtual_sales',
                key: 'virtual_sales',
                align: 'center',
                render: (value, item) => {
                    return <div>{value ? value : 0}
                        <a href="javascript:;" className='hz-margin-small-left'>
                            <Popover
                                placement="topRight"
                                content={virtualContent}
                                visible={this.state.virtualSale.virtualSaleVisible && this.state.virtualSale.virtualID === item.id}
                            >
                            </Popover>
                            <Icon type="edit"
                                onClick={() => this.handleVirtualChange(item)}
                            />
                        </a>
                    </div>
                }
            }, {
                title: '库存',
                dataIndex: 'stock_count',
                key: 'stock_count',
                align: 'center',
            }, {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                render: (text, record) => {
                    return (
                        <div className={text === 1 ? styles.status1 : styles.status2}>{text === 1 ? '已上架' : '已下架'}</div>
                    )
                },
            }, {
                title: '创建时间',
                dataIndex: 'created_at',
                key: 'created_at',
            },
            this.state.isCommission ? {
                title: '佣金比例(%)',
                dataIndex: 'commission_rate',
                key: 'commission_rate',
                align: 'center',
                render: (text, record) => {
                    return <div>{text ? text : '默认'}
                        <a href="javascript:;" className='hz-margin-small-left'>
                            <Popover
                                placement="topRight"
                                content={content}
                                visible={this.state.commissionVisible && this.state.commissionID === record.id}
                            >
                            </Popover>
                            <Icon type="edit"
                                onClick={() => this.handleCommissionChange(record)}
                            />
                        </a>
                    </div>
                }
            } : {},
            {
                title: '操作',
                dataIndex: 'operation',
                key: 'operation',
                render: (text, record) => {
                    return (
                        <div className={styles.operationBtn}>
                            <a href="javascript:;" onClick={() => this.routerEdit(record.id)}>编辑</a>
                            <span className={styles.vertical}>|</span>
                            <a href="javascript:;" onClick={() => this.upperLowerFrame(record)}>{record.status === 1 ? "下架" : "上架"}</a>
                            <span className={styles.vertical}>|</span>
                            <a href="javascript:;" onClick={() => this.recommend(record)}>{record.is_recommend === 1 ? "取消推荐" : "推荐"}</a>
                        </div>
                    )
                },
            }
        ]

        const content = (
            <div style={{ width: '320px' }}>
                <div className='hz-margin-small-bottom'>店铺佣金比例</div>
                <Form.Item style={{ marginBottom: '0' }}>
                    {getFieldDecorator('commission_rate', {
                        rules: [{ validator: this.validateCommissionValue }]
                    })(
                        <InputNumber
                            min={0} max={100}
                            formatter={this.formatterInteger}
                            parser={this.formatterInteger}
                            placeholder="建议设置1%-4%"
                            style={{ width: '100%' }}
                        />
                    )}
                </Form.Item>
                <div style={{ textAlign: 'right' }} className='hz-margin-small-top-bottom'>
                    <Button type="primary" htmlType="submit" onClick={() => this.handleCommissionSubmit()} loading={this.state.commissionLoading}>确定</Button>
                    <Button style={{ marginLeft: 8 }} onClick={this.handleCommissionCancel}>取消</Button>
                </div>
            </div>
        )
        
        const virtualContent = (
            <div style={{ width: '320px' }}>
                <div className='hz-margin-small-bottom'>虚拟销量</div>
                <Form.Item style={{ marginBottom: '0' }}>
                    {getFieldDecorator('virtual_sales', {})(
                        <InputNumber
                            min={0}
                            formatter={this.formatterVirtual}
                            parser={this.formatterVirtual}
                            style={{ width: '100%' }}
                        />
                    )}
                </Form.Item>
                <div style={{ textAlign: 'right' }} className='hz-margin-small-top-bottom'>
                    <Button type="primary" htmlType="submit" onClick={() => this.handleVirtualSubmit()} loading={this.state.virtualSale.virtualLoading}>确定</Button>
                    <Button style={{ marginLeft: 8 }} onClick={this.handleVirtualCancel}>取消</Button>
                </div>
            </div>
        )

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        }

        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '65px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }

        return <DocumentTitle title="商品管理">
            <Page>
                <Page.ContentHeader
                    title="商品管理"
                    showDescriptionIcon={false}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E8%99%8E%E8%B5%9E%E5%B0%8F%E5%BA%97/%E5%95%86%E5%93%81%E7%AE%A1%E7%90%86.md"
                />
                {disabledFunc.recommend}
                <Button type="primary" style={{ marginBottom: 16, marginTop: 0 }} onClick={this.routerAdd}>新增商品</Button>
                <Button type="primary" style={{ marginBottom: 16, marginTop: 0, marginLeft: 16 }} onClick={this.handleImport}>批量导入商品</Button>
                <Page.ContentAdvSearch hasGutter={false}>
                    <Form layout="horizontal" className="hz-from-search">
                        <Row>
                            <Col span={8}>
                                <Form.Item label="商品名称"  {...formItemLayout}>
                                    {getFieldDecorator('goods_name', {
                                        rules: [],
                                    })(
                                        <Input placeholder="输入商品名称" type="search" />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="商品类目"  {...formItemLayout}>
                                    {getFieldDecorator('category', {
                                        rules: [],
                                    })(
                                        <Cascader
                                            placeholder="选择商品类目"
                                            options={categoryList}
                                            expandTrigger="hover"
                                            fieldNames={{ label: 'name', value: 'id' }}
                                            onChange={this.onChangeCascader}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="营销标签" {...formItemLayout}>
                                    {getFieldDecorator('activity_type', {
                                        rules: [],
                                    })(
                                        <Select placeholder="选择营销标签" allowClear>
                                            <Option value="3">推荐</Option>
                                            <Option value="1">拼团</Option>
                                            <Option value="2">特价</Option>
                                            <Option value="4">普通</Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6}>
                                <Form.Item style={{ marginBottom: 0, marginLeft: 65 }}>
                                    <Button className="hz-btn-width-default" type="primary" onClick={this.handleSubmit}>
                                        <Icon type="search" />
                                        搜索
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                <Tabs activeKey={condition.status} onChange={this.handleTabs}>
                    <TabPane tab="全部" key="0"></TabPane>
                    <TabPane tab="已上架" key="1"></TabPane>
                    <TabPane tab="已售罄" key="3"></TabPane>
                    <TabPane tab="已下架" key="2"></TabPane>
                </Tabs>
                <div className={styles.operationButtons}>
                    <Button className={styles.button} disabled={disabledFunc.recommend} onClick={() => this.onRecommend(1)}>批量推荐</Button>
                    <Button className={styles.button} disabled={disabledFunc.unrecommend} onClick={() => this.onRecommend(2)}>取消推荐</Button>
                    <Button className={styles.button} disabled={disabledFunc.grounding || disabled.grounding} onClick={() => this.onBatchShelf(1)}>批量上架</Button>
                    <Button className={styles.button} disabled={disabledFunc.undercarriage || disabled.undercarriage} onClick={() => this.onBatchShelf(2)}>批量下架</Button>
                    <Button className={styles.button} disabled={disabledFunc.delete || disabled.delete} onClick={this.onDelete}>批量删除</Button>
                </div>
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={goodsList}
                    loading={loading}
                    pagination={false}
                    rowKey="id"
                />
                {totalCount > 0 &&
                    <Pagination
                        className="ant-table-pagination"
                        current={pager.current}
                        total={totalCount}
                        showTotal={(total) => `共 ${total} 条`}
                        showQuickJumper={true}
                        showSizeChanger={true}
                        pageSize={pager.pageSize}
                        pageSizeOptions={['10', '20', '50', '100']}
                        onShowSizeChange={this.handleListPageChangeSize}
                        onChange={this.handleListPageChange} />
                }
            </Page>
        </DocumentTitle>
    }
}
