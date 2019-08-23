/**
 * 扩展 ant design Icon 组件, 支持自定义的字体
 */
import React from 'react'
import {Icon} from 'antd'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './index.less'

function getHZComponent(name) {
    try {
        return require(`assets/new_icons/${name}`).default
    }catch(e) {
        return null
    }
}

function getHZCategoryIconComponent(name) {
    try {
        return require(`assets/category_icons/${name}`).default
    }catch(e) {
        return null
    }
}

export default class HzIcon extends React.PureComponent {
    static propTypes = {
        type: PropTypes.string.isRequired,
    }

    render() {
        const {type, spin, className = '', ...other} = this.props
        if(type.indexOf('HZC-') === 0) {
            const cls = classNames(styles.icon, className)
            const component = getHZCategoryIconComponent(type.slice(4))
            if(component){
                return (
                    <Icon
                        component={component}
                        className={cls}
                        {...other}
                    />
                )
            }else {
                return null
            }
        }else if(type.indexOf('HZ-') === 0) {
            const cls = classNames(styles.icon, className)
            const component = getHZComponent(type.slice(3))
            if(component){
                return (
                    <Icon
                        component={component}
                        className={cls}
                        {...other}
                    />
                )
            }else {
                return null
            }
        }else if(type.indexOf('img-') === 0) {
            const cls = classNames(styles.icon, className)
            return (
                <img
                    alt={'icon'}
                    src={require(`assets/icons/${type.slice(4)}`)}
                    className={cls}
                    {...other}
                />
            )
        }else if(type.indexOf('ex-') === 0) {
            const cls = classNames('anticon', className, `icon-${type.slice(3)}`, {
                'animate-spin': spin,
            })
            return <i className={cls} {...other} />
        }else {
            return <Icon {...this.props} />
        }
    }
}
