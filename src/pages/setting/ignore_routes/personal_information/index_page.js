/**
 **@Description:
 **@author: leo
 */

import React, {Component} from 'react'
import {connect} from 'dva'
import {
    Row,
    Col,
    Button,
    Divider,
} from 'antd'
import _ from 'lodash'
import ContentHeader from 'business/ContentHeader'
import Page from '@/components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import ModalForm from 'setting/components/ModalForm'
import ChangePassword from './components/ChangePassword'
import ChangePhone from './components/ChangePhone'
import styles from "./index.less"

@connect(({setting_personalInformation, base}) => ({
    setting_personalInformation,
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
            changePasswordProp: {
                visible: false,
            },
            changePhoneProp: {
                visible: false,
            },
        }
    }

    changePhoneCancel = () => {
        const {changePhoneProp} = this.state
        this.setState({
            changePhoneProp: {
                ...changePhoneProp,
                visible: false,
            },
        })
    }

    changePasswordCancel = () => {
        const {changePasswordProp} = this.state
        this.setState({
            changePasswordProp: {
                ...changePasswordProp,
                visible: false,
            },
        })
    }

    changePassword = () => {
        this.setState({
            changePasswordProp: {
                visible: true,
            },
        })
    }

    changePhone = () => {
        this.setState({
            changePhoneProp: {
                visible: true,
            },
        })
    }

    changeName = () => {
        let modalFormProp = {
            visible: true,
            label: '姓名',
            title: '修改姓名',
            placeholder: '修改姓名',
            validateRe: {
                pattern: /^.{2,20}$/,
                message: '限2-20个字',
            },
            initialValue: _.get(this, 'props.base.initData.user.nickname', ''),
            data: {
                actionName: 'changeName',
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

    handleCreate = () => {
        const {form, data} = this.formRef.props

        form.validateFields((err, values) => {
            if (err) {
                return
            }

            if (data.actionName === 'changeName') {
                this.props.dispatch({
                    type: 'setting_personalInformation/updateMe',
                    payload: {
                        nickname: values.name,
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

    renderDepartments = (initData) => {
        let departments = _.get(initData, 'user.departments', [])
        if (departments.length) {
            const last = departments.length - 1
            return departments.map((item, i) => {
                return (
                    <span
                        key={`${item.id}`}
                        style={{marginRight: '6px'}}
                    >
                        {item.name}{item.in_charge && `(负责人)`}
                        {last !== i && ','}
                    </span>
                )
            })
        }else {
            return _.get(initData, 'company.name', '')
        }
    }

    getRole = (initData) => {
        if (_.get(initData, 'user.is_creator')) {
            return '创建者'
        }

        if (_.get(initData, 'user.type') === 1) {
            return '管理员'
        }

        let roleName = _.get(initData, 'user.role.name')
        if (roleName) {
            return roleName
        }

        return ''
    }

    render() {
        const {initData} = this.props.base
        let canChange = true
        if(_.get(initData, 'user.is_creator')){
            if(Number(_.get(initData, 'company.product_version.id', 'not find')) === 0){
                canChange = false
            }else {
                if(_.get(initData, 'company.name').trim() === ''){
                    canChange = false
                }
            }
        }

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
                    <Row className={styles.formRow}>
                        <span className={styles.formLeft}>
                            公司：
                        </span>
                        {_.get(initData, 'company.name', '')}
                    </Row>
                    <Row className={styles.formRow}>
                        <span className={styles.formLeft}>
                            账号：
                        </span>
                        {_.get(initData, 'user.username', '')}
                    </Row>
                    <Row className={styles.formRow}>
                        <Button type={'primary'} className={styles.rightBtn} onClick={this.changePassword}>
                            修改密码
                        </Button>
                        {
                            canChange && (
                                <Button onClick={this.changePhone}>
                                    修改手机账号
                                </Button>
                            )
                        }
                    </Row>
                    <Divider className={styles.divider}/>
                    <Row className={styles.formRow}>
                        <span>姓名：{_.get(initData, 'user.nickname', '')}</span>
                        {
                            canChange && (
                                <span className={styles.rightChange} onClick={this.changeName}>
                                    修改
                                </span>
                            )
                        }
                    </Row>
                    <Row className={styles.formRow}>
                        <Col span={24} className={styles.formLeft}>
                            岗位：{this.getRole(initData)}
                        </Col>
                    </Row>
                    <Row className={styles.formRow}>
                        <Col span={24} className={styles.formLeft}>
                            部门：{this.renderDepartments(initData)}
                        </Col>
                    </Row>
                </div>
                <ModalForm
                    wrappedComponentRef={this.saveFormRef}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    {...this.state.modalFormProp}
                />
                <ChangePassword
                    onCancel={this.changePasswordCancel}
                    dispatch={this.props.dispatch}
                    {...this.state.changePasswordProp}
                />
                <ChangePhone
                    onCancel={this.changePhoneCancel}
                    dispatch={this.props.dispatch}
                    {...this.state.changePhoneProp}
                />
            </Page>
        )
    }
}
