/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import { Layout } from 'antd'
import Head from './components/head'
import Left from './components/left'
import styles from './style/index.less'
import {connect} from 'dva'

 
@connect(({base}) => ({
    base,
}))
export default class PageLayout extends React.PureComponent {
    getPageTitle() {
        return 'setting'
    }

    render() {
        const {children} = this.props

        return (
            <Layout className={styles.page}>
                <Head />
                <Layout className={styles.bodyer}>
                    <Left />
                    <Layout className={styles.container}>
                        {children}
                    </Layout>
                </Layout>
            </Layout>
        )
    }
}

