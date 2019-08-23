'use strict'

import React from 'react'
import { connect } from 'dva'
import { Table, Pagination, Button, Form, Row, Col, Input, Icon, Select, Popover } from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import styles from './index.less'
import { getImageAbsoulteUrl } from '@/utils/resource'
const Option = Select.Option

// 关联状态
// const related_status = [{
//     value: '1',
//     text: '是'
// }, {
//     value: '2',
//     text: '否'
// }]

const DEFAULT_CONDITION = {
    fans: '',
    belongs_wechat: '',
    is_related: '',
}

@connect(({ gzh_fans, wechats }) => ({ gzh_fans, wechats }))
@documentTitleDecorator({ title: '粉丝统计' })
@Form.create()
export default class extends Page.ListPureComponent {
    state = {
        loading: false,
    }
    componentDidMount() {
        super.componentDidMount()
        // this.getAppId().then(()=>{
        //     const {app_id} = this.props.gzh_fans
        //     if(app_id){
        //         this.props.dispatch({
        //             type: 'gzh_fans/getFanStatic',
        //             payload: {
        //                 app_id: app_id,
        //             },
        //         })
        //     }
        // })
        this.loadWechats()
    }
    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        const { fans, belongs_wechat, is_related } = condition
        this.getPageData(condition, pager, isSetHistory)
        this.props.form.setFieldsValue({
            'fans': fans || '',
            'belongs_wechat': belongs_wechat || '',
            'is_related': is_related || '',
        })
    }
    getPageData = (condition, pager, isSetHistory = true,callback) => {
        if( isSetHistory ){
            this.history(condition, pager)
        }

        let getList = (data)=>{ 
            this.setState({
                condition: condition,
                pager: pager,
                loading: true
            })
            this.props.dispatch({
                type: 'gzh_fans/getFanList',
                payload: {
                    app_id: data,
                    page: pager.current,
                    per_page: pager.pageSize,
                    fans: condition.fans,
                    belongs_wechat: condition.belongs_wechat,
                    is_related: condition.is_related,
                },
                callback: () => {
                    this.setState({
                        loading: false
                    })
                }
            })
        }
        const {app_id} = this.props.gzh_fans
        if(app_id){
            getList(app_id)
        }else{
            this.getAppId().then((data)=>{
                if(data){
                    getList(data)
                }
            })
        }
    }
    handleSearch = () => {
        const { form } = this.props
        form.validateFields((error,value) => {
            const condition = {
                ...this.state.condition,
                ...{
                    fans: value.fans,
                    belongs_wechat: value.belongs_wechat,
                    is_related: value.is_related,
                }
            }
            const pager = {
                pageSize : this.state.pager.pageSize,
                current : DEFAULT_PAGER.current
            }
            this.getPageData(condition, pager)
        })
    }

    onReset = () => {
        this.props.form.resetFields()
        this.handleSearch()
    }

    getAppId = ()=>{
        return new Promise((resolve, reject)=>{
            this.props.dispatch({
                type: 'gzh_fans/getAppId',
                payload: {},
                callback: ()=>{
                    const {app_id} = this.props.gzh_fans
                    if(app_id){
                        resolve(app_id)
                    }else{
                        reject()
                    }
                }
            })
        })
    }
    loadWechats = () => {
        this.props.dispatch({
            type: 'wechats/querySummary',
            payload: {
                department_id: this.props.departmentId || undefined ,
                user_id: this.props.userId,
                limit: 100,
            }
        })
    }

    changeWechat = (value)=>{
        this.props.form.setFieldsValue({
            belongs_wechat: value
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
                style: {
                    marginRight: '40px'
                }
            }
        }

        const columns = [{
            title: '头像',
            dataIndex: 'profile',
            key: 'profile',
            render: (value, item, index) => {
                return <div className={styles.profile}>{item.profile&&(<img src={getImageAbsoulteUrl(item.profile)} alt=''/>)}</div>
            }
        }, {
            title: '粉丝昵称',
            dataIndex: 'fans_nickname',
            key: 'fans_nickname',
        }, {
            title: '性别',
            dataIndex: 'gender',
            key: 'gender'
        }, {
            title: '地区',
            dataIndex: 'area',
            key: 'area'
        }, {
            title: '粉丝微信号',
            dataIndex: 'fans_wechat',
            key: 'fans_wechat'
        }, {
            title: '所属微信',
            dataIndex: 'belongs_wechat',
            key: 'belongs_wechat',
            render: (text, record) => {
                const { subWechats } = this.props.wechats
                let obj = Array.isArray(subWechats)&&subWechats.filter((item)=>{
                    return text === item.username
                })
                return Array.isArray(obj)&&obj.length>0 ? `${obj[0].nickname}【${obj[0].remark || obj[0].username}】` : text
            }
        }]

        const { getFieldDecorator } = this.props.form
        const {  fansData, current, pageSize, total } = this.props.gzh_fans
        const { subWechats } = this.props.wechats
        const content = <div>
            <p>统计公众号粉丝与微信号好友成功关联数据</p>
            <p>关联步骤：</p>
            <p>第一步：创建“关注有礼”活动；</p>
            <p>第二步：通过“牛客服”发送二维码，好友扫码并关注公众号后，牛客服绑定的订单数据将与公众号数据互通。</p>
        </div>
        const titleHelp = <Popover content={content} placement="bottomLeft" title="" trigger="hover" overlayStyle={{maxWidth: 300}}>
            <Icon className="hz-text-primary hz-icon-size-default hz-icon-popover" type='question-circle' />
        </Popover>
        return (
            <Page className={styles.formSearch}>
                <Page.ContentHeader
                    title='粉丝统计'
                    titleHelp={titleHelp}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E5%85%AC%E4%BC%97%E5%8F%B7/%E5%85%AC%E4%BC%97%E5%8F%B7.md"
                />
                <Page.ContentAdvSearch hasGutter={false} multiple={false}>
                    <Form layout="horizontal" className="hz-from-search" >
                        <Row>
                            <Col span={8}>
                                <Form.Item label="粉丝搜索：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('fans', {})(
                                            <Input placeholder="请输入" maxLength={30}/>
                                        )
                                    }
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="所属微信：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('belongs_wechat', {})(
                                            <Select placeholder='全部' >
                                                <Option key={9999} value='' >全部</Option>
                                                {
                                                    subWechats.map((item, index) => <Option key={index} value={item.username} >{`${item.nickname}【${item.remark || item.username}】`}</Option>)
                                                }
                                            </Select>
                                        )
                                    }
                                </Form.Item>
                            </Col>
                            {/* <Col span={8}>
                                <Form.Item label="关联状态：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('is_related', {})(
                                            <Select placeholder='全部' >
                                                <Option key={9999} value='' >全部</Option>
                                                {
                                                    related_status.map((item, index) => <Option key={index} value={item.value} >{item.text}</Option>)
                                                }
                                            </Select>
                                        )
                                    }
                                </Form.Item>
                            </Col> */}
                            <Col span={8}>
                                <Form.Item colon={false} style={{ marginBottom: 0 }} {...formItemLayout}>
                                    <Button onClick={e => { e.preventDefault(); this.handleSearch() }} style={{ marginRight: 16 }} className="hz-btn-width-default" type="primary" htmlType="submit">
                                        <Icon type="search" />
                                        搜索
                                    </Button>
                                    <Button onClick={e => { e.preventDefault(); this.onReset() }} className="hz-btn-width-default" >
                                        重置
                                    </Button>
                                </Form.Item>
                            </Col>

                        </Row>
                        {/* <Row>
                            <Col span={10}>
                                <Form.Item label=" " colon={false} style={{ marginBottom: 0 }} {...formItemLayout}>
                                    <Button onClick={e => { e.preventDefault(); this.handleSearch() }} style={{ marginRight: 16 }} className="hz-btn-width-default" type="primary" htmlType="submit">
                                        <Icon type="search" />
                                        搜索
                                    </Button>
                                    <Button onClick={e => { e.preventDefault(); this.onReset() }} className="hz-btn-width-default" >
                                        重置
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row> */}
                    </Form>
                </Page.ContentAdvSearch>

                <Page.ContentTable>
                    <Table
                        columns={columns}
                        dataSource={fansData}
                        size="middle"
                        rowKey={(record, index) => index}
                        pagination={false}
                        loading={this.state.loading}
                    />
                </Page.ContentTable>
                {fansData && fansData.length > 0 ?
                    <Pagination
                        className="ant-table-pagination"
                        current={current}
                        total={total}
                        showTotal={(total) => `共 ${total} 条`}
                        showQuickJumper={true}
                        showSizeChanger={true}
                        pageSize={pageSize}
                        pageSizeOptions={['10', '20', '50', '100']}
                        onShowSizeChange={this.handleListPageChangeSize}
                        onChange={this.handleListPageChange}
                    />
                    : ''}
            </Page>
        )
    }
}
