/**
 **@Description:
 **@author: 吴明
 */

import React from 'react'
import { Button, Collapse, Divider, Table, Popconfirm, Pagination, message, Radio, Form, Popover,Icon } from 'antd'
import { connect } from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import { jine, toNumber } from 'utils/display'
import {  getformCitys } from 'components/business/CitySelect/data'
import router from 'umi/router'
import { Link } from 'dva/router'
import styles from './index.less'


@connect(({ base, mall_carriage, mall_order_list }) => ({
    base,
    mall_carriage,
    mall_order_list
}))
@documentTitleDecorator({
    title: '邮费管理'
})
export default class Index extends Page.ListPureComponent {
    constructor(props) {
        super(props)
        this.state = {
            page: 1,
            per_page: 10,
            pager: { ...DEFAULT_PAGER }
        }
    }
    componentDidMount() {
        this.props.dispatch({
            type: 'mall_order_list/getOrderSetting'
        })
        this.getPageList()
    }
    initPage = (isSetHistory = false) => {
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        this.getPageList(pager, isSetHistory)
    }

    getPageList = (pager = this.state.pager, isSetHistory = true) => {
        if (isSetHistory) {
            this.history({}, pager)
        }
        this.props.dispatch({
            type: 'mall_carriage/carriageTemplateList',
            payload: {
                page: pager.current - 1,
                per_page: pager.pageSize
            },
            callback: () => {
                if (pager) {
                    this.setState({ pager })
                }
            }
        })
    }
    edit = (num, e) => {
        e.stopPropagation()
        router.push(`carriage/carriage_model?id=${num}`)

    }
    delete = (e) => {
        e.stopPropagation()
    }
    handleOpen = (e) => {
        e.stopPropagation()
    }
    toSelectchange = (current, pageSize) => {
        this.getPageList({
            current,
            pageSize
        })
    }
    handleTableChange = (current, pageSize) => {
        this.getPageList({
            current,
            pageSize
        })
    }
    confirm = (num, e) => {
        e.stopPropagation()
        this.props.dispatch({
            type: 'mall_carriage/deleteCarriageTemplate',
            payload: num,
            callback: () => {
                message.success('删除操作成功')
                this.getPageList()
            }
        })
    }
    cancel = (e) => {
        e.stopPropagation()
    }
    RadioChange = (e) => {
        let postage_type = e.target.value
        this.props.dispatch({
            type: 'mall_carriage/putPostageType',
            payload: {
                postage_type
            },
            callback: (res) => {
                message.success('操作成功')
                this.props.dispatch({
                    type: 'mall_order_list/getOrderSetting'
                })
            }
        })
    }
    render() {
        
        const formItemLayout = {
            labelCol: {
                span: 4,
                style: {
                    width: '70px'
                }
            },
            style: {
                color: '#666'
            },
            wrapperCol: {
                span: 20
            }
        }


        const columns = (rule) => ([{
            title: '可配送区域',
            dataIndex: 'ext_json',
            width: 500,
            key: 'ext_json',
            render: (row) => {
                let json = []
                try {
                    json = JSON.parse(row)
                } catch (e) { }
                let j = getformCitys(json)
                return j.map((i, index) => {
                    return <span key={index + 'i'} className={styles.slightColor}><b className={styles.weight}>{i.name}</b>
                        <span key={index + 'i'}>
                            {(i.child ? `（${i.child.map((_i, _index, data) => {
                                return _i.name + (_i.child && i.child.length === 1 ? `：${_i.child.map(__i => (__i.name)).join('、')}` : '')

                            }).join('、')}）` : '')
                            }</span>
                        {index !== j.length - 1 ? '、' : ''}
                    </span>
                })
            }
        }, {
            title: rule === 1 ? '首个(个)' : '首重(KG)',
            dataIndex: 'first',
            key: 'first',
            render: data => <span>{rule === 1 ? data : toNumber(data, '/', 1000)}</span>
        }, {
            title: '运费（元）',
            dataIndex: 'first_price',
            key: 'first_price',
            render: data => <span>{jine(data, '0,0.00', 'Fen')}</span>
        }, {
            title: rule === 1 ? '续个(个)' : '续重(KG)',
            dataIndex: 'second',
            key: 'second',
            render: data => <span>{rule === 1 ? data : toNumber(data, '/', 1000)}</span>
        }, {
            title: '运费（元）',
            dataIndex: 'second_price',
            key: 'second_price',
            render: data => <span>{jine(data, '0,0.00', 'Fen')}</span>
        }])
        const title = {
            0: '是否要删除该邮费模板?',
            1: '确认要删除此模板么？如果删除已配置此模板信息的商品会改为包邮模式。'
        }
        const action = (data) => <div className={styles.flex}>
            <span>{data.name}<span style={{ color: '#666' }}>（共有{data.use_count}件商品使用）</span></span>
            <div>
                <span className={styles.editTime}>基础运费：{jine(data.basic_price, '0,0.00', 'Fen')} 元</span>
                <span className={styles.editTime}> 最后编辑时间：{data.updated_at}</span>
                <Divider type="vertical" />
                <a onClick={(e) => { this.edit(data.id, e) }}>修改</a>
                <Divider type="vertical" />
                <Popconfirm placement="bottomLeft" cancelText='取消' okText='确定' title={data.use_count > 0 ? title[1] : title[0]} onCancel={(e) => { this.cancel(e) }} onConfirm={(e) => { this.confirm(data.id, e) }}>
                    <a onClick={(e) => { this.delete(e) }}>删除</a>
                </Popconfirm>
            </div>
        </div>
        const Panel = Collapse.Panel
        const { loading, data, count } = this.props.mall_carriage
        const { postage_type } = this.props.mall_order_list.orderSetting
        const { current, pageSize } = this.state.pager
        const content = <div style={{ fontSize: 14}}>
            <p> 假设客户购买5件商品，其中3件按自定义计费分别为X1、X2、X3，2件按模板计费分别为</p>
            <p>Y1、Y2，假设自定义运费中X3为最大值，模板运费中Y1为最大值</p>
            <p> ● 按“商品累加”计，总运费Z=X3+Y1+Y2；</p>
            <p> ● 按“运费组合”计，总运费Z=X3+Y1；</p>
        </div>

        return (
            <Page>
                <Page.ContentHeader
                    title="邮费管理"
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E8%99%8E%E8%B5%9E%E5%B0%8F%E5%BA%97/%E9%82%AE%E8%B4%B9%E7%AE%A1%E7%90%86.md"
                />
                <Page.ContentAdvSearch>
                    <p>在这可以设置运费模板，买家下单可以选择快递发货，由你安排快递上门取件</p>
                    <Form.Item label="计费方式：" {...formItemLayout}>
                        <Radio.Group onChange={this.RadioChange} value={postage_type}>
                            <Radio value={1}>运费组合</Radio>
                            <Radio value={2}>商品累加</Radio>
                        </Radio.Group>
                        <Popover placement="bottomLeft" content={content} trigger="hover">
                            <a > 运费计费规则 </a>
                        </Popover>

                    </Form.Item>

                    <Link to='carriage/carriage_model'><Button type="primary"><Icon type="plus" />新增模板</Button></Link>
                </Page.ContentAdvSearch>

                <Collapse className={styles.carriage} bordered={false} defaultActiveKey={['0']}>
                    {
                        data && data.map((item, index) => {
                            return <Panel header={action(item)} key={index + ''} className={styles.customPanelStyle} >
                                <Table
                                    pagination={false}
                                    columns={columns(item.rule)}
                                    loading={loading}
                                    rowKey={record => record.id}
                                    dataSource={item.template_areas ? item.template_areas : []} />
                            </Panel>
                        })
                    }
                </Collapse>
                {
                    data.length ? <Pagination
                        className="ant-table-pagination"
                        total={count}
                        current={current}
                        showQuickJumper={true}
                        showTotal={total => `共${count}条记录`}
                        pageSize={pageSize}
                        pageSizeOptions={['10', '20', '50', '100']}
                        showSizeChanger={true}
                        onShowSizeChange={this.toSelectchange.bind(this)}
                        onChange={this.handleTableChange.bind(this)}
                    /> : null
                }

            </Page>
        )
    }
}
