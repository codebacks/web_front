/**
 **@Description:
 **@author: leo
 */

import InnerSiderMenu from 'components/SiderMenu/InnerSiderMenu'
import PropTypes from 'prop-types'
import React, {PureComponent} from 'react'
import {formatter} from 'components/SiderMenu/menu'
import {Spin} from 'antd'
import styles from './index.less'
import menuData from 'wx/common/menu'

export default class SiderMenu extends PureComponent {
    static propTypes = {
        location: PropTypes.object.isRequired,
    };

    componentDidMount() {
    }

    render() {
        const {location} = this.props
        return (
            menuData.length ?
                <InnerSiderMenu menuData={formatter(menuData)} location={location}/>
                :
                <div className={styles.loadingWarp}><Spin className={styles.loading}/></div>
        )
    }
}
