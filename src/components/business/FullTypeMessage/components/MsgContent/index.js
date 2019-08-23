/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/18
 */

import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import styles from "./index.less"
import createFaceHtml from "components/Face/createFaceHtml"
import {getThumbLimit} from '../../utils'

class ShowContent extends PureComponent {
    static displayName = 'leoUi-ShowContent'

    static propTypes = {
        type: PropTypes.number.isRequired,
        values: PropTypes.object.isRequired,
    }

    static defaultProps = {}

    getContent = (type, values = {}) => {
        switch(type) {
            case 1 :
                return (
                    createFaceHtml({
                        tagName: 'div',
                        values: values.content,
                    })
                )
            case 2 :
                return (
                    <img
                        className={styles.thumb}
                        src={values.media_url}
                        alt=""
                    />
                )
            case 3 :
                return (
                    <a
                        className={styles.video}
                        href={values.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                    />
                )
            case 4 :
                return (
                    <a
                        href={values.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {values.name}
                    </a>
                )
            case 5 :
                return (
                    <a
                        href={values.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {values.title}
                    </a>
                )
            case 6 :
                return (
                    <a
                        href={values.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {values.title || values.url}
                    </a>
                )
            case 7 :
                return (
                    <>
                        {values.title}
                    </>
                )
            case 8 :
                return (
                    <a
                        href={values.music_url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {values.title}
                    </a>
                )
            case 9 :
                return (
                    <>
                        {values.nickname}
                    </>
                )
            default:
                return null
        }
    }

    render() {
        const {
            type,
            values,
        } = this.props

        return (
            <div>
                {this.getContent(type, values)}
            </div>
        )
    }
}

export default ShowContent
