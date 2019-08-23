/**
 **@Description:
 **@author: leo
 */

import InnerSiderMenu, {getFlatMenuKeys} from './BaseMenu'
import PropTypes from 'prop-types'
import React, {PureComponent} from 'react'
import {Spin} from 'antd'
import styles from './index.less'
import config from 'config'

export default class SiderMenu extends PureComponent {
    static propTypes = {
        location: PropTypes.object.isRequired,
        base: PropTypes.object.isRequired,
        hiddenMenuForPath: PropTypes.array,
    }

    static defaultProps = {
        hiddenMenuForPath: config.hiddenMenuForPath,
    }

    getMenuData = () => {
        const {base, match} = this.props
        let menuData = []
        if(base.tree && base.tree.length) {
            const matchPath = match.path.trim()
            const findArr = base.tree.find(item => {
                return `/${item.slug}`.trim() === matchPath
            })

            if(findArr && findArr.children) {
                // menuData = findArr.children.map((item) => {
                //     return {
                //         name: item.name,
                //         icon: item.icon,
                //         path: item.url,
                //     }
                // })
                menuData = this.parseData(findArr)
            }
        }
        return menuData
    }

    parseData(data) {
        if(data.children) {
            return data.children.map((item) => {
                return {
                    key: item.slug,
                    name: item.name,
                    icon: item.icon,
                    path: item.url,
                    children: this.parseData(item),
                }
            })
        }
    }

    filterHiddenMenu = (menuData) => {
        const {hiddenMenuForPath} = this.props

        if(hiddenMenuForPath && hiddenMenuForPath.length) {
            menuData.forEach((item) => {
                if(hiddenMenuForPath.find((path) => {
                    return path === item.path
                })) {
                    item.hideInMenu = true
                }
            })
        }

        return menuData
    }

    render() {
        const {location} = this.props
        const menuData = this.filterHiddenMenu(this.getMenuData())

        return (
            menuData.length ?
                <InnerSiderMenu
                    menuData={menuData}
                    location={location}
                    flatMenuKeys={getFlatMenuKeys(menuData)}
                />
                : <div className={styles.loadingWarp}><Spin className={styles.loading}/></div>
        )
    }
}
