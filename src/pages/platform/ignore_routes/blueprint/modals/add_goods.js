/**
 **@Description:创建活动-添加商品
 **@author: wangchunting
 */

import React, { Component } from 'react'
import Page from 'components/business/Page'
import { Form, Input, Select, Row, Col, Pagination, Button, Icon, Modal, Table, Badge, message } from 'antd'
import { SHOP_TYPE, SHOP_TYPE_ENUM } from '@/common/shopConf'
import styles from "../index.less"
import { jine } from '../../../../../utils/display'
import { goods, shops } from '../../../services/blueprint'
import _ from 'lodash'

@Form.create()

export default class Goods extends Component {
    constructor(props) {
        super(props)
        this.state = {
            rows_found: '',
            selectedRowKeys: [],
            shopsData: [],
            goodsData: [],
            goodsDetailData: [],
            offset: 1,
            limit: 10,
            shop_type: '',
            loading: true,
            goodsAllDatas: [],
            goodsPageDatas: [],
            goodsFilterDatas: [],
            goodsSearchData: ''
        }
    }

    componentDidMount() {
        const { shop_type, goodsDetailData } = this.props
        if (shop_type) {
            this.setState({
                shop_type
            })
            if (this.isTaoBaoOrTianMaoShopType(shop_type)) {
                this.getShops(shop_type)
            }
        }
        if (goodsDetailData) {
            this.setState({
                // loading: false,
                goodsDetailData: goodsDetailData,
                selectedRowKeys: goodsDetailData.map(item => item.goods_id)
            })
        }
    }

    getShops = (shop_type) => {
        shops({
            // type: shop_type,
            auth_status: 2,
            limit: 9999,
            order_by: 'auth_at desc',
            auth_source: 1
        }).then(({ data }) => {
            if (data && data.length) {
                this.setState({
                    shopsData: data,
                }, () => {
                    if (this.isTaoBaoOrTianMaoShopType(this.state.shop_type)) {
                        const { offset, limit } = this.state
                        // 默认刷新
                        let shop = {
                            shop_id: data[0].id,
                        }

                        this.setState({
                            goodsSearchData: { ...shop },
                            shop_id: data[0].id,
                        }, () => {
                            this.getGoodsData(offset, limit)
                        })

                        // if (goodsDetailData && goodsDetailData.length) {
                        //     let data = {
                        //         shop_id: goodsDetailData[0].shop_id,
                        //     }
                        //     this.setState({
                        //         goodsSearchData: { ...data },
                        //         shop_id: goodsDetailData[0].shop_id,
                        //     }, () => {
                        //         this.getGoodsData(offset, limit)
                        //     })
                        // } else {
                        // }

                    }
                })
            } else {
                this.setState({
                    loading: false,
                })
            }
        })
    }

    getGoodsData = (offset, limit) => {
        const { shop_type, goodsSearchData, goodsFilterDatas } = this.state

        goods({
            type: shop_type,
            shop_id: goodsSearchData.shop_id,
            name: goodsSearchData.name,
            offset: (offset - 1) * limit,
            limit: limit
        }).then(({ data, pagination }) => {
            // 分页累加过滤相同id的数据
            if (goodsFilterDatas.length > 0 && (data && data.length)) {
                const flag = goodsFilterDatas.some((item, i) => goodsFilterDatas[i].id === data[0].id)

                if (!flag) {
                    this.setState({
                        goodsFilterDatas: goodsFilterDatas.concat(data)
                    })
                }

            } else {
                this.setState({
                    goodsFilterDatas: data
                })
            }

            this.setState({
                loading: false,
                goodsData: data,
                rows_found: pagination.rows_found
            })

        })

    }

    isTaoBaoOrTianMaoShopType = (shopTypeValue) => {
        return shopTypeValue === SHOP_TYPE_ENUM.TaoBaoTianMao.value
    }

    handleOk = () => {
        const { selectedRowKeys, goodsFilterDatas } = this.state
        const { goodsDetailData } = this.props

        let data = [], total = [], newlist = []
        // 切换分页累计商品进行筛选
        goodsFilterDatas.forEach((item, index) => {
            selectedRowKeys.forEach((v, i) => {
                if (item.id === v) {
                    data = goodsFilterDatas[index]
                    total.push(data)
                }
            })
        })

        let datas = this.handleDetailData(total)

        let detailData = _.uniqBy(newlist.concat(datas, goodsDetailData), 'number')

        if (detailData.length > 5) {
            message.warning('当前最多仅支持5款商品参与活动')
            return false
        }

        this.setState({
            addGoodsVisible: false,
            goodsDetailData: detailData
        })

        this.props.onOk && this.props.onOk(detailData)
    }

    // 详情
    handleDetailData = (data) => {
        return data.map(item => {
            return {
                pic_url: item.pic_url,
                name: item.name,
                price: item.price,
                status: item.status,
                number: item.number,
                goods_id: item.id,
                isGoodsAmount: false,
                amount: '',
                shop_id: item.shop.id,
                shop_name: item.shop.name,
                type: item.shop.type
            }
        })
    }

    handleCancel = () => {
        this.props.form.resetFields()

        const { onClose } = this.props
        onClose && onClose()
    }

    // 搜索
    searchSubmitHandle = () => {
        this.props.form.validateFields((err, values) => {
            let data = {
                name: values.name || '',
                shop_id: values.shop_id || '',
            }
            this.setState({
                goodsSearchData: { ...data },
                offset: 1,
            }, () => {
                const { shopsData } = this.state
                if (shopsData.length) {
                    this.getGoodsData(this.state.offset, this.state.limit)
                }
            })
        })

    }

