/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import {Layout} from 'antd'
import SiderMenu from 'components/SiderMenu'
import PropTypes from 'prop-types'
import styles from './index.less'
import {matchGlobalPagePaths} from 'utils'

const {Sider} = Layout

export default class PageLayout extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node.isRequired,
        base: PropTypes.object.isRequired,
        hasSider: PropTypes.bool,
        isAutoScroll: PropTypes.bool,
    }

    static defaultProps = {
        hasSider: true,
        isAutoScroll: false,
    }

    render() {
        const {children, base, hasSider, isAutoScroll, location} = this.props

        if(matchGlobalPagePaths(location.pathname)) {
            return children
        }

        return (
            <Layout>
                {
                    hasSider && (
                        <div style={{height: '100%', position: 'relative'}} className={styles.siderWrap}>
                            <Sider
                                width={200}
                                className={styles.sider}
                                style={{
                                    height: base.winHeight - base.headerHeight,
                                }}
                                collapsed={false}
                            >
                                <SiderMenu {...this.props}/>
                            </Sider>
                            <div id="side-tip-box"></div>
                        </div>
                    )
                }
                <Layout className={isAutoScroll && styles.autoScroll}>
                    {children}
                </Layout>
            </Layout>
        )
    }
}
