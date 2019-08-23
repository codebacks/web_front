import React from 'react'
import {Button, Table} from 'antd'
import styles from './index.less'
import {hot} from 'react-hot-loader'
import {connect} from 'dva/index'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader'
import {router} from 'umi'
import config from "wx/common/config"
import moment from 'moment'
import _ from "lodash"

const {pageSizeOptions, DateTimeFormat} = config

@hot(module)
@connect(({base, wx_wxAuthorization, oem, loading}) => ({
    base,
    oem,
    wx_wxAuthorization,
    tableLoading: loading.effects['wx_wxAuthorization/details'],
}))
@documentTitleDecorator({
    overrideTitle: '授权数',
})
export default class Index extends React.Component {
    constructor(props) {
        super(props)
        if (_.get(props, 'base.initData.company.product_version.id') !== 10) {
            router.replace('/wx/wechats')
        }
    }

    componentDidMount() {
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'wx_wxAuthorization/details',
            payload: {page: page},
        })
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'wx_wxAuthorization/setStateByPath',
            payload: {
                path: 'params.limit',
                value: size,
            },
        })
        this.goPage(1)
    }

    goNewPage = () => {
        router.push('/setting/version_information/buyversion?first_buy=0&type=10')
    }

    setTime = (time) => {
        if (time) {
            return moment(time * 1000).format(DateTimeFormat)
        }
    }

    render() {
        const {tableLoading, wx_wxAuthorization} = this.props

        const {list, current, total, params: {limit} = {}} = wx_wxAuthorization

        const columns = [
            {
                title: '编号',
                dataIndex: 'id',
            },
            {
                title: '购买时间',
                dataIndex: 'pay_time',
                render: (text, record, index) => {
                    return this.setTime(text)
                },
            },
            {
                title: '购买时长(天)',
                dataIndex: 'days',
            },
            {
                title: '开始时间',
                dataIndex: 'begin_time',
                render: (text, record, index) => {
                    return this.setTime(text)
                },
            },
            {
                title: '到期时间',
                dataIndex: 'end_time',
                render: (text, record, index) => {
                    return this.setTime(text)
                },
            },
            {
                title: '状态',
                dataIndex: 'status',
                render: (text = {}, record, index) => {
                    return text.name
                },
            },
            // {
            //     title: '操作',
            //     dataIndex: 'operation',
            //     render: (text, record, index) => {
            //         return (
            //             <div className={styles.operator}>
            //                 <span
            //                     className={styles.operatorBtn}
            //                 >
            //                     续费
            //                 </span>
            //             </div>
            //         )
            //     },
            // },
        ]

        return (
            <div className={styles.main}>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '微信号管理',
                                path: '/wx/wechats',
                            },
                            {
                                name: '授权数',
                            },
                        ]
                    }
                />
                <div className={styles.content}>
                    <div className={styles.option}>
                        <Button type="primary" onClick={this.goNewPage}>
                            购买数量
                        </Button>
                    </div>
                    <div className={styles.table}>
                        <Table
                            columns={columns}
                            dataSource={list}
                            rowKey={(record) => record.id}
                            loading={tableLoading}
                            pagination={
                                list.length
                                    ? {
                                        total,
                                        current,
                                        showQuickJumper: true,
                                        showTotal: (total) => `共 ${total} 条`,
                                        pageSize: limit,
                                        showSizeChanger: true,
                                        onChange: this.goPage,
                                        onShowSizeChange: this.handleChangeSize,
                                        pageSizeOptions,
                                    }
                                    : false
                            }
                        />
                    </div>
                </div>
            </div>
        )
    }
}
