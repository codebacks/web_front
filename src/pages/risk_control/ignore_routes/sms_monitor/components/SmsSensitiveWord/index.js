import React from 'react'
import {Button, Table, Divider, Modal, message} from 'antd'
import styles from './index.less'
import {hot} from 'react-hot-loader'
import {connect} from 'dva/index'
import documentTitleDecorator from 'hoc/documentTitle'
import constants from 'risk_control/common/constants'
import SensitiveWordsModal from './components/SensitiveWordsModal'
import config from "risk_control/common/constants"
import moment from 'moment'
import SearchBar from 'business/SearchBar'

const {DateTimeFormat} = config

@hot(module)
@connect(({risk_control_smsSensitiveWord, loading}) => ({
    risk_control_smsSensitiveWord,
    tableLoading: loading.effects['risk_control_smsSensitiveWord/details'],
    changeMsgSensitiveWordsLoading: loading.effects['risk_control_smsSensitiveWord/changeMsgSensitiveWords'],
    createMsgSensitiveWordsBatchLoading: loading.effects['risk_control_smsSensitiveWord/createMsgSensitiveWordsBatch'],
}))
@documentTitleDecorator({
    overrideTitle: '短信敏感词',
})
export default class Index extends React.Component {
    componentDidMount() {
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'risk_control_smsSensitiveWord/details',
            payload: {page: page},
        })
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'risk_control_smsSensitiveWord/setStateByPath',
            payload: {
                path: 'params.limit',
                value: size,
            },
        })
        this.goPage(1)
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.risk_control_smsSensitiveWord.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
        }

        this.props.dispatch({
            type: 'risk_control_smsSensitiveWord/setStateByPath',
            payload: {
                path: 'params',
                value: params,
            },
        })
    }

    resetSearch = () => {
        this.props.dispatch({
            type: 'risk_control_smsSensitiveWord/resetParams',
        })
        this.goPage(1)
    }

    render() {
        const {
            tableLoading,
            risk_control_smsSensitiveWord,
            changeMsgSensitiveWordsLoading,
            createMsgSensitiveWordsBatchLoading,
            dispatch,
        } = this.props

        const {list, current, total, params = {}} = risk_control_smsSensitiveWord

        const columns = [
            {
                title: '敏感词',
                dataIndex: 'name',
            },
            {
                title: '创建人',
                dataIndex: 'nickname',
            },
            {
                title: '创建时间',
                dataIndex: 'create_time',
                render: (text, record, index) => {
                    if (text) {
                        return moment(text * 1000).format(DateTimeFormat)
                    }
                    return ''
                },
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record, index) => {
                    return (
                        <div className={styles.operator}>
                            <SensitiveWordsModal
                                dispatch={dispatch}
                                record={record}
                                goPage={this.goPage}
                                renderBtn={(setTrue) => {
                                    return (
                                        <span
                                            className={styles.operatorBtn}
                                            onClick={setTrue}
                                        >
                                            编辑
                                        </span>
                                    )
                                }}
                                modalOption={{
                                    title: '编辑敏感词',
                                    confirmLoading: changeMsgSensitiveWordsLoading,
                                }}
                            />
                            <Divider type="vertical"/>
                            <span
                                className={styles.operatorBtn}
                                onClick={() => {
                                    Modal.confirm({
                                        title: '确定删除本条记录吗?',
                                        okText: '确定',
                                        okType: 'danger',
                                        cancelText: '取消',
                                        onOk: () => {
                                            return new Promise((resolve, reject) => {
                                                dispatch({
                                                    type: 'risk_control_smsSensitiveWord/deleteMsgSensitiveWords',
                                                    payload: {
                                                        id: record.id,
                                                    },
                                                    callback: () => {
                                                        message.success('删除成功')
                                                        this.goPage()
                                                        resolve()
                                                    },
                                                })
                                            })
                                        },
                                    })
                                }}
                            >
                                删除
                            </span>
                        </div>
                    )
                },
            },
        ]

        return (
            <div className={styles.main}>
                <div className={styles.content}>
                    <SearchBar
                        searchBlock={[
                            {
                                cols: [
                                    {
                                        type: 'inputSearch',
                                        formItemOption: {
                                            label: '搜索敏感词',
                                        },
                                        contentOption: {
                                            params,
                                            handleChange: this.handleChange,
                                            onSearch: this.handleSearch,
                                            key: 'name',
                                            placeholder: '输入敏感词',
                                        },
                                    },
                                    {
                                        type: 'search',
                                        searchBtnOption: {
                                            onClick: this.handleSearch,
                                        },
                                        resetBtnOption: {
                                            onClick: this.resetSearch,
                                        },
                                    },
                                ],
                            },
                        ]}
                    />
                    <div className={styles.option}>
                        <SensitiveWordsModal
                            dispatch={dispatch}
                            goPage={this.goPage}
                            isCreate={true}
                            renderBtn={(setTrue) => {
                                return (
                                    <Button
                                        type="primary"
                                        icon="plus"
                                        onClick={setTrue}
                                    >
                                        添加敏感词
                                    </Button>
                                )
                            }}
                            modalOption={{
                                title: '添加敏感词',
                                confirmLoading: createMsgSensitiveWordsBatchLoading,
                            }}
                        />
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
                                        pageSize: params.limit,
                                        showSizeChanger: true,
                                        onChange: this.goPage,
                                        onShowSizeChange: this.handleChangeSize,
                                        pageSizeOptions: constants.pageSizeOptions,
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
