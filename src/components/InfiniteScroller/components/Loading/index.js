/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/15
 */
import React from 'react'
import styles from './index.less'
import {Icon} from "antd"
import PropTypes from "prop-types"

function Loading(props) {
    return (
        <div
            className={styles.spin}
            style={{
                display: props.loading ? 'flex' : 'none',
            }}
        >
            <Icon
                type="loading"
                style={{fontSize: 24}}
                spin
            />
        </div>
    )
}

Loading.defaultProps = {
    loading: false,
}

Loading.propTypes = {
    loading: PropTypes.bool,
}

export default React.memo(Loading)
