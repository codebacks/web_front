import { PureComponent } from 'react'
import Page from '@/components/business/Page'
import { Button, Tabs, Table, Divider, Badge, Pagination, Modal, message, Icon } from 'antd'
import { getImageAbsoulteUrl } from '../../../../utils/resource'
import DocumentTitle from 'react-document-title'
import {connect} from 'dva'
import styles from './index.less'
import moment from 'moment'
import router from 'umi/router'
import PlusSvg from '../../../../assets/font_icons/plus.svg'

const TabPane = Tabs.TabPane
const confirm = Modal.confirm

const PanesList = [
    {
        tab: '全部',
        key: 0
    },
    {
        tab: '未开始',
        key: 1
    },
    {
        tab: '进行中',
        key: 2
    },
    {
        tab: '已结束',
        key: 3
    }
]

@connect(({base, mall_group}) => ({
    base, mall_group
}))
export default class extends PureComponent {
    state = {
        loading: true,
        tableData: []
    }

    componentDidMount () {
        const { current, tabValue, pageSize } = this.props.mall_group
        this.props.dispatch({
            type: 'mall_group/getGoodsList',
            payload: {
                order_by: 'end_at asc',
                page: current,
                per_page: pageSize,
                status: tabValue
            },
            callback: (data) => {
                this.setState({
                    loading: false,
                    tableData: data
                })
            }
        })
    }

    /* 事件处理 */
    onNewGroup = () => {
        router.push(`/mall/group/newGroup`)
    }

    onChangeTabs = (value) => {
        const { pageSize } = this.props.mall_group
        this.setState({
            loading: true,
        })
        this.props.dispatch({
            type: 'mall_group/getGoodsList',
            payload: {
                status: value,
                page: 0,
                per_page: pageSize,
                order_by: 'end_at asc'
            },
            callback: (data) => {
                this.setState({
                    loading: false,
                    tableData: data
                })
            }
        })
    }

    onEdit = (value) => {
        router.push(`/mall/group/newGroup?id=${value}`)
    }

    onClose = (value, index) => {
        const { pageSize, tabValue } = this.props.mall_group
        let that = this
        confirm({
            title: '确认关闭该条活动？',
            onOk() {
                that.setState({
                    loading: true
                })
                that.props.dispatch({
                    type: 'mall_group/closeGroup',
                    payload: {
                        id: value
                    },
                    callback: (data) => {
                        if (data.success) {
                            message.success('关闭成功')
                            that.props.dispatch({
                                type: 'mall_group/getGoodsList',
                                payload: {
                                    status: tabValue,
                                    page: 0,
                                    per_page: pageSize,
                                    order_by: 'end_at asc'
                                },
                                callback: (data) => {
                                    that.setState({
                                        loading: false,
                                        tableData: data
                                    })
                                }
                            })
                        }
                    }
                })
            },
        })
    }

    onDelete = (value) => {
        const { current, pageSize, tabValue } = this.props.mall_group
        let that = this
        confirm({
            title: '确认删除该条活动？',
            onOk() {
                that.setState({
                    loading: true
                })
                that.props.dispatch({
                    type: 'mall_group/deleteGroup',
                    payload: {
                        id: value
                    },
                    callback: (data, status) => {
                        if (status === 200) {
                            message.success('删除成功')
                            that.props.dispatch({
                                type: 'mall_group/getGoodsList',
                                payload: {
                                    order_by: 'end_at asc',
                                    status: tabValue,
                                    page: current,
                                    per_page: pageSize
                                },
                                callback: (data) => {
                                    that.setState({
                                        loading: false,
                                        tableData: data
                                    })
                                }
                            })
                        }
                    }
                })
            },
        })
    }

    handleChangeSize = (value, pageSize) => {
        const { tabValue } = this.props.mall_group        
        this.setState({
            loading: true
        })
        this.props.dispatch({
            type: 'mall_group/getGoodsList',
            payload: {
                page: value - 1,
                per_page: pageSize,
                status: tabValue,
                order_by: 'end_at asc'
            },
            callback: (data) => {
                this.setState({
                    tableData: data,
                    loading: false
                })
            }
        })
    }

    goToPage = (page) => {
        const { tabValue, pageSize } = this.props.mall_group
        this.setState({
            loading: true
        })
        this.props.dispatch({
            type: 'mall_group/getGoodsList',
            payload: {
                page: page - 1,
                per_page: pageSize,
                status: tabValue,
                order_by: 'end_at asc'
            },
            callback: (data) => {
                this.setState({
                    tableData: data,
                    loading: false
                })
            }
        })
    }

