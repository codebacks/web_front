/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/11/7
 */
import ReactDOM from 'react-dom'
import React, {PureComponent} from 'react'
import {Menu} from 'antd'
import {connect} from 'dva'
import pathToRegexp from 'path-to-regexp'
import {Link} from 'dva/router'
import styles from './index.less'
import {urlToList} from '../../utils/index'
import Icon from 'components/Icon'
import memoizeOne from 'memoize-one'
import _ from 'lodash'
import {getNavNewFeature, readNewFeature} from '../../common/version'

const {ItemGroup} = Menu

const getIcon = (icon, selected) => {
    if(typeof icon === 'string' && icon !== '') {
        if(icon.indexOf('http') === 0) {
            return <img src={icon} alt="icon" className={`${styles.icon} sider-menu-item-img`}/>
        }
        // let className = ''
        // if(selected) {
        //     className = styles.iconActive
        // }
        return <Icon type={icon} className={styles.iconSvg}/>
    }
    
    return <Icon type={"HZ-overview.svg"} className={styles.iconSvg}/>
    // return icon
}

export const getMenuMatches = (flatMenuKeys, path) =>
    flatMenuKeys.filter(item => {
        if(item) {
            return pathToRegexp(item).test(path)
        }
        return false
    })

const getDefaultCollapsedSubMenus = props => {
    const {
        location: {pathname},
        flatMenuKeys,
    } = props
    return urlToList(pathname).map(item => {
        return getMenuMatches(flatMenuKeys, item)[0]
    }).filter(item => item)
}

export const getFlatMenuKeys = menuData => {
    let keys = []
    menuData.forEach(item => {
        if(item.children) {
            keys = keys.concat(getFlatMenuKeys(item.children))
        }
        keys.push(item.path)
    })
    return keys
}

@connect(({base}) => ({
    base,
}))
export default class SiderMenu extends PureComponent {
    constructor(props) {
        super(props)
        this.getSelectedMenuKeys = memoizeOne(this.getSelectedMenuKeys, _.isEqual)

        this.state = {
            openKeys: getDefaultCollapsedSubMenus(props),
        }
    }

    static getDerivedStateFromProps(props, state) {
        const {pathname} = state
        if(props.location.pathname !== pathname) {
            return {
                pathname: props.location.pathname,
                openKeys: getDefaultCollapsedSubMenus(props),
            }
        }
        return null
    }

    getMenuItemPath = (item, selectedKeys) => {
        const {initData} = this.props.base
        const userID = _.get(initData, 'user.account_id', '')

        const itemPath = this.conversionPath(item.path)
        const selected = selectedKeys.indexOf(item.path) > -1
        const icon = getIcon(item.icon, selected)
        const {target, name} = item
        if(/^https?:\/\//.test(itemPath)) {
            return (
                <a href={itemPath} target={target}>
                    {icon}
                    <span>{name}</span>
                </a>
            )
        }
        
        return (
            <NewFeatureNav
                item={item}
                userID={userID}
                to={itemPath}
                target={target}
                replace={itemPath === this.props.location.pathname}
                onClick={
                    this.props.isMobile
                        ? () => {
                            this.props.onCollapse(true)
                        }
                        : undefined
                }
            >
                {icon}
                <span>{name}</span>
            </NewFeatureNav>
        )
    }

    getSubMenuOrItem = (item, selectedKeys) => {
        if(item.children && item.children.some(child => child.name)) {
            const childrenItems = this.getNavMenuItems(item.children, selectedKeys)
            if(childrenItems && childrenItems.length > 0) {
                return (
                    <ItemGroup
                        title={
                            item.icon || true ? (
                                <span>
                                    {getIcon(item.icon)}
                                    <span className={styles.menuItem}>{item.name}</span>
                                </span>
                            ) : (
                                item.name
                            )
                        }
                        className={styles.groupTitle}
                        key={item.key}
                    >
                        {childrenItems}
                    </ItemGroup>
                )
            }
            return null
        }else {
            return (
                <Menu.Item
                    key={item.path}
                    className={styles.menuItem}
                >
                    {this.getMenuItemPath(item, selectedKeys)}
                </Menu.Item>
            )
        }
    }

