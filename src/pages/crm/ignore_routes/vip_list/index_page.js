import React, { Fragment } from 'react'
import { connect } from 'dva'
import { Row, Button, Icon, Input, Table,Tabs, Pagination, Col, Form, Checkbox, Select } from 'antd'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.less'
import {jine} from '../../../../utils/display'
import OrderList from './OrderList'
const Option = Select.Option
const TabPane = Tabs.TabPane;
const DEFAULT_CONDITION = {
    user_id: '',
    level: '',
    nick_name: '',
    type: '1',
}

@connect(({ base, vip_data }) => ({
    base,
    vip_data,
}))
@Form.create()
@documentTitleDecorator({
    title:'会员列表'
})
export default class extends Page.ListPureComponent {
    state = {
        visible: false,
        loading: false,
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER }
    }
    componentDidMount () { 
        super.componentDidMount()
        this.getInitData()
    }
    getInitData = () => { 
        this.setState({
            loading: true,
        })
        this.props.dispatch({
            type: 'vip_data/vipRankList',
            payload: {},
            callback: ()=>{
                this.setState({
                    loading: false,
                })
            }
        })
        this.props.dispatch({
            type: 'vip_data/getUserList',
            payload: {
                offset: 0,
                limit: 999,
            },
            callback: ()=>{}
        })
    }
    initPage = (isSetHistory = false) => {
        let condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        const { user_id, level, nick_name, type } = condition
        this.getPageData(condition, pager, isSetHistory,()=>{
            this.setState({
                condition: condition
            },()=>{
                if(type === '1'){
                    this.props.form.setFieldsValue({
                        'user_id': user_id&&Number(user_id) || '',
                    }) 
                }else{
                    this.props.form.setFieldsValue({
                        'user_id': user_id&&Number(user_id) || '',
                        'nick_name': nick_name,
                        'level': level&&Number(level) || '',
                    }) 
                }
            })
        })
    }
    getPageData = (condition, pager, isSetHistory = true,callback) => {
        if( isSetHistory ){
            this.history(condition, pager)
        }
        this.setState({
            condition: condition,
            pager: pager,
            loading: true
        })
        if(condition.type === '1'){
            this.props.dispatch({
                type: 'vip_data/vipListByUser',
                payload: {
                    user_id: condition.user_id || "",
                    offset: (pager.current - 1) * pager.pageSize,
                    limit: pager.pageSize,
                },
                callback: (data) => {
                    this.setState({
                        loading: false
                    })
                    callback && callback(data)
                }
            })
        }else{
            this.props.dispatch({
                type: 'vip_data/vipList',
                payload: {
                    user_id: condition.user_id || "",
                    level: condition.level || "", 
                    nick_name: condition.nick_name || "", 
                    offset: (pager.current - 1) * pager.pageSize,
                    limit: pager.pageSize,
                },
                callback: (data) => {
                    this.setState({
                        loading: false
                    })
                    callback && callback(data)
                }
            })
        }
    }
    searchData = () => {
        const { form } = this.props
        form.validateFields((error, value) => {
            const {condition} = this.state
            let postData = {
                user_id: value.user_id
            }
            if(condition.type !== '1'){
                postData.nick_name = value.nick_name
                postData.level = value.level
            }
            const conditions = {
                ...this.state.condition,
                ...postData
            }
            const pager = {
                pageSize : this.state.pager.pageSize,
                current : DEFAULT_PAGER.current
            }
            this.getPageData(conditions, pager)
        })
    }
    searchFormSubmitHandler = (e) => {
        e.preventDefault()
        this.searchData()
    }
    resetSearchHandler = () => {
        this.props.form.resetFields()
        this.searchData()
    }
    handleTypeChange = (type)=>{
        this.props.form.resetFields()
        let condition = {
            ...DEFAULT_CONDITION,
            type: type
        }
        const pager = {
            pageSize : DEFAULT_PAGER.pageSize,
            current : DEFAULT_PAGER.current
        }
        this.setState({
            condition: condition,
            pager: pager,
        },()=>{
            this.getPageData(condition, pager)
        })
    }
    showDetail = (item)=>{
        this.setState({
            id: item.id,
            visible: true,
        })
    }
    onParentClose = ()=>{
        this.setState({
            id: '',
            visible: false
        }) 
    }
    getCount = (level)=>{
        const { vipRankList} = this.props.vip_data
        let obj = vipRankList.find(item => item.level === level)
        return obj['count']&&jine(obj['count'], '0,00') || 0
    }
    renderTitle = (arr)=>{
        let newArr = []
        arr.forEach((vvv, index)=>{
            newArr.push({
                title: `${vvv.name}数`,
                dataIndex: `num${index}`,
                className: 'hz-table-column-width-100',
                render: (value,item,index) => {
                    let num = item.level_count_arr&&item.level_count_arr[vvv.level] || 0
                    return jine(num, '0,00')
                }
            }) 
        })
        return newArr
    }
    render () {
        const { vipRankList, vipList, total, userList } = this.props.vip_data
        const {condition, pager} = this.state
        const { getFieldDecorator } = this.props.form
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
        //定义表格顶部字段
        const columns = (condition ? condition.type : DEFAULT_CONDITION.type) === '1'  ? [
            {
                title: '员工',
                dataIndex: 'username',
                className: 'hz-table-column-width-100'
            },
            {
                title: '绑定微信数',
                dataIndex: 'bound_wechat_count',
                className: 'hz-table-column-width-100',
                render: (value,item,index) => {
                    return value&&jine(value, '0,00')
                }
            },
            ...this.renderTitle(vipRankList)
        ]:[
            {
                title: '微信号',
                dataIndex: 'wx_id',
                className: 'hz-table-column-width-100'
            },
            {
                title: '微信昵称',
                dataIndex: 'nick_name',
                className: 'hz-table-column-width-100'
            },
            {
                title: '会员等级',
                dataIndex: 'name',
                className: 'hz-table-column-width-100'
            },
            {
                title: '所属员工',
                dataIndex: 'username',
                className: 'hz-table-column-width-100'
            },
            {
                title: '更新时间',
                dataIndex: 'last_updated_at',
                className: 'hz-table-column-width-100'
            },
            {
                title: '累计成交笔数',
                dataIndex: 'order_count',
                className: 'hz-table-column-width-120',
                align: 'center',
                render: (value,item,index) => {
                    return <a onClick={()=>this.showDetail(item)}>{value}</a>
                }
            },
            {
                title: '累计成交金额(元)',
                dataIndex: 'amount',
                width: '150px',
                render: (value,item,index) => {
                    return <div style={{marginRight: 8, textAlign: 'right'}}>{jine(value, '', "Fen")}</div>
                }  
            },
            {
                title: '最近订单时间',
                dataIndex: 'last_order_at',
                className: 'hz-table-column-width-120'
            },
        ]
        return (
            <Page>
                <Page.ContentHeader
                    title='会员列表'
                    helpUrl='http://newhelp.51zan.cn/manual/content/%E5%AE%A2%E6%88%B7%E7%AE%A1%E7%90%86/%E4%BC%9A%E5%91%98%E8%AE%BE%E7%BD%AE.md'
                />
                {
                    vipRankList && vipRankList.length > 0 ? (
                        <div>
                            <div className={styles.statistic}>
                                {
                                   vipRankList.map((item)=>{
                                       return (
                                        <div className={styles.itemList} key={item.level}>
                                            <dl>
                                                <dt>{item.name}</dt>
                                                <dd>{this.getCount(item.level)}</dd>
                                            </dl>
                                        </div>
                                       )
                                   }) 
                                }
                            </div>
                        </div>
                    ):(
                            <div className={styles.unOpen}>您的会员等级都未开启，请去开启会员等级！</div>
                    )
                }
                <Tabs defaultActiveKey="1" onChange={this.handleTypeChange} activeKey={(condition ? condition.type : DEFAULT_CONDITION.type)}>
                    <TabPane tab="按员工查看" key="1"></TabPane>
                    <TabPane tab="按会员查看" key="2"></TabPane>
                </Tabs>
                {
                    vipRankList && vipRankList.length > 0 ? (
                        <div>
                            <Page.ContentAdvSearch>
                                <Form layout="horizontal" className="hz-from-search" onSubmit={this.searchFormSubmitHandler}>
                                    {
                                        (condition ? condition.type : DEFAULT_CONDITION.type)  === '1' ? (
                                        <Fragment>
                                            <Row>
                                                <Col span={8}>
                                                    <Form.Item label="所属员工" {...formItemLayout}>
                                                        {getFieldDecorator("user_id",{})(
                                                            <Select
                                                                getPopupContainer={triggerNode=>triggerNode.parentNode}
                                                                placeholder='不限'
                                                                showSearch
                                                                allowClear
                                                                optionFilterProp="children"
                                                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                            >
                                                                <Option value="">不限</Option>
                                                                {
                                                                    userList.length>0&&userList.map(item=>{
                                                                        return <Option value={item.id} key={item.id}>{`${item.nickname}【${item.username}】`}</Option>
                                                                    })
                                                                } 
                                                            </Select>
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col span={8}>
                                                    <Form.Item>
                                                        <Button className="hz-btn-width-default" type="primary" htmlType="submit">
                                                            <Icon type="search"/>
                                                            搜索
                                                        </Button>
                                                        <Button className="hz-btn-width-default hz-margin-base-left" onClick={this.resetSearchHandler}>
                                                            重置
                                                        </Button>
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Fragment>
                                        ): (
                                        <Fragment>
                                            <Row>
                                                <Col span={8}>
                                                    <Form.Item label="所属员工" {...formItemLayout}>
                                                        {getFieldDecorator("user_id",{})(
                                                            <Select
                                                                getPopupContainer={triggerNode=>triggerNode.parentNode}
                                                                placeholder='不限'
                                                                showSearch
                                                                allowClear
                                                                optionFilterProp="children"
                                                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                            >
                                                                <Option value="">不限</Option>
                                                                {
                                                                    userList.length>0&&userList.map(item=>{
                                                                        return <Option value={item.id} key={item.id}>{`${item.nickname}【${item.username}】`}</Option>
                                                                    })
                                                                }
                                                            </Select>
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col span={8}>
                                                    <Form.Item label="会员等级" {...formItemLayout}>
                                                        {getFieldDecorator("level",{})(
                                                            <Select
                                                                getPopupContainer={triggerNode=>triggerNode.parentNode}
                                                                placeholder='不限'
                                                            >
                                                                <Option value="">不限</Option>
                                                                {
                                                                    vipRankList.map(item=>{
                                                                        return <Option value={item.level} key={item.id}>{item.name}</Option>
                                                                    })
                                                                }
                                                            </Select>
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col span={8}>
                                                    <Form.Item label="微信昵称" {...formItemLayout}>
                                                        {getFieldDecorator("nick_name",{})(
                                                            <Input placeholder='请输入微信昵称' />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>    
                                            <Row>
                                                <Col span={8}>
                                                    <Col span={3} style={{width: '70px'}}></Col>
                                                    <Col span={16}>
                                                        <Form.Item>
                                                            <Button className="hz-btn-width-default" type="primary" htmlType="submit">
                                                                <Icon type="search"/>
                                                                搜索
                                                            </Button>
                                                            <Button className="hz-btn-width-default hz-margin-base-left" onClick={this.resetSearchHandler}>
                                                                重置
                                                            </Button>
                                                        </Form.Item>
                                                    </Col>
                                                </Col>
                                            </Row>
                                        </Fragment>
                                        )
                                    }
                                </Form>
                            </Page.ContentAdvSearch> 
                        </div>
                    ): ''
                }

                <div>
                    <Table
                        columns={columns}
                        dataSource={vipList}
                        pagination={false}
                        rowKey='id'
                        loading={this.state.loading}
                    />
                    {
                        vipList && vipList.length > 0&&(
                            <Pagination
                                className="ant-table-pagination"
                                current={pager.current}
                                total={total}
                                showTotal={(total) => `共 ${total} 条`} 
                                showQuickJumper={true} 
                                showSizeChanger={true}  
                                pageSize={pager.pageSize} 
                                pageSizeOptions= {['10', '20', '50', '100']}
                                onShowSizeChange={this.handleListPageChangeSize}
                                onChange={this.handleListPageChange} 
                            ></Pagination>
                        )
                    }
                </div>
                <OrderList 
                    visible={this.state.visible}
                    id={this.state.id}
                    onParentClose={this.onParentClose}
                    key={this.state.visible}
                />
            </Page>
        )
    }
}
