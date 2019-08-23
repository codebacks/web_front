/**
 **@time: 2018/11/15
 **@Description:微转淘
 **@author: zhousong
 */

import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '@/components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import { Button, Icon, Form, Row, Col, Input, DatePicker, Table, Pagination, Divider, message, Popover, Modal } from 'antd'
import router from 'umi/router'
import { connect } from 'dva'
import LinkQr from '../../../../components/business/LinkQr'
import moment from 'moment'
import styles  from './index.less'
import {getShopTypeByVal} from '../../../../common/shopConf'
const { RangePicker } = DatePicker
const DEFAULT_CONDITION = {
    name: '',
    begin_at: '',
    end_at: ''
}
@documentTitleDecorator({
    overrideTitle:'商品推荐'
})
@Form.create()
@connect(({ platform_wechat_convers, base }) => ({
    platform_wechat_convers, base
}))
export default class Index extends Page.ListPureComponent {
    state = {
        loading: true,
        downloadItemID: null,
        downloadVisible: false,
        downloadItemName: '',
        downloadItemUrl:'',
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER }
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        this.getPageData(condition, pager, isSetHistory)
        const { name, begin_at, end_at } = condition
        this.props.form.setFieldsValue({
            'rangePicker': begin_at && end_at ? [moment(begin_at), moment(end_at)] : [],
            'goodsnameInput': name
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
            type: 'platform_wechat_convers/getLinkList',
            payload: {
                limit: pager.pageSize,
                offset: (pager.current - 1) * pager.pageSize,
                goods_name: condition.name,
                begin_at: condition.begin_at,
                end_at: condition.end_at
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })

                callback && callback(data)
            }
        })
    }

    /**公共方法 */
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
                    end_at: endAt,
                    begin_at: beginAt
                }
            }

            const pager = {
                pageSize: this.state.pager.pageSize,
                current: DEFAULT_PAGER.current
            }

            this.getPageData(condition, pager)
        })
    }

    /**页面事件 */
    onSubmit = (e) => {
        e.preventDefault()
        this.searchData()
    }
    // 重置
    onReset = () => {
        this.props.form.resetFields()
        this.searchData()
    }
    // 点击查看数据
    checkData = (e,item) =>{
        e.preventDefault()
        router.push({
            pathname: '/platform/wechat_convers/goods_data',
            query: {
                id: item.goods_id,
                type:item.shop.type
            }
        })
    }

    // modal-链接二维码
    showDownloadConfirm = (item) => {
        this.setState({
            downloadItemID: item.id,
            downloadVisible: true,
            downloadItemUrl:item.short_url,
            downloadItemName: item.name
        })
    }
    handleDownloadCancel = (e) => {
        this.setState({
            downloadItemID: null,
            downloadVisible: false,
            downloadItemName: '',
            downloadItemUrl:''
        })
    }
    render() {
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '70px',
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
                render:(text,reocrd,index) =>{
                    return (
                        // <span>{reocrd.shop.type === 2 ? '淘宝' : '天猫'}</span>
                        <span>{getShopTypeByVal(reocrd.shop.type)}</span>
                    )
                }
            },
            {
                title: '所属店铺',
                dataIndex: 'shop_name',
                render:(text,reocrd,index) =>{
                    return (
                        <span>{reocrd.shop.name}</span>
                    )
                }
            },
            {
                title: '商品名称',
                dataIndex: 'name',
                className:styles.goodsName,
                render:(text,reocrd,index) =>{
                    return (
                        <span>{
                            (reocrd.goods && reocrd.goods.name) ? <span>{reocrd.goods.name}</span> : ''
                        }</span>
                    )
                }
            },
            {
                title: '商品图片',
                dataIndex: 'qr_code',
                render: (text,record,index) => {
                    if(record.goods && record.goods.pic_url){
                        return (
                            <Popover placement="bottomLeft" content={<img src={record.goods.pic_url} style={{ width: '120px', height: '120px' }} alt=""/>}>
                                <img src={record.goods.pic_url} style={{ width: '60px', height: '60px'}} alt=""/>
                            </Popover>
                        )
                    }else{
                        return ''
                    }
                    
                }
            },
            {
                title: '创建时间',
                dataIndex: 'created_at'
            },
            {
                title: '发送次数',
                dataIndex: 'send_count',
                align: 'center',
            },
            {
                title: '展示次数（PV）',
                dataIndex: 'pv_count',
                align: 'center',
            },{
                title: '访问人数（UV）',
                dataIndex: 'uv_count',
                align: 'center',
            },{
                title: '加购点击次数',
                dataIndex: 'click_count',
                align: 'center',
            },
            {
                title: '操作',
                dataIndex: 'action',
                render: (value,item,index) => {
                    return (
                        <div>
                            <a href='javascript:void(0);' style={{textDecoration: 'none'}} onClick={(e) => this.checkData(e,item)}>数据</a>
                            <Divider type="vertical" />
                            <a href="javascript:void(0);" onClick={() => this.showDownloadConfirm(item)}>链接二维码</a>
                        </div>
                    )
                }
            },
        ]

        const { current, pageSize } = this.state.pager
        const { getFieldDecorator } = this.props.form
        const {downloadItemUrl,downloadItemName,downloadItemID,downloadVisible} = this.state
        const { linkList, count } = this.props.platform_wechat_convers
        return (
            <Page>
                {/*头部面包屑*/}
                <Page.ContentHeader
                    title={this.props.documentTitle}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E8%90%A5%E9%94%80%E5%B9%B3%E5%8F%B0/%E5%95%86%E5%93%81%E6%8E%A8%E8%8D%90.md"
                />
                {/*搜索条件框*/}
                <Page.ContentAdvSearch multiple={false}>
                    <Form onSubmit={this.onSubmit} layout="horizontal" className="hz-from-search">
                        <Row>
                            <Col span={8}>
                                <Form.Item label='商品名称' {...formItemLayout}>
                                    {getFieldDecorator('goodsnameInput', {
                                        rules: [
                                            {
                                                validator: (rules, value, callback) => {
                                                    if (value && /^[\s　]|[ ]$/.test(value)) {
                                                        callback('请勿以空格开头或结束')
                                                    }
                                                    callback()
                                                }
                                            }
                                        ]
                                    })(
                                        <Input placeholder='名称' />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label='创建日期' {...formItemLayout}>
                                    {getFieldDecorator('rangePicker', {})(
                                        <RangePicker />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item>
                                    <Button type='primary' htmlType='submit' style={{marginLeft: '40px'}}>
                                        <Icon type="search" />
                                        搜索
                                    </Button>
                                    <Button className="hz-btn-width-default hz-margin-small-left" style={{ marginLeft: '16px' }} onClick={this.onReset}>重置</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                {/*表格数据*/}
                <Table
                    columns={columns}
                    pagination={false}
                    dataSource={linkList}
                    loading={this.state.loading}
                    rowKey='id'
                />
                {count > 0 && <Pagination
                    className="ant-table-pagination"
                    current={current}
                    total={count}
                    showTotal={(total) => `共 ${total} 条`}
                    showQuickJumper={true}
                    showSizeChanger={true}
                    pageSize={pageSize}
                    pageSizeOptions={['10', '20', '50', '100']}
                    onShowSizeChange={this.handleListPageChangeSize}
                    onChange={this.handleListPageChange}
                />}
                <LinkQr key={'link' + downloadItemID}
                    name={downloadItemName}
                    url={downloadItemUrl}
                    visible={downloadVisible}
                    onClose={this.handleDownloadCancel}
                    isShowCopy={false} /> 
            </Page>
        )
    }
}
