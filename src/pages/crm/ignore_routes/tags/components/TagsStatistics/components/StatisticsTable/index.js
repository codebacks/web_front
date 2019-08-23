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
import config from 'crm/common/config'
import modalWarp from 'hoc/modalWarp'
import EllipsisPopover from 'components/EllipsisPopover'

const {pageSizeOptions} = config

@connect(({crm_tagsStatistics, loading}) => ({
    crm_tagsStatistics,
    detailLoading: loading.effects['crm_tagsStatistics/customersList'],
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
            type: 'crm_tagsStatistics/setStateByPath',
            payload: {
                path: 'customersParams.tags',
                value: tags,
            },
        })
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'crm_tagsStatistics/customersList',
            payload: {page: page},
        })
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'crm_tagsStatistics/setStateByPath',
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
            crm_tagsStatistics,
            record,
        } = this.props
        const {
            customersParams: params,
            customersList: list,
            customersTotal: total,
            customersCurrent: current,
        } = crm_tagsStatistics

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
                dataIndex: 'wechat.username',
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
