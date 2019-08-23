/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import RangeDatePicker from "components/RangeDatePicker"
import DepartmentSelect from "business/DepartmentSelect"
import UserSelect from "business/UserSelect"
import {getOptionsMap} from '../../utils'
import SearchBar from 'business/SearchBar'
import WeChatSelectSingle from 'business/WeChatSelectSingle'
// import styles from './index.less'

export default class Index extends React.Component {
    componentDidMount() {
        this.props.dispatch({
            type: 'risk_control_sensitiveBehavior/wxSensitiveOperationAllRecords',
        })
        this.props.dispatch({
            type: 'risk_control_sensitiveBehavior/wxDivideOptions',
        })
        this.props.dispatch({
            type: 'risk_control_sensitiveBehavior/groupsAll',
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.risk_control_sensitiveBehavior.params}
        params[key] = val

        if (key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        }else if (key === 'user_id') {
            params['uin'] = undefined
        }

        this.props.dispatch({
            type: 'risk_control_sensitiveBehavior/setStateByPath',
            payload: {
                path: 'params',
                value: params,
            },
        })
    }

    render() {
        const {
            risk_control_sensitiveBehavior,
            wxSensitiveOperationAllRecordsLoading,
            wxDivideOptionsLoading,
            resetSearch,
            handleSearch,
            groupsAllLoading,
        } = this.props
        const {
            params = {},
            allOperationsMap = {},
            wxDivideOptionsMap = {},
            groupsAllOptionsMap = {},
        } = risk_control_sensitiveBehavior

        return (
            <SearchBar
                searchBlock={[
                    {
                        cols: [
                            {
                                type: 'inputSearch',
                                formItemOption: {
                                    label: '搜索设备',
                                },
                                contentOption: {
                                    params,
                                    handleChange: this.handleChange,
                                    onSearch: handleSearch,
                                    key: 'key',
                                    placeholder: '输入编号、设备备注',
                                },
                            },
                            {
                                type: 'select',
                                formItemOption: {
                                    label: '敏感行为',
                                },
                                contentOption: {
                                    params,
                                    handleChange: this.handleChange,
                                    key: 'sensitive_operation_id',
                                    placeholder: '全部',
                                    optionsMap: allOperationsMap,
                                    loading: wxSensitiveOperationAllRecordsLoading,
                                    showSearch: true,
                                    optionFilterProp: 'children',
                                    filterOption: (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
                                },
                            },
                            {
                                type: 'select',
                                formItemOption: {
                                    label: '设备分组',
                                },
                                contentOption: {
                                    params,
                                    handleChange: this.handleChange,
                                    key: 'device_group_id',
                                    placeholder: '全部',
                                    optionsMap: groupsAllOptionsMap,
                                    loading: groupsAllLoading,
                                    showSearch: true,
                                    optionFilterProp: 'children',
                                    filterOption: (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
                                },
                            },
                        ],
                    },
                    {
                        cols: [
                            {
                                type: 'select',
                                formItemOption: {
                                    label: '微信号分组',
                                },
                                contentOption: {
                                    params,
                                    handleChange: this.handleChange,
                                    key: 'group_id',
                                    placeholder: '全部',
                                    optionsMap: wxDivideOptionsMap,
                                    loading: wxDivideOptionsLoading,
                                    showSearch: true,
                                    optionFilterProp: 'children',
                                    filterOption: (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
                                },
                            },
                            {
                                formItemOption: {
                                    label: '微信号所属部门',
                                },
                                component: (
                                    <DepartmentSelect
                                        departmentId={params.department_id}
                                        onChange={(value) => {
                                            this.handleChange('department_id', value)
                                        }}
                                    />
                                ),
                            },
                            {
                                formItemOption: {
                                    label: '微信号所属客服',
                                },
                                component: (
                                    <UserSelect
                                        departmentId={params.department_id}
                                        userId={params.user_id}
                                        onChange={(value) => {
                                            this.handleChange('user_id', value)
                                        }}
                                    />
                                ),
                            },
                        ],
                    },
                    {
                        cols: [
                            {
                                formItemOption: {
                                    label: '所属微信',
                                },
                                component: (
                                    <WeChatSelectSingle
                                        departmentId={params.department_id}
                                        userId={params.user_id}
                                        uin={params.uin}
                                        onChange={(value) => {
                                            this.handleChange('uin', value)
                                        }}
                                    />
                                ),
                            },
                            {
                                formItemOption: {
                                    label: '设备所属客服',
                                },
                                component: (
                                    <UserSelect
                                        userId={params.device_belong_user_id}
                                        onChange={(value) => {
                                            this.handleChange('device_belong_user_id', value)
                                        }}
                                    />
                                ),
                            },
                            {
                                formItemOption: {
                                    label: '时间',
                                },
                                component: (
                                    <RangeDatePicker
                                        maxToday={true}
                                        value={params.call_time}
                                        onChange={(value) => {
                                            this.handleChange('call_time', value.slice())
                                        }}
                                    />
                                ),
                            },
                        ],
                    },
                    {
                        cols: [
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
                                    optionsMap: getOptionsMap('status'),
                                },
                            },
                            {
                                type: 'select',
                                formItemOption: {
                                    label: '处理状态',
                                },
                                contentOption: {
                                    params,
                                    handleChange: this.handleChange,
                                    key: 'handle_status',
                                    placeholder: '全部',
                                    optionsMap: getOptionsMap('handle_status'),
                                },
                            },
                            {
                                type: 'select',
                                formItemOption: {
                                    label: '好友/群',
                                },
                                contentOption: {
                                    params,
                                    handleChange: this.handleChange,
                                    key: 'target_type',
                                    placeholder: '全部',
                                    optionsMap: getOptionsMap('target_type'),
                                },
                            },
                        ],
                    },
                    {
                        cols: [
                            {
                                type: 'search',
                                searchBtnOption: {
                                    onClick: handleSearch,
                                },
                                resetBtnOption: {
                                    onClick: resetSearch,
                                },
                            },
                        ],
                    },
                ]}
            />
        )
    }
}