    getNavMenuItems = (menusData, selectedKeys) => {
        if(!menusData) {
            return []
        }
        return menusData.filter(item => item.name && !item.hideInMenu).map(item => {
            const ItemDom = this.getSubMenuOrItem(item, selectedKeys)
            return this.checkPermissionItem(item.authority, ItemDom)
        }).filter(item => item)
    }

    getSelectedMenuKeys = (pathname) => {
        const {flatMenuKeys} = this.props
        return urlToList(pathname).map(itemPath => getMenuMatches(flatMenuKeys, itemPath).pop())
    }

    conversionPath = path => {
        if(path && path.indexOf('http') === 0) {
            return path
        }else {
            return `/${path || ''}`.replace(/\/+/g, '/')
        }
    }

    checkPermissionItem = (authority, ItemDom) => {
        if(this.props.Authorized && this.props.Authorized.check) {
            const {check} = this.props.Authorized
            return check(authority, ItemDom)
        }
        return ItemDom
    }

    isMainMenu = key => {
        const {menuData} = this.props
        return menuData.some(item => {
            if(key) {
                return item.key === key || item.path === key
            }
            return false
        })
    }

    handleOpenChange = openKeys => {
        const moreThanOne = openKeys.filter(openKey => this.isMainMenu(openKey)).length > 1
        this.setState({
            openKeys: moreThanOne ? [openKeys.pop()] : [...openKeys],
        })
    }

    render() {
        const {
            collapsed,
            location: {pathname},
            menuData,
        } = this.props
        const {openKeys} = this.state

        const menuProps = collapsed
            ? {}
            : {
                openKeys,
            }

        let selectedKeys = this.getSelectedMenuKeys(pathname)
        if(!selectedKeys.length) {
            selectedKeys = [openKeys[openKeys.length - 1]]
        }

        return (
            <Menu
                className={styles.menu}
                key="Menu"
                mode="inline"
                theme="wi"
                {...menuProps}
                onOpenChange={this.handleOpenChange}
                selectedKeys={selectedKeys}
                style={{width: '100%', height: '100%'}}
            >
                {this.getNavMenuItems(menuData, selectedKeys)}
            </Menu>
        )
    }
}

class NewFeatureNav extends PureComponent {
    state = {
        tip: null,
    }

    menuItemClickHandler = (userID, item, tip) => {
        if(tip && userID) {
            readNewFeature(userID, tip)
            this.setState({
                tip: null,
            })
        }
    }

    getNavNewFeatureItem = (userID, item, parentRect) => {
        const tip = getNavNewFeature(userID, item.name)
        if(tip) {
            const node = <NewFeature>
                <div className={styles.newFeatureTip} style={{top: (parentRect.top - 60) + 'px', zIndex: '20'}}>
                    <div
                        className={styles.line}
                        // style={{left: "-32px", top: '16px'}}
                        style={{left: '0px', top: '0px'}}
                    >
                        <span></span>
                    </div>
                    <div className={styles.con}>
                        <span className={styles.tag}></span>
                        <span>{tip.message}</span>
                    </div>
                </div>
            </NewFeature>

            return {
                ...tip,
                node,
            }
        }
    }

    componentDidMount() {
        var rect = ReactDOM.findDOMNode(this).getBoundingClientRect()

        const {item, userID} = this.props
        if(userID) {
            const tip = this.getNavNewFeatureItem(userID, item, rect)
            this.setState({
                tip: tip,
            })
        }
    }

    render() {
        const {item, userID} = this.props
        const {tip} = this.state

        return <Link
            ref="element"
            to={this.props.to}
            target={this.props.target}
            replace={this.props.replace}
            onClick={() => {
                this.menuItemClickHandler(userID, item, tip)
            }}
        >
            {this.props.children}
            {
                tip && tip.node
            }
        </Link>
    }
}

class NewFeature extends PureComponent {
    constructor(props) {
        super(props)
        this.el = document.createElement('div')
    }

    componentDidMount() {
        document.getElementById('side-tip-box').appendChild(this.el)
    }

    componentWillUnmount() {
        document.getElementById('side-tip-box').removeChild(this.el)
    }

    render() {
        return ReactDOM.createPortal(
            this.props.children,
            this.el,
        )
    }
}