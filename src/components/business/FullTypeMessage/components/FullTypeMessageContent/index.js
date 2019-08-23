/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/5
 */

import React from 'react'
import PropTypes from "prop-types"
import {
    Tabs,
    Spin,
} from "antd"
import classNames from 'classnames'
import styles from './index.less'
import {consumerHoc} from 'business/FullTypeMessage/dataManagement'

const TabPane = Tabs.TabPane

@consumerHoc({
    mapStoreToProps: (
        {
            setStoreDeep,
            assignStoreByPath,
            setStoreByPath,
            setStore,
            loading,
            className,
            tabsOption,
            store: {
                tabsActiveKey,
                tabs,
            },
        },
        props,
    ) => {
        return {
            ...props,
            ...{
                className,
                tabsActiveKey,
                setStoreDeep,
                tabs,
                setStore,
                loading,
                tabsOption,
            },
        }
    },
})
export default class FullTypeMessageContent extends React.PureComponent {
    static propTypes = {
        tabs: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            ContentComponent: PropTypes.func.isRequired,
        })),
    }

    componentDidMount() {
        this.handleTabChange()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.handleTabChange()
    }

    handleTabChange = () => {
        const {tabsActiveKey, handleTabChange} = this.props
        if(handleTabChange) {
            handleTabChange({tabsActiveKey: Number(tabsActiveKey)})
        }
    }

    handleChange = (key) => {
        const {setStore} = this.props

        setStore({tabsActiveKey: Number(key)})
    }

    renderTabs = () => {
        const {tabs} = this.props

        return tabs.map((item) => {
            const ContentComponent = item.ContentComponent

            return (
                <TabPane
                    tab={item.name}
                    key={item.type}
                >
                    <div>
                        <ContentComponent
                            {...item}
                        />
                    </div>
                </TabPane>
            )
        })
    }

    render() {
        const {tabsActiveKey, loading, className, tabsOption} = this.props
        const cls = classNames(styles.fullTypeMessageContent, className)

        return (
            <div className={cls}>
                <Spin tip="Loading..." spinning={loading}>
                    <Tabs
                        {...tabsOption}
                        activeKey={String(tabsActiveKey)}
                        onChange={this.handleChange}
                    >
                        {this.renderTabs()}
                    </Tabs>
                </Spin>
            </div>
        )
    }
}
