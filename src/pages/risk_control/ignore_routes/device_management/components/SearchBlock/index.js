/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import DepartmentSelect from "business/DepartmentSelect"
import UserSelect from "business/UserSelect"
import {getOptionsMap} from '../../utils'
import SearchBar from 'business/SearchBar'
// import styles from './index.less'

export default class Index extends React.Component {
    componentDidMount() {
        this.props.dispatch({
            type: 'risk_control_deviceManagement/devicesAttributes',
        })
        this.props.dispatch({
            type: 'risk_control_deviceManagement/groupsAll',
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.risk_control_deviceManagement.params}
        params[key] = val

        if (key === 'department_id') {
            params['keep_user_id'] = undefined
            params['uin'] = undefined
        }else if (key === 'keep_user_id') {
            params['uin'] = undefined
        }

        this.props.dispatch({
            type: 'risk_control_deviceManagement/setStateByPath',
            payload: {
                path: 'params',
                value: params,
            },
        })
    }

    render() {
        const {
            risk_control_deviceManagement,
            groupsAllLoading,
            devicesAttributesLoading,
            resetSearch,
            handleSearch,
        } = this.props
        const {
            params = {},
            wechatVersionMap = {},
            niukefuVersionMap = {},
            romVersionMap = {},
            hookVersionMap = {},
            osMap = {},
            brandMap = {},
            modelMap = {},
            groupsAllOptionsMap = {},
        } = risk_control_deviceManagement

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
                                    key: 'keyword',
                                    placeholder: '输入序列号、备注、编号',
                                },
                            },
                            {
                                type: 'inputSearch',
                                formItemOption: {
                                    label: '搜索微信',
                                },
                                contentOption: {
                                    params,
                                    handleChange: this.handleChange,
                                    onSearch: handleSearch,
                                    key: 'wechat_keyword',
                                    placeholder: '输入昵称、手机号、微信号',
                                },
                            },
                            {
                                formItemOption: {
                                    label: '设备保管者',
                                },
                                component: (
                                    <UserSelect
                                        departmentId={params.department_id}
                                        userId={params.keep_user_id}
                                        onChange={(value) => {
                                            this.handleChange('keep_user_id', value)
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
                                type: 'select',
                                formItemOption: {
                                    label: '设备分组',
                                },
                                contentOption: {
                                    params,
                                    handleChange: this.handleChange,
                                    key: 'group_id',
                                    placeholder: '全部',
                                    optionsMap: groupsAllOptionsMap,
                                    loading: groupsAllLoading,
                                    showSearch: true,
                                    optionFilterProp: 'children',
                                    filterOption: (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
                                },
                            },
                            {
                                type: 'select',
                                formItemOption: {
                                    label: '是否激活',
                                },
                                contentOption: {
                                    params,
                                    handleChange: this.handleChange,
                                    key: 'is_active',
                                    placeholder: '全部',
                                    optionsMap: getOptionsMap('is_active'),
                                },
                            },
                        ],
                    },
                    {
                        cols: [
                            {
                                type: 'select',
                                formItemOption: {
                                    label: '设备状态',
                                },
                                contentOption: {
                                    params,
                                    handleChange: this.handleChange,
                                    key: 'is_delete',
                                    placeholder: '全部',
                                    optionsMap: getOptionsMap('is_delete'),
                                },
                            },
                            {
                                type: 'select',
                                formItemOption: {
                                    label: '在线状态',
                                },
                                contentOption: {
                                    params,
                                    handleChange: this.handleChange,
                                    key: 'is_online',
                                    placeholder: '全部',
                                    optionsMap: getOptionsMap('is_online'),
                                },
                            },
                            {
                                type: 'select',
                                formItemOption: {
                                    label: '微信版本',
                                },
                                contentOption: {
                                    params,
                                    handleChange: this.handleChange,
                                    key: 'wechat_version',
                                    placeholder: '全部',
                                    optionsMap: wechatVersionMap,
                                    loading: devicesAttributesLoading,
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
                                    label: '牛客服版本',
                                },
                                contentOption: {
                                    params,
                                    handleChange: this.handleChange,
                                    key: 'niukefu_version',
                                    placeholder: '全部',
                                    optionsMap: niukefuVersionMap,
                                    loading: devicesAttributesLoading,
                                    showSearch: true,
                                    optionFilterProp: 'children',
                                    filterOption: (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
                                },
                            },
                            {
                                type: 'select',
                                formItemOption: {
                                    label: 'ROM版本',
                                },
                                contentOption: {
                                    params,
                                    handleChange: this.handleChange,
                                    key: 'rom_version',
                                    placeholder: '全部',
                                    optionsMap: romVersionMap,
                                    loading: devicesAttributesLoading,
                                    showSearch: true,
                                    optionFilterProp: 'children',
                                    filterOption: (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
                                },
                            },
                            {
                                type: 'select',
                                formItemOption: {
                                    label: '助手版本',
                                },
                                contentOption: {
                                    params,
                                    handleChange: this.handleChange,
                                    key: 'hook_version',
                                    placeholder: '全部',
                                    optionsMap: hookVersionMap,
                                    loading: devicesAttributesLoading,
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
                                    label: '系统OS',
                                },
                                contentOption: {
                                    params,
                                    handleChange: this.handleChange,
                                    key: 'os',
                                    placeholder: '全部',
                                    optionsMap: osMap,
                                    loading: devicesAttributesLoading,
                                    showSearch: true,
                                    optionFilterProp: 'children',
                                    filterOption: (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
                                },
                            },
                            {
                                type: 'select',
                                formItemOption: {
                                    label: '手机品牌',
                                },
                                contentOption: {
                                    params,
                                    handleChange: this.handleChange,
                                    key: 'brand',
                                    placeholder: '全部',
                                    optionsMap: brandMap,
                                    loading: devicesAttributesLoading,
                                    showSearch: true,
                                    optionFilterProp: 'children',
                                    filterOption: (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
                                },
                            },
                            {
                                type: 'select',
                                formItemOption: {
                                    label: '型号',
                                },
                                contentOption: {
                                    params,
                                    handleChange: this.handleChange,
                                    key: 'model',
                                    placeholder: '全部',
                                    optionsMap: modelMap,
                                    loading: devicesAttributesLoading,
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
