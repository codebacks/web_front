/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/01/14
 */

import React from 'react'
import styles from './index.less'
import {
    Icon,
    Popover,
    Tabs,
} from 'antd'
import router from 'umi/router'
import _ from 'lodash'
import PropTypes from 'prop-types'

const TabPane = Tabs.TabPane

export default class ContentHeader extends React.PureComponent {
    static propTypes = {
        tabsRenderType: PropTypes.oneOf(['first', 'every']),
        content: PropTypes.array.isRequired,
        location: PropTypes.object,
        help: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.func,
        ]),
        tabKey: PropTypes.string,
        handleLocationTabsChange: PropTypes.func,
        setQuery: PropTypes.func,
    }

    static defaultProps = {
        tabsRenderType: 'every',
        queryKey: 'hztabkey',
    }

    handleLocationTabsChange = (activeKey) => {
        const {
            location = {},
            queryKey,
            setQuery,
            handleLocationTabsChange,
        } = this.props

        const activeContent = this.findActiveContent(activeKey)

        if(handleLocationTabsChange) {
            return handleLocationTabsChange({
                activeContent,
                location,
                activeKey,
                queryKey,
                props: this.props,
            })
        }else {
            let query = ''

            if(setQuery) {
                query = setQuery({activeContent, location, activeKey, queryKey, props: this.props})
            }else {
                query = {
                    [queryKey]: activeKey,
                }
            }

            router.push({
                pathname: location.pathname,
                query,
            })
        }
    }

    renderTabPaneContent = ({tabKey, activeKey, content}) => {
        const {tabsRenderType} = this.props
        if(tabsRenderType === 'every') {
            return tabKey === activeKey ? content : null
        }else if(tabsRenderType === 'first') {
            return content
        }
    }

    renderTabName = ({name = '', description, descriptionPlacement}) => {
        if(description) {
            return (
                <>
                    {name}
                    {this.renderDescription(description, descriptionPlacement)}
                </>
            )
        }else {
            return name
        }
    }

    renderDescription = (description, descriptionPlacement) => {
        if(typeof description === 'function') {
            return description()
        }else if(description) {
            return (
                <Popover
                    placement={descriptionPlacement || 'bottomLeft'}
                    content={description}
                    title={null}
                >
                    <Icon
                        className={styles.questionCircle}
                        type="question-circle-o"
                    />
                </Popover>
            )
        }
    }

    renderTabPanesContent = (activeKey) => {
        const {content} = this.props
        return content.map((item, i) => {
            return (
                <TabPane
                    {...item}
                    tab={this.renderTabName(item)}
                    key={item.tabKey}
                >
                    {
                        this.renderTabPaneContent({
                            item,
                            tabKey: item.tabKey,
                            activeKey,
                            content:
                            item.content,
                            index: i,
                        })
                    }
                </TabPane>
            )
        })
    }

    renderHelpContent = ({url = '', name = '帮助'} = {}) => {
        return (
            <div className={styles.help}>
                <a
                    href={url}
                    target="_blank"
                    rel="nofollow me noopener noreferrer"
                >
                    <Icon
                        type="book"
                    >
                    </Icon>
                    {name}
                </a>
            </div>
        )
    }

    findActiveContent = (activeKey) => {
        const {
            content,
        } = this.props

        return content.find(item => item.tabKey === activeKey)
    }

    tabBarExtraContent = (activeKey) => {
        const {
            help,
        } = this.props

        const activeContent = this.findActiveContent(activeKey)
        const activeContentHelp = _.get(activeContent, 'help')

        if(activeContentHelp === false) {
            return null
        }

        const helpInfo = activeContentHelp || help

        if(helpInfo) {
            return this.renderHelp(helpInfo)
        }
    }

    renderTabBar = (renderProps, ScrollableInkTabBar) => {
        return (
            <div className={styles.head}>
                <ScrollableInkTabBar
                    {...renderProps}
                />
            </div>
        )
    }

    renderHelp = (helpInfo) => {
        if(typeof helpInfo === 'function') {
            return helpInfo()
        }
        if(typeof helpInfo === 'object') {
            return this.renderHelpContent({
                url: helpInfo.url,
                name: helpInfo.name,
            })
        }
    }

    getOnChange = () => {
        const {
            location,
            onChange,
        } = this.props

        if(location) {
            return this.handleLocationTabsChange
        }

        return onChange
    }

    getActiveKey = () => {
        const {
            content = [],
            location,
            activeKey,
            queryKey,
        } = this.props

        if(location) {
            return _.get(location, ['query', queryKey], _.get(content, [0, 'tabKey'], ''))
        }

        return activeKey
    }

    render() {
        const activeKey = this.getActiveKey()

        return (
            <Tabs
                {...this.props}
                activeKey={activeKey}
                onChange={this.getOnChange()}
                renderTabBar={this.renderTabBar}
                tabBarExtraContent={this.tabBarExtraContent(activeKey)}
            >
                {
                    this.renderTabPanesContent(activeKey)
                }
            </Tabs>
        )

    }
}
