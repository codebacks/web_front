import React from 'react'
import { Layout, Menu, Icon  } from 'antd'
import styles from './left.less'

const { Sider } = Layout


export default class Left extends React.PureComponent {
    render(){
        return (
            <Sider className={styles.sider}>
                <Menu
                    mode="inline"
                    className={styles.menu}
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
                    style={{ height: '100%' }}
                >
                    <Menu.Item disabled={true} className={styles.topic}><span>营销平台</span></Menu.Item>
                    <Menu.Item><span><Icon type="user" />小红包</span></Menu.Item>
                    <Menu.Item><span><Icon type="user" />新码</span></Menu.Item>
                    <Menu.Item disabled={true} className={styles.topic}><span>营销平台</span></Menu.Item>
                    <Menu.Item><span><Icon type="user" />小红包</span></Menu.Item>
                    <Menu.Item><span><Icon type="user" />小红包</span></Menu.Item>
                </Menu>
            </Sider>
        )
    }
}