    render() {
        const columns = [
            {
                title: '商品',
                dataIndex: 'goods',
                render: ({cover_url, name}) => {
                    return (
                        <div  className={styles.goods}>
                            <div className={styles.goodsInfoImage}>
                                <img src={ getImageAbsoulteUrl(cover_url, { thumbnail: { width: 60, height: 60 } })} alt="" />
                            </div>
                            <span style={{marginLeft: '10px'}}>{name}</span>
                        </div>
                    )
                }
            },
            {
                title: '开团人数',
                dataIndex: 'min_join_count',
                align: 'center'
            },
            {
                title: '开始时间',
                dataIndex: 'begin_at'
            },
            {
                title: '结束时间',
                dataIndex: 'end_at'
            },
            {
                title: '创建时间',
                dataIndex: 'created_at'
            },
            {
                title: '状态',
                dataIndex: 'status',
                render: (value, {begin_at, end_at}) => {
                    let current = moment().format('YYYY-MM-DD HH:mm:ss')
                    if (begin_at > current && value === 1) {
                        return <Badge status="success" text="未开始" className={styles.nowrap} />
                    } else if (begin_at < current && end_at > current  && value < 3) {
                        return <Badge status="processing" text="进行中" className={styles.nowrap} />
                    } else {
                        return <Badge status="default" text="已结束" className={styles.nowrap} />
                    }
                }
            },
            {
                title: '操作',
                dataIndex: 'action',
                render: (value,{begin_at, end_at, id, status}, index) => {
                    let current = moment().format('YYYY-MM-DD HH:mm:ss')
                    if (begin_at > current && status === 1) {
                        return (
                            <div className={styles.nowrap}>
                                <a href='javascript:;' onClick={() => this.onEdit(id)}>编辑</a>
                                <Divider type="vertical" />
                                <a href='javascript:;' onClick={() => this.onDelete(id)}>删除</a>
                            </div>
                        )
                    } else if (begin_at < current && end_at > current && status < 3) {
                        return (
                            <div className={styles.nowrap}>
                                <a href='javascript:;' onClick={() => this.onClose(id, index)}>关闭</a>
                            </div>
                        )
                    } else {
                        return (
                            <div className={styles.nowrap}>
                                <a href='javascript:;' onClick={() => this.onEdit(id)}>编辑</a>
                                <Divider type="vertical" />
                                <a href='javascript:;' onClick={() => this.onDelete(id)}>删除</a>
                            </div>
                        )
                    }
                }
            },
        ]

        const { loading, tableData} = this.state
        const { totalCount, tabValue, pageSize, current } = this.props.mall_group

        return (
            <DocumentTitle title='拼团'>
                <Page>
                    <Page.ContentHeader
                        title='拼团'
                        action={(
                            <div>
                                <Button type='primary' onClick={this.onNewGroup}>
                                    <Icon component={PlusSvg} style={{fontSize: '16px'}} />
                                    创建拼团
                                </Button>
                            </div>
                        )}
                        hasGutter={false}
                        helpUrl="http://newhelp.51zan.cn/manual/content/%E8%99%8E%E8%B5%9E%E5%B0%8F%E5%BA%97/%E6%8B%BC%E5%9B%A2.md"
                    />
                    <Tabs activeKey={tabValue.toString()} onChange={this.onChangeTabs}>
                        {
                            PanesList.map(item => 
                                <TabPane tab={item.tab} key={item.key}>
                                    <Table
                                        key={item.key}
                                        columns={columns}
                                        dataSource={tableData}
                                        pagination={false}
                                        loading={loading}
                                        rowKey='id'
                                    />
                                </TabPane>)
                        }
                    </Tabs>
                    {parseFloat(totalCount) ?
                        <Pagination
                            className="ant-table-pagination"
                            current={current + 1}
                            total={parseFloat(totalCount)}
                            showTotal={(total) => `共 ${total} 条`} 
                            showQuickJumper={true} 
                            showSizeChanger={true}  
                            pageSize={pageSize} 
                            pageSizeOptions= {['10', '20', '50', '100']}
                            onShowSizeChange={this.handleChangeSize}
                            onChange={this.goToPage} />
                        : ''
                    }
                </Page>
            </DocumentTitle>
        )
    }
}