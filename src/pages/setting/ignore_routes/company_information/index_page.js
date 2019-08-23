/**
 **@Description:
 **@author: leo
 */

import React, {Component} from 'react'
import {connect} from 'dva'
import {
    Row,
    Col,
} from 'antd'
import _ from 'lodash'
import moment from 'moment'
import Page from '@/components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import ModalForm from 'setting/components/ModalForm'
import ChangeContact from './components/ChangeContact'
import styles from "./index.less"
import ContentHeader from 'business/ContentHeader'

@connect(({setting_companyInformation, base}) => ({
    setting_companyInformation,
    base,
}))
@documentTitleDecorator()
export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modalFormProp: {
                label: '',
                title: '',
                visible: false,
            },
            changeContactProp: {
                visible: false,
            },
        }
    }

    changeContactCancel = () => {
        const {changeContactProp} = this.state
        this.setState({
            changeContactProp: {
                ...changeContactProp,
                visible: false,
            },
        })
    }

    changeContact = () => {
        this.setState({
            changeContactProp: {
                visible: true,
                contact_name: _.get(this, 'props.base.initData.company.contact_name', ''),
                contact_mobile: _.get(this, 'props.base.initData.company.contact_mobile', ''),
            },
        })
    }

    checkName = (rule, value, callback) => {
        const reg = /\s+/
        if (reg.test(value)) {
            callback('不允许输入空格')
            return
        }else if (value && value.length > 32) {
            callback('长度限制32字')
            return
        }
        callback()
    }

    changeName = () => {
        let modalFormProp = {
            visible: true,
            label: '公司名称',
            title: '公司名称',
            placeholder: '限32个字内',
            validateRe: {
                validator: this.checkName,
            },
            initialValue: _.get(this, 'props.base.initData.company.name', ''),
            data: {
                actionName: 'update',
            },
        }
        this.setState({modalFormProp})
    }

    saveFormRef = (formRef) => {
        this.formRef = formRef
    }

    handleCancel = () => {
        const {modalFormProp} = this.state

        this.setState({
            modalFormProp: {
                ...modalFormProp,
                visible: false,
            },
        }, () => {
            this.formRef.props.form.resetFields()
        })
    }

    handleCreate = (e) => {
        const {form, data} = this.formRef.props

        form.validateFields((err, values) => {
            if (err) {
                return
            }

            if (data.actionName === 'update') {
                this.props.dispatch({
                    type: 'setting_companyInformation/update',
                    payload: {
                        name: values.name,
                    },
                    callback: () => {
                        this.props.dispatch({
                            type: 'base/getInitData',
                        })

                        this.handleCancel()
                    },
                })
            }
        })
    }

    render() {
        const {initData} = this.props.base
        const isStaff = Number(_.get(initData, 'user.type')) === 0
        const is_creator = _.get(initData, 'user.is_creator')
        const isBasicVersion = _.get(initData, 'company.product_version.id') === 10

        return (
            <Page>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E7%B3%BB%E7%BB%9F%E8%AE%BE%E7%BD%AE/%E4%BF%A1%E6%81%AF.md',
                    }}
                />
                <div className={styles.content}>
                    <Row className={styles.title}>
                        <Col span={8} className={styles.col}>
                            <div className={styles.box}>
                                <div className={styles.item}>
                                    当前套餐
                                </div>
                                <div className={`${styles.item} ${styles.extrude}`}>
                                    {/*{_.get(initData, 'company.product_version.name', '')}*/}
                                    {
                                        initData?.company?.product_version?.name ?? ''
                                    }
                                </div>
                                {
                                    !isBasicVersion && (
                                        <div>
                                            到期时间：{_.get(initData, 'company.expire_in', '')}
                                        </div>
                                    )
                                }
                            </div>
                        </Col>
                        {/*<Col span={6} className={styles.col}>*/}
                        {/*<div className={styles.item}>*/}
                        {/*剩余短信（条）*/}
                        {/*</div>*/}
                        {/*<div className={styles.item}>*/}
                        {/*100,000*/}
                        {/*/!*<Button>购买</Button>*!/*/}
                        {/*</div>*/}
                        {/*</Col>*/}
                        <Col span={8} className={styles.col}>
                            <div className={styles.centerBox}>
                                <div className={styles.item}>
                                    微信号授权（个）
                                </div>
                                <div className={`${styles.item} ${styles.extrude}`}>
                                    {`${_.get(initData, 'status.used_wechat_count', 0)}/${_.get(initData, 'setting.wechat_count', 0)}`}
                                </div>
                            </div>
                        </Col>
                        <Col span={8} className={styles.col}>
                            <div className={styles.rightBox}>
                                <div className={styles.item}>
                                    工作群（个）
                                </div>
                                <div className={`${styles.item} ${styles.extrude}`}>
                                    {`${_.get(initData, 'status.synced_chat_room_count', 0)}/${_.get(initData, 'setting.sync_chat_room_count', 0)}`}
                                </div>
                            </div>
                        </Col>
                    </Row>
                    {
                        !isStaff && (
                            <React.Fragment>
                                <div className={styles.companyTitleBar}>
                                    <div className={styles.companyTitle}>公司基础信息</div>
                                </div>
                                <Row className={styles.formRow}>
                                    <span className={styles.formLeft}>
                                        公司名称： {_.get(initData, 'company.name', '')}
                                    </span>
                                    {/*{*/}
                                    {/*    is_creator && (*/}
                                    {/*        <span className={styles.rightBtn} onClick={this.changeName}>*/}
                                    {/*            修改*/}
                                    {/*        </span>*/}
                                    {/*    )*/}
                                    {/*}*/}
                                </Row>
                                <Row className={styles.formRow}>
                                    <span className={styles.formLeft}>
                                        联系人： {`${_.get(initData, 'company.contact_name', '')} ${_.get(initData, 'company.contact_mobile', '')}`}
                                    </span>
                                    {
                                        is_creator && (
                                            <span className={styles.rightBtn} onClick={this.changeContact}>
                                                修改
                                            </span>
                                        )
                                    }
                                </Row>
                                <Row className={styles.formRow}>
                                    <span className={styles.formLeft}>
                                        创建时间： {moment(_.get(initData, 'company.create_time', '') * 1000).format('YYYY-MM-DD HH:mm:ss')}
                                    </span>
                                </Row>
                            </React.Fragment>
                        )
                    }
                </div>
                <ModalForm
                    wrappedComponentRef={this.saveFormRef}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    {...this.state.modalFormProp}
                />
                <ChangeContact
                    onCancel={this.changeContactCancel}
                    dispatch={this.props.dispatch}
                    {...this.state.changeContactProp}
                />
            </Page>
        )
    }
}
