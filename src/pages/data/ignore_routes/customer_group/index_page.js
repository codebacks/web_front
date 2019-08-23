import React from 'react'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import Page from '../../../../components/business/Page'
import router from 'umi/router'
import { Icon, Modal } from 'antd'
import DropDown from '../../components/DropDown'
import CustomerDetails from './modal/CustomerDetails.js'
import CustomerGroup from './components/CustomerGroup'
import styles from './index.less'

const confirm = Modal.confirm

@documentTitleDecorator()
@connect(({ base, customer_group }) => ({
    base, customer_group
}))

export default class Index extends React.Component {
    state = {
        customerId: '',
        visible: false,
        customerDetailsTitle: '',
    }

    componentDidMount() {
        this.getUserGroupings()
    }

    getUserGroupings = () => {
        this.props.dispatch({
            type: 'customer_group/userGroupings',
            payload: {},
            callback: (res) => {}
        })
    }

    onClickAdd = () => { 
        router.push('/data/customer_group/new_group')
    }

    // 删除自定义分组
    onDeleteGroup = (id, name) => {
        confirm({
            title: '确认删除？',
            content: name,
            centered: true,
            maskClosable: true,
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                this.onDeleteGroupDispatch(id)
            },
            onCancel() {
            //   console.log('Cancel')
            },
        })
    }

    onDeleteGroupDispatch = (id) => {
        this.props.dispatch({
            type: 'customer_group/deleteGroupings',
            payload: {
                id: id
            },
            callback: () => {
                const {customData} = this.props.customer_group
                for (let [i, v] of customData.entries()) {
                    if (v.id === id) {
                        customData.splice(i, 1)
                        break
                    }
                }
                this.props.dispatch({
                    type: 'customer_group/setProperty',
                    payload: {
                        customData: customData
                    }
                })
            }
        })
    }

    handleCancel = () => {
        this.setState({
            visible: false
        })
    }

    onCustomerDetails = (id, title) => {
        this.setState({
            visible: true,
            customerId: id,
            customerDetailsTitle: title,
        })
    }

    onStopPropagation = (e) => {
        e.stopPropagation()
    }
    
    render () {
        const {systemData, customData} = this.props.customer_group
        const {customerId, visible, customerDetailsTitle} = this.state

        const customCustomerGroup = customData.map((value, index) => <CustomerGroup key={index} data={value} onCustomerDetails={this.onCustomerDetails} onStopPropagation={this.onStopPropagation} onDeleteGroup={this.onDeleteGroup}/>)

        const systemGroup = systemData.map((value, index) => <CustomerGroup key={index} data={value} onCustomerDetails={this.onCustomerDetails} onStopPropagation={this.onStopPropagation} onDeleteGroup={this.onDeleteGroup}/>)

        return (
            <Page>
                <Page.ContentHeader
                    title={this.props.documentTitle}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E6%95%B0%E6%8D%AE%E4%B8%AD%E5%BF%83/%E5%AE%A2%E6%88%B7%E5%88%86%E6%9E%90.md"
                />
                <div className={styles.topTip}>客户数据每天凌晨更新{systemData[0]&&systemData[0]['updated_at']?'，最近更新时间为'+systemData[0]['updated_at']:''}。</div>
                <DropDown title='自定义模型' className={styles.DropDownGroup}>
                    {customCustomerGroup}

                    {customData && customData.length < 20 &&
                        <div className={styles.newGroup} onClick={this.onClickAdd}>
                            <div className={styles.newNode}>
                                <div><Icon type="plus" style={{fontSize: 40}} /></div>
                                <div className={styles.newTitle}>新建模型</div>
                            </div> 
                        </div>
                    }
                </DropDown>
                <DropDown style={{paddingBottom: 100}} title='系统推荐' className={styles.DropDownGroup}>
                    {systemGroup}
                </DropDown>
                <CustomerDetails
                    key={'CustomerDetails' + customerId}
                    id={customerId}
                    visible={visible}
                    title={customerDetailsTitle}
                    handleCancel={this.handleCancel}
                    {...this.props}
                />
            </Page>
        )
    }
}