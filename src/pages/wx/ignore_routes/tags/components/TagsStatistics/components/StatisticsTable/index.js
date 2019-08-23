/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/11/23
 */

import React from 'react'
import {
    Table,
} from 'antd'
import {connect} from 'dva'
import styles from './index.less'
import config from 'wx/common/config'
import modalWarp from 'hoc/modalWarp'
import EllipsisPopover from 'components/EllipsisPopover'

const {pageSizeOptions} = config

@connect(({wx_tagsStatistics, loading}) => ({
    wx_tagsStatistics,
    detailLoading: loading.effects['wx_tagsStatistics/customersList'],
}))
@modalWarp({
    width: 1200,
    destroyOnClose: true,
    title: '客户列表',
    footer: null,
    maskClosable: true,
})
export default class StatisticsTable extends React.PureComponent {
    static defaultProps = {
        record: [],
    }

    constructor() {
        super()
        this.state = {}
    }

    componentDidMount() {
        const {record} = this.props
        const tags = [{value: record.name, relation: '='}]
        this.props.dispatch({
            type: 'wx_tagsStatistics/setStateByPath',
            payload: {
                path: 'customersParams.tags',
                value: tags,
            },
        })
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'wx_tagsStatistics/customersList',
            payload: {page: page},
        })
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'wx_tagsStatistics/setStateByPath',
            payload: {
                path: 'customersParams.limit',
                value: size,
            },
        })
        this.goPage(1)
    }

    render() {
        const {
            detailLoading,
            wx_tagsStatistics,
            record,
        } = this.props
        const {
            customersParams: params,
            customersList: list,
            customersTotal: total,
            customersCurrent: current,
        } = wx_tagsStatistics

        const columns = [
            {
                title: '客户姓名',
                dataIndex: 'name',
            },
            {
                title: '微信昵称',
                dataIndex: 'wechat.nickname',
            },
            {
                title: '微信号',
                dataIndex: 'wechat',
                key: 'user',
                render: (text, record) => {
                    return text.alias || text.username
                },
            },
            {
                title: '微信备注',
                dataIndex: 'wechat.remark_name',
            },
            {
                title: '所属部门',
                dataIndex: 'user.departments',
                render: (text, record) => {
                    let departments = text
                    let content = ''
                    if(departments && departments.length) {
                        content = departments.map((item) => {
                            return item.name
                        }).join('，')
                        return (
                            <EllipsisPopover
                                content={content}
                            />
                        )
                    }
                    return ''
                },
            },
            {
                title: '所属员工',
                dataIndex: 'user.nickname',
            },
            {
                title: '所属微信',
                dataIndex: 'service_wechat.nickname',
            },
        ]

        return (
            <div className={styles.statisticsTable}>
                <div>
                    <span className={styles.label}>筛选标签：</span>{record.name}
                </div>
                <div className={styles.tipBar}>
                    客户数：{total}
                </div>
                <Table
                    columns={columns}
                    dataSource={list}
                    size="middle"
                    loading={detailLoading}
                    rowKey={(record, index) => index}
                    pagination={
                        list.length ? {
                            size: 'middle',
                            total: total,
                            current: current,
                            showQuickJumper: true,
                            pageSizeOptions: pageSizeOptions,
                            showTotal: total => `共${total}条`,
                            pageSize: params.limit,
                            showSizeChanger: true,
                            onShowSizeChange: this.handleChangeSize,
                            onChange: this.goPage,
                        } : false
                    }
                />
            </div>
        )
    }
}
