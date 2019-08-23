/**
 **@time: 2018/11/15
 **@Description:微转淘/店铺商品一键转换
 **@author: zhousong
 */

import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from 'components/business/Page'
import DocumentTitle from 'react-document-title'
import { Button, Icon, Form, Row, Col, Input, DatePicker, Table, Pagination, Cascader, Badge, InputNumber, Modal, message } from 'antd'
import styles from './index.less'
import { connect } from 'dva'
import { SHOP_TYPE } from '../../../../../common/shopConf'
import numeral from 'numeral'
import moment from 'moment'

const { RangePicker } = DatePicker
const confirm = Modal.confirm

const DEFAULT_CONDITION = {
    type: '',
    shop_id: '',
    outer_number: '',
    name: '',
    begin_price: '',
    end_price: '',
    modified_begin_at: '',
    modified_end_at: ''
}

@Form.create()
@connect(({ platform_wechat_convers, base }) => ({
    platform_wechat_convers, base
}))
export default class extends Page.ListPureComponent {
    state = {
        loading: true,
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER }
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        this.getPageData(condition, pager, isSetHistory)

        this.props.dispatch({
            type: 'platform_wechat_convers/getShopListOauth',
        })

        const {
            outer_number,
            name,
            begin_price,
            end_price,
            modified_begin_at,
            modified_end_at,
            type,
            shop_id
        } = condition
        this.props.form.setFieldsValue({
            'merchantInput': outer_number,
            'priceInputLow': begin_price,
            'priceInputHigh': end_price,
            'rangePicker': modified_begin_at && modified_end_at ? [moment(modified_begin_at), moment(modified_end_at)] : [],
            'goodsnameInput': name,
            'platformCas': type ? [parseFloat(type), shop_id ? parseFloat(shop_id) : ''] : ''
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
            type: 'platform_wechat_convers/getGoodsList',
            payload: {
                limit: pager.pageSize,
                offset: (pager.current - 1) * pager.pageSize,
                type: condition.type,
                shop_id: condition.shop_id,
                outer_number: condition.outer_number,
                name: condition.name,
                begin_price: condition.begin_price ? condition.begin_price * 100 : '',
                end_price: condition.end_price ? condition.end_price * 100 : '',
                modified_begin_at: condition.modified_begin_at,
                modified_end_at: condition.modified_end_at,
                order_by: 'is_wechat_to_taobao desc'
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })

                callback && callback(data)
            }
        })
    }

    /**根据搜索条件搜索数据 */
    searchData = () => {
        this.props.form.validateFields((error, value) => {
            if (error) return
            let beginAt = '', endAt = ''
            if (value.rangePicker && value.rangePicker.length !== 0) {
                beginAt = value.rangePicker[0].format('YYYY-MM-DD')
                endAt = value.rangePicker[1].format('YYYY-MM-DD')
            }

            const condition = {
                ...this.state.condition,
                ...{
                    name: value.goodsnameInput,
                    type: value.platformCas && value.platformCas.length > 0 ? value.platformCas[0] : '',
                    shop_id: value.platformCas && value.platformCas.length > 0 ? value.platformCas[1] : '',
                    outer_number: value.merchantInput,
                    modified_end_at: endAt,
                    modified_begin_at: beginAt,
                    begin_price: value.priceInputLow,
                    end_price: value.priceInputHigh
                }
            }

            const pager = {
                pageSize: this.state.pager.pageSize,
                current: DEFAULT_PAGER.current
            }

            this.getPageData(condition, pager)
        })
    }

    /**表单验证 */

    priceLowValidator = (rules, value, callback) => {
        const form = this.props.form
        if (value && form.getFieldValue('priceInputHigh')) {
            form.validateFields(['priceInputHigh'], { force: true })
        }
        callback()
    }

    priceHighValidator = (rules, value, callback) => {
        const form = this.props.form
        const lowPrice = form.getFieldValue('priceInputLow')
        if (lowPrice !== undefined && value && value < lowPrice) {
            callback('不能小于初始商品价格')
        } else {
            callback()
        }
    }

    speceValidate = (rules, value, callback) => {
        if (value && /^[\s　]|[ ]$/.test(value)) {
            callback('请勿以空格开头或结束')
        }
        callback()
    }

    /**页面事件 */
    onSubmit = (e) => {
        e.preventDefault()

        this.searchData()
    }

    onReset = () => {
        this.props.form.resetFields()

        this.searchData()
    }

    onSetAll = () => {
        const that = this
        confirm({
            title: '确认',
            content: '确定将所有商品均设为微转淘短链？',
            onOk: () => {
                that.props.dispatch({
                    type: 'platform_wechat_convers/oneClickSetAll',
                    callback: (data) => {
                        Modal.success({
                            title: '设置成功',
                            content: '如商品较多，可能需要10-20分钟，请耐心等待',
                            okText: '确定',
                            onOk: () => {
                                that.searchData()
                            }
                        })
                    }
                })
            }
        })
    }

    onSetWetoTao = (id) => {
        const { condition, pager } = this.state
        this.setState({
            loading: true
        })
        this.props.dispatch({
            type: 'platform_wechat_convers/setWetoTao',
            payload: id,
            callback: (data) => {
                message.success('设置成功')
                this.getPageData(condition, pager)
            }
        })
    }

    onDeleteWetoTao = (id) => {
        const { condition, pager } = this.state
        confirm({
            title: '确认',
            content: '确定删除微转淘？',
            onOk: () => {
                this.setState({
                    loading: true
                })
                this.props.dispatch({
                    type: 'platform_wechat_convers/goodsDeleteWe',
                    payload: id,
                    callback: (data) => {
                        message.success('删除成功')
                        this.getPageData(condition, pager)
                    }
                })
            }
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
        const formLongItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '98px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const columns = [
            {
                title: '类型',
                dataIndex: 'type',
                width: '68px',
                render: (value, { shop }) => {
                    return <span>{shop.type === 2 ? '淘宝' : '天猫'}</span>
                }
            },
            {
                title: '店铺',
                dataIndex: 'merchant',
                render: (value, { shop }) => {
                    return <span>{shop.name}</span>
                }
            },
            {
                title: '平台ID',
                dataIndex: 'number'
            },
            {
                title: '主图',
                dataIndex: 'pic_url',
                render: (value) => {
                    return <img src={value} alt='' className={styles.img}></img>
                }
            },
            {
                title: '商品名称',
                dataIndex: 'name'
            },
            {
                title: '价格',
                dataIndex: 'price',
                render: (value) => {
                    return <span style={{whiteSpace: 'nowrap'}}>{numeral(value / 100).format('0,0.00')}</span>
                }
            },
            {
                title: '商家编码',
                dataIndex: 'outer_number'
            },
            {
                title: '商品修改时间',
                width: '120px',
                dataIndex: 'modified_at'
            },
            {
                title: '商品状态',
                dataIndex: 'status',
                width: '90px',
                render: (value) => {
                    if (value === 1) {
                        return <Badge status='processing' text='在售' style={{ whiteSpace: 'nowrap' }}></Badge>
                    } else {
                        return <Badge status='default' text='已下架' style={{ whiteSpace: 'nowrap' }}></Badge>
                    }
                }
            },
            {
                title: '操作',
                dataIndex: 'action',
                width: '115px',
                render: (value, { is_wechat_to_taobao, number}) => {
                    if (is_wechat_to_taobao === 1) {
                        return <a href='javascript:;' style={{ textDecoration: 'none' }} onClick={() => this.onSetWetoTao(number)}>设为微转淘</a>
                    } else {
                        return <a href='javascript:;' style={{ textDecoration: 'none' }} onClick={() => this.onDeleteWetoTao(number)}>删除微转淘</a>
                    }
                }
            },
        ]

        const { current, pageSize } = this.state.pager
        const { getFieldDecorator } = this.props.form
        const { list, totalCount, shops } = this.props.platform_wechat_convers

        let type = []
        const arr = SHOP_TYPE.filter((item) => {
            return item.name !== 'HuZan' && item.name !== 'Mendian' && item.name !== 'JD'
        })
        arr.forEach((item, index) => {
            type.push({
                value: item.value,
                label: item.type,
                children: [{
                    value: '',
                    label: '不限',
                }],
            })
        })
        shops.forEach((val, key) => {
            type.forEach((v, k) => {
                if (val.type === v.value) {
                    v.children.push({
                        value: val.id,
                        label: val.name,
                    })
                }
            })
        })

        return (
            <DocumentTitle title='一键转换'>
                <Page>
                    {/*头部面包屑*/}
                    <Page.ContentHeader
                        action={<Button type='primary' onClick={this.onSetAll} disabled={list.length === 0}>一键全设</Button>}
                        breadcrumbData={[{
                            name: '微转淘',
                            path: '/platform/wechat_convers'
                        }, {
                            name: '店铺商品一键转换'
                        }]}
                    />
                    {/*搜索条件框*/}
                    <Page.ContentAdvSearch>
                        <Form onSubmit={this.onSubmit}>
                            <Row>
                                <Col span={8}>
                                    <Form.Item label='店铺' {...formItemLayout}>
                                        {getFieldDecorator('platformCas', {})(
                                            <Cascader placeholder='不限' options={type} popupClassName={styles.userCascader}></Cascader>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label='商品名称' {...formLongItemLayout}>
                                        {getFieldDecorator('goodsnameInput', {
                                            rules: [
                                                {
                                                    validator: this.speceValidate
                                                }
                                            ]
                                        })(
                                            <Input placeholder='商品名称' />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label='商家编码' {...formItemLayout}>
                                        {getFieldDecorator('merchantInput', {
                                            rules: [
                                                {
                                                    validator: this.speceValidate
                                                }
                                            ]
                                        })(
                                            <Input placeholder='商家编码' />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <Row>
                                        <Col span={6} style={{ 'width': ' 80px', 'textAlign': 'right', 'lineHeight': '39px', color: '#333' }}>
                                            商品价格：
                                        </Col>
                                        <Col span={16}>
                                            <Row>
                                                <Col span={10}>
                                                    <Form.Item>
                                                        {getFieldDecorator('priceInputLow', {
                                                            rules: [
                                                                {
                                                                    validator: this.priceLowValidator
                                                                }
                                                            ]
                                                        })(
                                                            <InputNumber
                                                                min={0}
                                                                formatter={value => `￥${value}`}
                                                                parser={value => value.replace('￥', '')}
                                                                style={{ width: '100%' }}
                                                            />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4} style={{ 'textAlign': 'center', 'lineHeight': '39px' }}>至</Col>
                                                <Col span={10}>
                                                    <Form.Item>
                                                        {getFieldDecorator('priceInputHigh', {
                                                            rules: [
                                                                {
                                                                    validator: this.priceHighValidator
                                                                }
                                                            ]
                                                        })(
                                                            <InputNumber
                                                                min={0}
                                                                formatter={value => `￥${value}`}
                                                                parser={value => value.replace('￥', '')}
                                                                style={{ width: '100%' }}
                                                            />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label='商品修改时间' {...formLongItemLayout}>
                                        {getFieldDecorator('rangePicker', {})(
                                            <RangePicker
                                                format="YYYY-MM-DD"
                                                style={{ width: '100%' }}
                                            />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Button type='primary' style={{ marginLeft: '80px' }} htmlType='submit'>
                                <Icon type="search" />
                                搜索
                            </Button>
                            <Button style={{ marginLeft: '20px' }} onClick={this.onReset}>重置</Button>
                        </Form>
                    </Page.ContentAdvSearch>
                    {/*表格数据*/}
                    <Table
                        columns={columns}
                        pagination={false}
                        dataSource={list}
                        loading={this.state.loading}
                        rowKey='id'
                    />
                    {totalCount > 0 && <Pagination
                        className="ant-table-pagination"
                        current={current}
                        total={totalCount}
                        showTotal={(total) => `共 ${total} 条`}
                        showQuickJumper={true}
                        showSizeChanger={true}
                        pageSize={pageSize}
                        pageSizeOptions={['10', '20', '50', '100']}
                        onShowSizeChange={this.handleListPageChangeSize}
                        onChange={this.handleListPageChange}
                    />}
                </Page>
            </DocumentTitle>
        )
    }
}
