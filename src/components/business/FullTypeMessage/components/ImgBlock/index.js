/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/18
 */

import React, {PureComponent} from 'react'
import ImgManager from "components/ImgManager"
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from "./index.less"

class ImgBlock extends PureComponent {
    static displayName = 'leoUi-ImgBlock'

    static propTypes = {
        className: PropTypes.string,
    }

    static defaultProps = {
        className: '',
    }

    render() {
        const {
            imgSrc,
            className,
            ...otherProps
        } = this.props

        return (
            <ImgManager
                imgSrc={imgSrc}
                render={(imgSrc, imgState) => {
                    if(imgState === 'load') {
                        return (
                            <img
                                {...otherProps}
                                className={classNames(styles.img, className)}
                                decoding="async"
                                src={imgSrc}
                                alt="img"
                            />
                        )
                    }
                    if(imgState === 'error') {
                        return (
                            <img
                                className={classNames(styles.img, className)}
                                src={require('./images/error.svg')}
                                alt="error"
                            />
                        )
                    }else {
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
