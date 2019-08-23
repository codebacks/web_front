/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/5
 *
 * showTabs: [1, 2, 3, 4, 5, 6, 7, 8, 9]
 * showTabs: [
 {
                    type: 10,
                    tabProps: {
                        maxLen: 200,
                    },
                    name: '自定义',
                    custom: true,//true为自定义
                    ContentComponent: CustomComponent
                },
 ],
 *
 *
 *
 */

import React from 'react'
import PropTypes from "prop-types"
import FullTypeMessageContent from './components/FullTypeMessageContent'
import {
    createTabs,
    getKeys,
    findTabIndex,
    findTab,
    sourceTypeMap,
    getTabName,
    registerDefaultTabs,
} from './constant'
import {Context} from 'business/FullTypeMessage/dataManagement'
import MsgContent from './components/MsgContent'
import MsgContentModal from './components/MsgContentModal'
import {
    assignStateByPath,
    setStateByPath,
} from 'components/DataManagement/utils'
import {
    setTabStateFromProps,
} from './utils'
import _ from "lodash"

export {sourceTypeMap, getTabName, registerDefaultTabs, MsgContent, MsgContentModal}

export default class FullTypeMessage extends React.PureComponent {
    static propTypes = {
        showTabs: function(props, propName, componentName) {
            const tabs = props[propName]
            if (!Array.isArray(tabs)) {
                throw new Error(`必须为数组`)
            }
            if (tabs.length < 1) {
                throw new Error(`数组不能为空`)
            }

            tabs.forEach((tab) => {
                let custom = false
                let type = tab
                if (typeof tab === 'object') {
                    type = tab.type
                    custom = tab.custom
                }
                if (typeof type !== 'number') {
                    throw new Error(`type必须为number`)
                }
                const index = findTabIndex(type)
                if (custom) {
                    if (index > -1) {
                        throw new Error(`${type}错误，自定义类型不能为为${getKeys()}中的一个`)
                    }

                    if (typeof tab.name === 'undefined') {
                        throw new Error(`自定义组件必须要有name字段`)
                    }

                    if (typeof tab.name !== 'string') {
                        throw new Error(`name必须为string`)
                    }

                    if (!tab.ContentComponent) {
                        throw new Error(`自定义组件必须有ContentComponent`)
                    }
                }

                if (!custom && index < -1) {
                    throw new Error(`${type}错误，必须为${getKeys()}中的一个`)
                }
            })
        },
        tabsActiveKey: PropTypes.number,
        typeValue: PropTypes.shape({
            type: PropTypes.number,
            values: PropTypes.object,
        }),
        typeSourceType: PropTypes.shape({
            type: PropTypes.number,
        }),
        typeSourceData: PropTypes.shape({
            type: PropTypes.number,
        }),
        className: PropTypes.string,
        contextProps: PropTypes.object,
        tabsOption: PropTypes.object,
        transformData: PropTypes.func,
        handleTabChange: PropTypes.func,
    }

    static defaultProps = {
        showTabs: [1, 2, 3, 6, 7, 9, 5, 4, 8],
        tabsActiveKey: 1,
        loading: false,
        contextProps: {},
        tabsOption: {
            animated: true,
        },
        transformData: (data) => {
            data.source_type = data.sourceType
            data.source_data = data.sourceData
            return data
        },
    }

    static getDerivedStateFromProps(props, state) {
        let newState = null
        if (props.showTabs !== state.prevPropsShowTabs) {
            const tabs = state.tabs
            newState = {
                prevPropsShowTabs: props.showTabs,
                tabs: createTabs({
                    tabs,
                    showTabs: props.showTabs,
                    cb: (tab) => {
                        tab.tabRef = React.createRef()
                    },
                }),
            }
        }

        const tabs = _.get(newState, 'tabs', state.tabs)

        if (props.tabsActiveKey !== state.prevPropsTabsActiveKey) {
            newState = newState || {}
            if (findTabIndex(props.tabsActiveKey, tabs) > -1) {
                _.defaults(newState, {
                    prevPropsTabsActiveKey: props.tabsActiveKey,
                    tabsActiveKey: props.tabsActiveKey,
                })
            }else {
                _.defaults(newState, {
                    prevPropsTabsActiveKey: props.tabsActiveKey,
                })
                // console.error(`tabsActiveKey: ${props.tabsActiveKey}无效`)
            }
        }

        newState = setTabStateFromProps({
            name: 'typeSourceData',
            preName: 'prevPropsTypeSourceData',
            newState,
            tabs,
            props,
            state,
            setNewTabs: (newTabs, index, name) => {
                newTabs[index].sourceData = props[name].sourceData
            },
        })

        newState = setTabStateFromProps({
            name: 'typeSourceType',
            preName: 'prevPropsTypeSourceType',
            newState,
            tabs,
            props,
            state,
            setNewTabs: (newTabs, index, name) => {
                newTabs[index].sourceType = props[name].sourceType
            },
        })

        newState = setTabStateFromProps({
            name: 'typeValue',
            preName: 'prevPropsTypeValue',
            newState,
            tabs,
            props,
            state,
            setNewTabs: (newTabs, index, name) => {
                newTabs[index].values = props[name].values
            },
        })

        return newState
    }

    constructor(props) {
        super(props)
        this.state = {}
    }

    assignStoreByPath = ({path = '', value = {}}, cb) => {
        return this.setState(assignStateByPath({
            state: this.state,
            path,
            value,
        }), cb)
    }

    setStoreByPath = ({path = '', value = {}}, cb) => {
        return this.setState(setStateByPath({
            state: this.state,
            path,
            value,
        }), cb)
    }

    getData = async () => {
        try {
            const {tabs, tabsActiveKey} = this.state
            const getValues = _.get(findTab(tabsActiveKey, tabs), `tabRef.current.getValues`)

            if (typeof getValues === 'function') {
                const values = await getValues()
                if (typeof values === 'undefined') {
                    this.throwError({
                        message: 'values不能为空',
                    })
                }

                let data = this.createData(values)

                if (this.props.transformData) {
                    data = this.props.transformData(data)
                }

                return data
            }else {
                this.throwError({
                    message: '无getData方法',
                })
            }
        }catch (e) {
            this.throwError(e)
        }
    }

    createData = (values) => {
        const {tabsActiveKey} = this.state
        return {
            ...{
                type: tabsActiveKey,
            },
            ...values,
        }
    }

    throwError = ({message = 'error', data = {}}) => {
        const {tabsActiveKey, tabs} = this.state
        const error = new Error(message)
        const tab = findTab(tabsActiveKey, tabs)
        error.data = data
        error.tabsActiveKey = tabsActiveKey
        error.name = tab.name
        // error.tab = tab
        // error.msg = `${tab.name}: ${message}`
        error.msg = `必填项未填写`

        throw error
    }

    setStoreDeep = (state = {}, cb) => {
        return this.setState(_.defaultsDeep({}, state, this.state), cb)
    }

    setStore = (...arg) => {
        return this.setState(...arg)
    }

    render() {
        const {
            loading,
            className,
            contextProps,
            tabsOption,
            handleTabChange,
        } = this.props

        return (
            <Context.Provider
                value={{
                    contextProps,
                    loading,
                    className,
                    tabsOption,
                    store: this.state,
                    setStoreDeep: this.setStoreDeep,
                    assignStoreByPath: this.assignStoreByPath,
                    setStoreByPath: this.setStoreByPath,
                    setStore: this.setStore,
                }}
            >
                <FullTypeMessageContent handleTabChange={handleTabChange}/>
            </Context.Provider>
        )
    }
}
