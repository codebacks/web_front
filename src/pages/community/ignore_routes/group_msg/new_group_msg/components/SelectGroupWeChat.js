import React, {PureComponent} from 'react'
import {
    Button,
    Row,
    Col,
    Table,
    Popover,
    message,
    Checkbox,
} from 'antd'
import {connect} from "dva/index"
import styles from '../index.less'
import documentTitleDecorator from 'hoc/documentTitle'
import baseConfig from 'config'
import WeChatSelectMulti from '@huzan/hz-wechat-select'
import '@huzan/hz-wechat-select/style/index'

@connect((
    {
        // base,
        // community_automaticNewGroupMsg,
        loading,
    },
) => ({
    // base,
    // community_automaticNewGroupMsg,
    // treeLoading: loading.effects['community_automaticNewGroupMsg/selectGroupWeChatTree'],
}))
@documentTitleDecorator({
    title: '选择微信号',
})
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            wxVisible: false,
        }
    }

    componentDidMount() {

    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/setStateByPath',
            payload: {
                path: 'selectGroupWeChat.current',
                value: page,
            },
        })
    }

    handleSelectCancel = () => {
        this.setState({
            wxVisible: false,
        })
    }

    handleSelectOk = (list) => {
        this.setState({
            wxVisible: false,
        })
        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/setStateByPath',
            payload: {
                path: 'selectGroupWeChat.selectedList',
                value: list,
            },
        })
    }

    handleShowSelect = () => {
        this.setState({
            wxVisible: true,
        })
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/assignStateByPath',
            payload: {
                path: 'selectGroupWeChat',
                value: {
                    current: 1,
                    limit: size,
                },
            },
        })
    }

    deleteSelectedWeChat = (uin) => {
        let {selectedList} = this.props.community_automaticNewGroupMsg.selectGroupWeChat
        selectedList = selectedList.filter((item) => {
            return item.uin !== uin
        })
        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/setStateByPath',
            payload: {
                path: 'selectGroupWeChat.selectedList',
                value: selectedList,
            },
        })
    }

    next = () => {
        let {selectedList} = this.props.community_automaticNewGroupMsg.selectGroupWeChat

        if(selectedList.length > 0) {
            this.props.next()
            this.props.dispatch({
                type: 'community_automaticNewGroupMsg/checkWeChatGroupSearch',
            })
        }else {
            message.error('请先选择微信号')
        }
    }

    changeStatus = (e) => {
        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/setStateByPath',
            payload: {
                path: 'at',
                value: e.target.checked,
            },
        })
    }

    render() {
        const {
            community_automaticNewGroupMsg,
        } = this.props
        const {
            at,
            selectGroupWeChat,
        } = community_automaticNewGroupMsg
        const {selectedList, current, limit} = selectGroupWeChat

        const columns = [
            {
                title: '微信昵称',
                dataIndex: 'nickname',
                key: 'nickname',
            },
            {
                title: '微信号',
                dataIndex: 'alias',
                key: 'alias',
                render: (text, record, index) => {
                    return record.alias || record.username
                },
            },
            {
                title: '备注',
                dataIndex: 'remark',
                key: 'remark',
                className: styles.remark,
            },
            {
                title: '所属账号',
                dataIndex: 'user',
                key: 'user',
                render: (text, record, index) => {
                    return text.nickname
                },
            },
            {
                title: '所属部门',
                dataIndex: 'department',
                key: 'department',
                className: styles.deptColumn,
                render: (text, record, index) => {
                    let departments = record.user.departments
                    let content = ''
                    if(departments && departments.length) {
                        content = departments.map((item) => {
                            return item.name
                        }).join('，')
                        return (
                            <Popover
                                placement="topLeft"
                                content={
                                    <p className={styles.wholeDept}>{content}</p>
                                }
                                title={null}
                                trigger="hover"
                            >
                                <div className={styles.dept}>{content}</div>
                            </Popover>
                        )
                    }
                    return ''
                },
            },
            {
                title: '操作',
                dataIndex: '',
                key: '',
                render: (text, record, index) => {
                    return <span className={styles.delete} onClick={() => {
                        this.deleteSelectedWeChat(record.uin)
                    }}>删除</span>
                },
            },
        ]

        const {wxVisible} = this.state

        return (
            <div className={styles.selectGroupWeChat}>
                <Row>
                    <Col span={18} className={styles.addUin}>
                        <span className={styles.chooseWx}>选择微信：</span>
                        <Button
                            icon="plus"
                            onClick={this.handleShowSelect}
                        >
                            添加微信
                        </Button>
                        <span className={styles.tip}>
                            未激活的微信号不支持此功能
                        </span>
                    </Col>
                </Row>
                <Row className={styles.at}>
                    <Col span={18} className={styles.addUin}>
                        <span className={styles.chooseWx}>发送内容是否包含@所有人：</span>
                        <Checkbox
                            checked={at}
                            onChange={this.changeStatus}
                        >
                            @所有人
                        </Checkbox>
                        <span>勾选后过滤所有员工号不是群主的群，@所有人文本消息将由对应群的群主以公告形式发布，发布时请保证群主微信号在线</span>
                    </Col>
                </Row>
                <Row>
                    <Col span={18}>
                        <div className={styles.tableSearch}>
                            <div className={styles.searchLeft}>
                                已选微信号 {selectedList.length}
                            </div>
                        </div>
                        <div className={styles.table}>
                            <Table
                                columns={columns}
                                dataSource={selectedList.slice(limit * (current - 1), limit * current)}
                                rowKey={(record, index) => index}
                                pagination={selectedList.length ? {
                                    total: selectedList.length,
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
                    </Col>
                </Row>
                <div className={styles.footer}>
                    <Button
                        type="primary"
                        className={styles.btn}
                        onClick={this.next}
                    >
                        下一步
                    </Button>
                    <Button onClick={this.props.cancel}>
                        取消
                    </Button>
                </div>
                <WeChatSelectMulti
                    visible={wxVisible}
                    apiHost={`${baseConfig.apiHost}/api`}
                    accessToken={this.props.base.accessToken}
                    filterBySerialno={true}
                    searchOption={['query', 'group_id', 'online']}
                    onCancel={this.handleSelectCancel}
                    onOk={this.handleSelectOk}
                />
            </div>
        )
    }
}
