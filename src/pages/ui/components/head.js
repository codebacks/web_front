import React from 'react'
import {Layout, Icon, Menu, Dropdown} from 'antd'
import router from 'umi/router'
import Link from 'umi/link'
import styles from './head.less'

const {Header} = Layout

export default class Head extends React.PureComponent {

    onMenuClick = ({key}) => {
        if(key === 'logout') {
            this.logout()
        }else if(key === 'setting') {
            router.push('/setting/index')
        }
    }

    logout = () => {
        this.props.dispatch({
            type: 'login/logout',
            payload: {},
        })
    }

    render(){

        const menu = (
            <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
                {/*<Menu.Item key="setting">*/}
                {/*<Icon type="user"/>个人中心*/}
                {/*</Menu.Item>*/}
                <Menu.Item key="logout">
                    <Icon type="logout"/>退出登录
                </Menu.Item>
            </Menu>
        )

        return (
            <Header className={styles.header}>
                <div className={styles.logo}>
                    <Link
                        to="/home"
                        title="前往首页"
                    >
                        <img src='//image.yiqixuan.com/retail/logo/51-logo_x160.png' alt="虎赞" />
                    </Link>
                </div>
                <Menu
                    mode="horizontal"
                    defaultSelectedKeys={['2']}
                    style={{ lineHeight: '60px' }}
                >
                    <Menu.Item key="1">首页</Menu.Item>
                    <Menu.Item key="2">客户管理</Menu.Item>
                    <Menu.Item key="3">商城管理</Menu.Item>
                    <Menu.Item key="4">个人号</Menu.Item>
                    <Menu.Item key="5">营销平台</Menu.Item>
                </Menu>
                <div className={styles.right}>
                    <Dropdown overlay={menu}>
                        <span className={`${styles.action} ${styles.account}`}>
                            <span className={styles.name}>小懒猫</span>
                            <Icon style={{fontSize: 16}} type="down"/>
                        </span>
                    </Dropdown>
                </div>
            </Header>
        )
    }
}