import React from 'react'
import {Table, Switch} from 'antd'
import styles from './index.less'
import {hot} from 'react-hot-loader'
import {connect} from 'dva/index'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader'
import SearchBar from 'business/SearchBar'

const typeMap = {
    '0': '关',
    '1': '开',
}

@hot(module)
@connect(({risk_control_sensitiveOperations, loading}) => ({
    risk_control_sensitiveOperations,
    tableLoading: loading.effects['risk_control_sensitiveOperations/details'],
    changeWxSensitiveOperationStatusLoading: loading.effects['risk_control_sensitiveOperations/changeWxSensitiveOperationStatus'],
}))
@documentTitleDecorator()
export default class Index_page extends React.Component {
    componentDidMount() {
        this.props.dispatch({
            type: 'risk_control_sensitiveOperations/details',
        })
    }

    handleSearch = () => {
        this.props.dispatch({
            type: 'risk_control_sensitiveOperations/search',
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.risk_control_sensitiveOperations.params}
        params[key] = val

        this.props.dispatch({
            type: 'risk_control_sensitiveOperations/setParams',
            payload: {params: params},
        })

        this.props.dispatch({
            type: 'risk_control_sensitiveOperations/setStateByPath',
            payload: {
                path: 'params',
                value: params,
            },
        })
    }

    resetSearch = () => {
        this.props.dispatch({
            type: 'risk_control_sensitiveOperations/resetParams',
        })
        this.props.dispatch({
            type: 'risk_control_sensitiveOperations/search',
        })
    }

    onChange = (value, record) => {
        this.props.dispatch({
            type: 'risk_control_sensitiveOperations/changeWxSensitiveOperationStatus',
            payload: {
                id: record.id,
                body: {
                    status: Number(value),
                },
            },
            callback: () => {
                this.props.dispatch({
                    type: 'risk_control_sensitiveOperations/details',
                })
            },
        })
    }

    render() {
        const {
            tableLoading,
            risk_control_sensitiveOperations,
            changeWxSensitiveOperationStatusLoading,
        } = this.props

        const {list, params = {}} = risk_control_sensitiveOperations

        const columns = [
            {
                title: '敏感操作',
                dataIndex: 'name',
                width: 400,
            },
            {
                title: '状态',
                dataIndex: 'status',
                render: (text, record, index) => {
                    return (
                        <Switch
                            loading={changeWxSensitiveOperationStatusLoading}
                            checkedChildren="开"
                            unCheckedChildren="关"
                            checked={Boolean(text)}
                            onChange={(value) => {
                                this.onChange(value, record)
                            }}
                        />
                    )
                },
            },
        ]

        return (
            <div className={styles.main}>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                />
                <div className={styles.content}>
                    <SearchBar
                        searchBlock={[
                            {
                                cols: [
                                    {
                                        type: 'inputSearch',
                                        formItemOption: {
                                            label: '敏感操作',
                                        },
                                        contentOption: {
                                            params,
                                            handleChange: this.handleChange,
                                            onSearch: this.handleSearch,
                                            key: 'name',
                                            placeholder: '输入敏感操作',
                                        },
                                    },
                                    {
                                        type: 'select',
                                        formItemOption: {
                                            label: '状态',
                                        },
                                        contentOption: {
                                            params,
                                            handleChange: this.handleChange,
                                            key: 'status',
                                            placeholder: '全部',
                                            optionsMap: typeMap,
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
                    <div className={styles.table}>
                        <Table
                            columns={columns}
                            dataSource={list}
                            rowKey={(record) => record.id}
                            loading={tableLoading}
                            pagination={false}
                        />
                    </div>
                </div>
            </div>
        )
    }
}
