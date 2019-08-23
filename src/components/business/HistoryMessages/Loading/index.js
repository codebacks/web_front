import React from 'react'
import {Icon} from 'antd'
import PropTypes from 'prop-types'
import styles from './index.less'

function Loading(props) {
    return (
        <div
            className={styles.loading}
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

export default Loading
