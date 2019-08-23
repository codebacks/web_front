/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/9/20
 *
 * createFaceHtml({tagName: 'div', tagProps: {className: styles.xxx}, values: text})
 *
 */

import React from 'react'
import utils from './utils'
import PropTypes from "prop-types"

export function FaceHtml(props) {
    const Tag = props.tagName
    let html = ''

    if(typeof props.values === 'string') {
        html = utils.wxToHtml(props.values, false)
    }

    if(typeof props.replace === 'function') {
        html = props.replace(html)
    }

    return (
        <Tag
            className={props.className}
            dangerouslySetInnerHTML={{
                '__html': html,
            }}
        />
    )
}

FaceHtml.defaultProps = {
    tagName: 'div',
}

FaceHtml.propTypes = {
    values: PropTypes.string,
    replace: PropTypes.func,
    className: PropTypes.string,
    tagName: PropTypes.string,
}

export default ({tagName = 'div', tagProps = {}, values = '', replace, children}) => {
    let html = ''

    if(typeof values === 'string') {
        html = utils.wxToHtml(values, false)
    }

    if(typeof replace === 'function') {
        html = replace(html)
    }

    tagProps.dangerouslySetInnerHTML = {__html: html}
    tagProps.style = Object.assign({
        'whiteSpace': 'pre-wrap',
    }, tagProps.style)

    return React.createElement(
        tagName,
        tagProps,
        children,
    )
}