    resetSearchHandler = () => {
        const { shopsData } = this.state
        let data = {
            shop_id: shopsData && shopsData.length ? shopsData[0].id : '',
            name: '',
        }

        this.setState({
            goodsSearchData: { ...data },
            offset: 1,
            selectedRowKeys: []
        }, () => {
            this.props.form.resetFields()
            const { shopsData } = this.state
            if (shopsData.length) {
                this.getGoodsData(this.state.offset, this.state.limit)
            }
        })
    }

    handleChangeSize = (offset, limit) => {
        this.setState({
            offset: offset,
            limit: limit
        }, () => {
            this.getGoodsData(offset, limit)
        })
    }

    changeTablePage = (offset, key) => {
        this.setState({
            offset: offset
        }, () => {
            this.getGoodsData(offset, this.state.limit)
        })
    }

    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys })
    }

    formatterPoint = (value) => {
        const reg = /^(\-)*(\d+)\.(\d\d).*$/
        if (typeof value === 'string' && (Number(value) > 1 && Number(value) <= 200)) {
            return !isNaN(Number(value)) ? value.replace(reg, '$1$2.$3') : ''
        } else if (typeof value === 'number' && (Number(value) >= 1 && Number(value) <= 200)) {
            return !isNaN(value) ? String(value).replace(reg, '$1$2.$3') : ''
        } else {
            return ''
        }
    }

    render() {
        const FormItem = Form.Item
        const { getFieldDecorator } = this.props.form
        const Option = Select.Option
        const { visible } = this.props
        const { rows_found, selectedRowKeys, shopsData, loading, goodsData, offset, limit, goodsFilterDatas } = this.state
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

        const columns = [{
            title: '商品',
            dataIndex: 'goods',
            width: 300,
            render: (text, record) => {
                return <div style={{ display: 'flex' }}>
                    <div>
                        {
                            record.pic_url ? <img src={record.pic_url} width="64" height="64" alt="宝贝图片" /> : <div style={{ width: 64, height: 64, lineHeight: '64px' }}>暂无图片</div>
                        }
                    </div>
                    <div className='hz-margin-small-left' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div className={styles.textEllipsis}>{record.name}</div>
                        <div style={{ fontSize: 14, color: '#556675', fontWeight: 'bold' }}>￥{jine(record.price, '0,0.00', 'Fen')}</div>
                    </div>
                </div>
            }
        }, {
            title: '平台ID',
            width: 160,
            dataIndex: 'number',
        }, {
            title: '状态',
            width: 160,
            dataIndex: 'status',
            render: (text, record) => {
                switch (text) {
                    case 1:
                        return <Badge status="processing" text='在售'></Badge>
                    case 2:
                        return <Badge status="default" text='下架'></Badge>
                    default:
                        return
                }
            }
        }]

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        }

        return (
            <Modal
                title="添加商品"
                visible={visible}
                onCancel={this.handleCancel}
                width={900}
                height={743}
                onOk={this.handleOk}
                className={styles.ModalBody}
            >
                <div className='hz-margin-base-bottom'>每日21:00系统自动更新淘宝和天猫店铺的在售商品</div>
                <Page.ContentAdvSearch multiple={false}>
                    <Form layout="horizontal" className="hz-from-search">
                        <Row>
                            <Col span={8}>
                                <FormItem label="选择店铺" {...formItemLayout}>
                                    {getFieldDecorator('shop_id', {
                                        rules: [{ required: true, message: '请选择店铺' }],
                                        initialValue: shopsData && shopsData.length ? shopsData[0].id : ''
                                    })(
                                        <Select
                                            placeholder="选择店铺"
                                        >
                                            {shopsData && shopsData.map(item => {
                                                return <Option key={item.id} value={item.id}>{item.name}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label="商品名称" {...formItemLayout}>
                                    {getFieldDecorator('name', {})(
                                        <Input placeholder='请输入商品名称' />
                                    )}
                                </FormItem>
                            </Col>
                            <Col>
                                <Form.Item {...formItemLayout}>
                                    <Button className="hz-btn-width-default" type="primary" htmlType="submit" onClick={this.searchSubmitHandle}>
                                        <Icon type="search" />
                                        搜索
                                    </Button>
                                    <Button className="hz-btn-width-default hz-margin-base-left" onClick={this.resetSearchHandler}>
                                        重置
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                <div className={`${styles.boxTitle} hz-padding-base-bottom hz-margin-small-top`}>
                    <span className={styles.boxTitleIcon}></span>
                    <span className={styles.boxText}>选择商品</span>
                    <span className='hz-margin-small-left'>已选择{selectedRowKeys.length > 0 ? selectedRowKeys.length : 0}款商品</span>
                </div>

                {
                    (!shopsData.length || !goodsData.length) && !loading ?
                        <div className={styles.unGoodsImg}>
                            <img src={require('../../../assets/images/unGoods.png')} alt="" />
                            {!shopsData.length ?
                                <div>您还没有授权的店铺哦！</div> : <div>您的店铺没有商品哦！</div>
                            }
                        </div> :
                        <Table
                            columns={columns}
                            dataSource={goodsData}
                            pagination={false}
                            rowSelection={rowSelection}
                            scroll={{ y: 400 }}
                            rowKey="id"
                            className={styles.modalTable}
                            loading={loading}
                        />
                }

                {
                    goodsData && goodsData.length > 0 && !loading ?
                        <Pagination
                            size="small"
                            style={{ float: 'none', textAlign: 'right' }}
                            className="ant-table-pagination"
                            showQuickJumper
                            total={rows_found}
                            current={offset}
                            showTotal={(rows_found) => `共 ${rows_found} 条`}
                            pageSize={limit}
                            onShowSizeChange={this.handleChangeSize}
                            onChange={this.changeTablePage}
                        />
                        : ''
                }
            </Modal>
        )
    }
}