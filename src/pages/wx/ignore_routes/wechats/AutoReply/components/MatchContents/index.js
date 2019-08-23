/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React, {PureComponent} from 'react'
import {
    Table,
} from 'antd'
import {connect} from "dva/index"
import modalWarp from 'hoc/modalWarp'
import styles from './index.less'
import {hot} from "react-hot-loader"

const matchType = {
    '0': '完全匹配',
    '1': '包含匹配',
}

@hot(module)
@connect(({wx_weChatsAutoReply, loading}) => ({
    wx_weChatsAutoReply,
    getMatchContentsLoading: loading.effects['wx_weChatsAutoReply/getMatchContents'],
}))
@modalWarp()
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {record} = this.props
        this.props.dispatch({
            type: 'wx_weChatsAutoReply/getMatchContents',
            payload: record.id,
        })
    }

    setStateByPath = (path, value) => {
        this.props.dispatch({
            type: 'wx_weChatsAutoReply/setStateByPath',
            payload: {
                path,
                value,
            },
        })
    }

    goPage = (page) => {
        if(typeof page === 'undefined') {
            page = this.props.wx_weChatsAutoReply.match_contents.current
        }
        this.props.dispatch({
            type: 'wx_weChatsAutoReply/setStateByPath',
            payload: {
                path: `match_contents.current`,
                value: page,
            },
        })
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'wx_weChatsAutoReply/assignStateByPath',
            payload: {
                path: `match_contents`,
                value: {
                    current: 1,
                    limit: size,
                },
            },
        })
    }

    render() {
        const {
            getMatchContentsLoading,
            wx_weChatsAutoReply,
        } = this.props
        const {
            match_contents: {
                table,
                current,
                limit,
            },
        } = wx_weChatsAutoReply

        const columns = [
            {
                title: '匹配规则',
                dataIndex: 'match_type',
                render: (text, record, index) => {
                    return matchType[text] || ''
                },
            },
            {
                title: '内容',
                dataIndex: 'content',
            },
            {
                title: '创建人',
                dataIndex: 'creator_name',
            },
        ]

        return (
            <div className={styles.matchContents}>
                <div className={styles.content}>
                    <div className={styles.table}>
                        <Table
                            columns={columns}
                            dataSource={table.slice(limit * (current - 1), limit * current)}
                            rowKey={(record) => {
                                return record.id
                            }}
                            loading={getMatchContentsLoading}
                            pagination={table.length ? {
                                total: table.length,
                                current,
                                showQuickJumper: true,
                                showTotal: total => `共 ${total} 条`,
                                pageSize: limit,
                                showSizeChanger: true,
                                onChange: this.goPage,
                                onShowSizeChange: this.handleChangeSize,
                                pageSizeOptions: ['10', '20', '50', '100'],
                            } : false}
                        />
                    </div>
                </div>
            </div>
        )
    }
}
