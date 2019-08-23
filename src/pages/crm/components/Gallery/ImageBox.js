/**
 * 图片显示
 */

import React, {Component} from 'react'

import style from './style.scss'
import Icon from '../Icon/index'

// 注意, 此组件在外使用到 ref, 因此必须从 Component 继承方式, 否则拿不到 dom 节点
export default class extends Component {
    render() {
        const props = this.props
        let loading
        let content
        const inline = {}
        if (props.loading) {
            loading = (
                <div className={style.tip}>
                    <Icon type="ex-loading" className={`animate-spin ${style.loading}`}/>
                </div>
            )
            inline.opacity = .6
        }
        if (props.error) {
            if (!props.loading) {
                content = (
                    <div className={style.tip} style={inline}>
                        <span className={style.error}>载入图片失败</span>
                    </div>
                )
            }
        } else {
            inline.width = props.width
            inline.height = props.height
            inline.top = props.top
            inline.left = props.left
            inline.transform = `rotate(${props.rotate}deg)`
            content = <img src={props.src} style={inline}/>
        }
        return (
            <div className={style.content}>
                <div className={style.image}>
                    {content}
                    {loading}
                </div>
            </div>
        )
    }
}
