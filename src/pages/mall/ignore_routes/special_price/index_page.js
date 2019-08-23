import { PureComponent } from 'react'
import {connect} from 'dva'
import router from 'umi/router'
import Page from '@/components/business/Page'
import { Button, Tabs, Table, Divider, Badge, Icon, Modal, message } from 'antd'
import { getImageAbsoulteUrl } from '../../../../utils/resource'
import DocumentTitle from 'react-document-title'
import styles from './index.less'
import moment from 'moment'
import numeral from 'numeral'
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

@connect(({mall_special_price, base}) =>({
    mall_special_price, base
}))
export default class extends PureComponent {
    state = {
        loading: true,
        tableData: []
    }
    componentDidMount () {
        const { tabValue } = this.props.mall_special_price
        this.props.dispatch({
            type: 'mall_special_price/getGoodsList',
            payload: {
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

    /* 页面方法 */
    showSpecs (value) {
        let specificList = ''
        if (value.property_a) {
            specificList += value.property_a
            if (value.property_b) {
                specificList += '；' + value.property_b
            }
            if (value.property_c) {
                specificList += '；' + value.property_c
            }
        }
        return specificList
    }

    /* 事件处理 */
    onAddActivity = () => {
        router.push(`/mall/special_price/newSpecialPrice`)
    }

    onChangeTabs = (value) => {
        this.setState({
            loading: true
        })
        this.props.dispatch({
            type: 'mall_special_price/getGoodsList',
            payload: {
                status: value
            },
            callback: (data) => {
                this.setState({
                    loading: false,
                    tableData: data
                })
            }
        })
    }

    onEdit = (id) => {
        router.push(`/mall/special_price/newSpecialPrice?id=${id}`)
    }

    onClose = (id, index) => {
        const { tabValue } = this.props.mall_special_price
        let that = this
        confirm({
            title: '确认关闭该条活动？',
            onOk() {
                that.setState({
                    loading: true
                })
                that.props.dispatch({
                    type: 'mall_special_price/saveEditGood',
                    payload: {
                        id: id,
                        status: 3
                    },
                    callback: (data) => {
                        if (data.success) {
                            message.success('关闭成功')
                            that.props.dispatch({
                                type: 'mall_special_price/getGoodsList',
                                payload: {
                                    status: tabValue
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

    onDelete = (value, index) => {
        let that = this , { tableData } = this.state
        confirm({
            title: '确认删除该条活动？',
            onOk() {
                that.props.dispatch({
                    type: 'mall_special_price/deleteSpecial',
                    payload: {
                        id: value
                    },
                    callback: (data, status) => {
                        if (status === 200) {
                            message.success('删除成功')
                            let tempArr = JSON.parse(JSON.stringify(tableData))
                            tempArr.splice(index, 1)
                            that.setState({
                                tableData: tempArr
                            })
                        }
                    }
                })
            },
        })
    }

    onChangeSort = (id, index, value) => {
        const { tableData } = this.state
        let nextInd = value === 1 ? index - 1 : index + 1
        if (nextInd > -1 && nextInd < tableData.length) {
            this.setState({
                loading: true
            })
            this.props.dispatch({
                type: 'mall_special_price/modifyRank',
                payload: {
                    from_id: id,
                    to_id: tableData[nextInd].id
                },
                callback: (data, status) => {
                    if (status === 200) {
                        let tempArr = JSON.parse(JSON.stringify(tableData))
                        let spliceItem = tempArr.splice(index, 1)
                        tempArr.splice(nextInd, 0, spliceItem[0])
                        this.setState({
                            tableData: tempArr,
                            loading: false
                        })
                    }
                }
            })
        }
    }

    render () {
        const { tableData } = this.state
        const { tabValue } = this.props.mall_special_price
        const columns = [
            {
                title: '排序',
                dataIndex: 'rank',
                width: '80px',
                render: (value, {id}, index) => {
                    return <div className={styles.rank}>
                        <div>{index + 1}</div>
                        <div className={styles.rankIcons}>
                            <Icon
                                type="caret-up"
                                style={index === 0 ? {fontSize: '12px', color: '#999'} : {fontSize: '12px', color: '#333', cursor: 'pointer'}}
                                theme="outlined"
                                onClick={() => this.onChangeSort(id, index, 1)}
                            />
                            <Icon
                                type="caret-down"
                                style={index === tableData.length - 1 ? {fontSize: '12px',color: '#999'} : {fontSize: '12px', color: '#333', cursor: 'pointer'}}
                                theme="outlined"
                                onClick={() => this.onChangeSort(id, index, 2)}
                            />
                        </div>
                    </div>
                }
            },
            {
                title: '商品',
                dataIndex: 'goods',
                render: ({name}, {price,goods_sku}) => {
                    let string = this.showSpecs(goods_sku)
                    return (
                        <div  className={styles.goods}>
                            <div className={styles.goodsInfoImage}>
                                <img src={ getImageAbsoulteUrl(goods_sku.cover_url, { thumbnail: { width: 60, height: 60 } })} alt="" />
                            </div>
                            <div className={styles.description}>
                                <div>{name}</div>
                                <div style={{marginTop: '5px'}}>
                                    <span style={{color: '#FA8910'}}>￥{numeral(price / 100).format('0,00.00')}</span>
                                    {string !== '' ?
                                        <span className={styles.specs}>{string}</span>
                                        : ''
                                    }
                                </div>
                            </div>
                        </div>
                    )
                }
            },
            {
                title: '开始时间',
                dataIndex: 'begin_at',
            },
            {
                title: '结束时间',
                dataIndex: 'end_at',
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
                                <a href='javascript:;' onClick={() => this.onDelete(id, index)}>删除</a>
                            </div>
                        )
                    } else if (begin_at < current && end_at > current  && status < 3) {
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
                                <a href='javascript:;' onClick={() => this.onDelete(id, index)}>删除</a>
                            </div>
                        )
                    }
                }
            },
        ]

        return (
            <DocumentTitle title='特价'>
                <Page>
                    <Page.ContentHeader
                        title='特价'
                        action={(
                            <div>
                                <Button type='primary' onClick={this.onAddActivity}>
                                    <Icon component={PlusSvg} style={{fontSize: '16px'}} />                                
                                    创建特价
                                </Button>
                            </div>
                        )}
                        hasGutter={false}
                        helpUrl="http://newhelp.51zan.cn/manual/content/%E8%99%8E%E8%B5%9E%E5%B0%8F%E5%BA%97/%E7%89%B9%E4%BB%B7.md"
                    />
                    <Tabs activeKey={tabValue.toString()} onChange={this.onChangeTabs}>
                        {
                            PanesList.map(item => 
                                <TabPane tab={item.tab} key={item.key}>
                                    <Table
                                        key={item.key}
                                        columns={columns}
                                        dataSource={tableData}
                                        loading={this.state.loading}
                                        pagination={false}
                                        rowKey='id'
                                    />
                                </TabPane>)
                        }
                    </Tabs>
                </Page>
            </DocumentTitle>
        )
    }
}