import InnerSiderMenu from 'components/SiderMenu/InnerSiderMenu'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { formatter } from 'components/SiderMenu/menu'
import { Spin } from 'antd'
import styles from './index.scss'
import menuData from "crm/common/menu"

export default class SiderMenu extends PureComponent {
    static propTypes = {
        location: PropTypes.object.isRequired,
    };

    componentDidMount() {
        // this.props.dispatch({
        //     type: 'demo_base/querySiderMenu',
        //     payload: {},
        // })
    }

    render() {
        const { location, crm_base } = this.props
        // const menuData = demo_base.menuData;
        return (
            menuData.length ?
                <InnerSiderMenu menuData={formatter(menuData)} location={location} />
                :
                <div className={styles.loadingWarp}><Spin className={styles.loading} /></div>
        )
    }
}
