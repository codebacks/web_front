'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/27
 */
import React from 'react'
import {Table, Pagination, Popover} from 'antd'
import {connect} from 'dva'
import ContentHeader from 'components/business/ContentHeader'
import documentTitleDecorator from 'hoc/documentTitle'
import HistoryModal from 'components/business/HistoryModal'
import config from 'wx/common/config'
import Helper from 'wx/utils/helper'
import styles from './index.scss'
import Search from './Search'
import createFaceHtml from "components/Face/createFaceHtml";

const {pageSizeOptions, DefaultAvatar} = config

@connect(({base, wx_history, loading}) => ({
    base, wx_history,
    loading: loading.effects['wx_history/query']
}))
@documentTitleDecorator()
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            historyVisible: false,
            record: {},
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'wx_history/query',
            payload: {params: {offset: 0, limit: 10}}
        })
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'wx_history/query',
            payload: {page: page},
        })
    };

    handleReload = () => {
        this.goPage(1)
    };

    handleShowHistory = (record) => {
        this.setState({
            historyVisible: true,
            record: record
        })
    }

    handleHideHistory = () => {
        this.setState({
            historyVisible: false,
            record: {}
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.wx_history.params}
        params.limit = size
        this.props.dispatch({
            type: 'wx_history/setProperty',
            payload: {params: params},
        })
        this.goPage(1) //重置个数时回到首页
    };

    render() {
        const {params, list, total, current} = this.props.wx_history
        const {loading} = this.props
        const {historyVisible, record} = this.state

        const columns = [{
            title: '头像',
            dataIndex: 'target.head_img_url',
            width: 65,
            className: `${styles.firstColumn} ${styles.avatarColumn}`,
            render: (text) => {
                if (text) {
                    return <img src={Helper.getWxThumb(text)} className={styles.avatar}
                        onError={(e) => {
                            e.target.src = DefaultAvatar
                        }} rel="noreferrer" alt=""/>
                } else {
                    return <img src={DefaultAvatar} className={styles.avatar} alt=""/>
                }
            }
        },
        {
            title: '微信备注',
            dataIndex: 'target.remark_name',
            render: (text, record) => {
                return createFaceHtml({tagName: 'span', tagProps: {}, values: text || record.target.nickname})
            }
        },{
            title: '微信昵称',
            dataIndex: 'target.nickname',
            render: (text, record) => {
                return createFaceHtml({tagName: 'span', tagProps: {className: styles.preWrap}, values: text || record.username})
            }
        },
        {
            title: '消息记录数',
            dataIndex: 'message_count',
        },
        {
            title: '所属部门',
            dataIndex: 'user.departments',
            className: styles.deptColumn,
            render: (text, record) => {
                let content = ''
                let departments = record.user.departments
                if(departments && departments.length){
                    content = departments.map((item)=>{
                        return item.name
                    }).join('，')
                    return  <Popover placement="topLeft" content={<p className={styles.wholeDept}>{content}</p>} title={null} trigger="hover">
                        <div className={styles.dept}>{content}</div>
                    </Popover>
                }
            }
        },
        {
            title: '所属员工',
            dataIndex: 'user.nickname',
        },
        {
            title: '所属微信',
            dataIndex: 'from.nickname',
            render: (nickname, record) => {
                const remark = record.from && record.from.remark
                return createFaceHtml({tagName: 'span', tagProps: {}, values: remark || nickname})
            },
        },
        {
            title: '操作',
            dataIndex: 'option',
            render: (text, record) => (
                <span className={styles.record} onClick={()=>{this.handleShowHistory(record)}}>聊天记录</span>
            ),
        }]

        return (
            <div>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E4%B8%AA%E4%BA%BA%E5%8F%B7/%E6%B6%88%E6%81%AF%E7%AE%A1%E7%90%86.md',
                    }}
                />
                <div className={styles.history}>
                    <Search {...this.props} search={this.handleReload}/>
                    <div className={styles.tableWrap}>
                        <Table
                            columns={columns}
                            dataSource={list}
                            size="middle"
                            loading={loading}
                            rowKey={(record, index) => index}
                            pagination={false}
                        />
                    </div>
                    <Pagination
                        className="ant-table-pagination"
                        total={total}
                        current={current}
                        showQuickJumper={true}
                        pageSizeOptions={pageSizeOptions}
                        showTotal={total => `共${total}条`}
                        pageSize={params.limit}
                        showSizeChanger={true}
                        onShowSizeChange={this.handleChangeSize}
                        onChange={this.goPage}
                    />
                    {historyVisible ? <HistoryModal {...this.props}
                        visible={historyVisible}
                        record={record}
                        fromUin={record.from.uin}
                        toUsername={record.target.username}
                        keyword={params.content}
                        onCancel={this.handleHideHistory}
                    /> : null}
                </div>
            </div>
        )
    }
}
