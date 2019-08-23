/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/18
 */

import React, {PureComponent} from 'react'
import {Icon} from 'antd'
import ImgManager from "components/ImgManager"
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from "./index.less"

class ImgBlock extends PureComponent {
    static displayName = 'leoUi-ImgBlock'

    static propTypes = {
        className: PropTypes.string,
        decoding: PropTypes.string,
    }

    static defaultProps = {
        className: '',
        decoding: 'async',
    }

    render() {
        const {
            src,
            className,
            ...otherProps
        } = this.props

        return (
            <ImgManager
                imgSrc={src}
                render={(imgSrc, imgState) => {
                    if (imgState === 'load') {
                        return (
                            <img
                                {...otherProps}
                                className={classNames(styles.img, className)}
                                src={src}
                            />
                        )
                    }else if (imgState === 'error') {
                        return (
                            <img
                                className={classNames(styles.img, className)}
                                src={require('./images/error.svg')}
                                alt="error"
                            />
                        )
                    }else if (imgState === 'loading') {
                        return (
                            <div className={classNames(styles.loading, className)}>
                                <Icon type="loading" className={styles.icon}/>
                            </div>
                        )
                    }else if (imgState === 'init') {
                        return (
                            <img
                                className={classNames(styles.img, className)}
                                src={require('./images/defaultImg.svg')}
                                alt="default"
                            />
                        )
                    }
                }}
            />
        )
    }
}

export default ImgBlock
