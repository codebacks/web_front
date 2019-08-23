/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/1/16
 */

import React from 'react'
import {
    Table,
} from 'antd'
import {connect} from "dva/index"
import config from 'community/common/config'
import styles from './index.less'
import EllipsisPopover from "components/EllipsisPopover"
import PropTypes from "prop-types"

const {pageSizeOptions} = config

@connect(({crm_customerGroup, loading}) => ({
    crm_customerGroup,
    detailLoading: loading.effects['crm_customerGroup/customersDetails'],
}))
export default class Index extends React.PureComponent {
    static propTypes = {
        id: PropTypes.string,
        title: PropTypes.string,
        callType: PropTypes.number.isRequired,
        previewModePayload: PropTypes.object,
    }

    static defaultProps = {
        title: '',
    }

    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.goPage(1)
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'crm_customerGroup/resetDetailParams',
        })
    }

    getParams = () => {
        const {
            id,
            callType,
            previewModePayload,
        } = this.props
        if(callType === 1) {
            return {
                id,
            }
        }else if(callType === 2) {
            return {
                params: {...previewModePayload.params},
            }
        }
    }

    handleChangeSize = (current, size) => {
        const {callType} = this.props

        this.props.dispatch({
            type: 'crm_customerGroup/customersDetails',
            payload: {
                params: {
                    ...this.getParams(),
                    page: 1,
                    limit: size,
                },
                callType,
            },
        })
    }

    goPage = (page) => {
        const {callType} = this.props

        this.props.dispatch({
            type: 'crm_customerGroup/customersDetails',
            payload: {
                params: {
                    ...this.getParams(),
                    page: page,
                },
                callType,
            },
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.goPage(1)
    }

    render() {
        const columns = [
            {
                title: '微信昵称',
                dataIndex: 'customer.wechat_nickname',
            },
            {
                title: '微信号',
                dataIndex: 'customer.wechat_id',
            },
            {
                title: '微信备注',
                dataIndex: 'customer.wechat_remark',
            },
            {
                title: '客户姓名',
                dataIndex: 'customer.name',
            },
            {
                title: '所属部门',
                dataIndex: 'user.departments',
                render: (text, record, index) => {
                    let departments = text
                    let content = ''
                    if(departments && departments.length) {
                        content = departments.map((item) => {
                            return item.name
                        }).join('，')

                        return (
                            <EllipsisPopover
                                lines={1}
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
                dataIndex: 'from.remark',
                render: (text, record, index) => {
                    return text ? text : record.from.nickname
                },
            },
        ]

        const {
            detailLoading,
            title,
        } = this.props
        const {
            detailParams,
            detailList,
            detailTotal,
            detailCurrent,
        } = this.props.crm_customerGroup

        return (
            <div className={styles.content}>
                <div className={styles.titleBar}>
                    <span className={styles.titleLab}>筛选结果：</span><span className={styles.name}>{title}</span>
                </div>
                <div className={styles.filterBar}>
                    满足条件过滤共 <span className={styles.filter}>{detailTotal}</span> 个客户
                </div>
                <Table
                    columns={columns}
                    dataSource={detailList}
                    rowKey={(record, index) => index}
                    pagination={
                        detailList.length ? {
                            total: detailTotal,
                            current: detailCurrent,
                            showQuickJumper: true,
                            pageSizeOptions: pageSizeOptions,
                            showTotal: total => `共${total}条`,
                            pageSize: detailParams.limit,
                            showSizeChanger: true,
                            onShowSizeChange: this.handleChangeSize,
                            onChange: this.goPage,
                        } : false
                    }
                    loading={detailLoading}
                />
            </div>
        )
    }
}
