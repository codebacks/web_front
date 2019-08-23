/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import {message, Form} from 'antd'
import hooksModalDecorator from 'hoc/hooksModal'
import {hot} from 'react-hot-loader'
// import styles from './index.less'
import DepartmentSelect from "business/DepartmentSelect"
import UserSelect from "business/UserSelect"

const FormItem = Form.Item

@hot(module)
@hooksModalDecorator({
    setModalOption: ({highestOption, modalStateOption, modalOption, option, props, state}) => {
        return {
            ...option,
            ...modalOption,
            ...modalStateOption,
            ...highestOption,
            ...{
                title: '设备保管者',
                width: 520,
                destroyOnClose: true,
                maskClosable: false,
                confirmLoading: props.switchUserLoading,
            },
        }
    },
})
export default class Index extends React.Component {
    constructor(props) {
        super(props)
        props.setModalOkFn(this.handleOk)
        this.state = {
            params: {
                department_id: undefined,
                user_id: undefined,
            },
        }
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    handleOk = (e) => {
        e.preventDefault()
        const {user_id} = this.state.params
        if (!user_id) {
            message.error('请选择接收者')
            return
        }

        this.props.dispatch({
            type: 'risk_control_deviceManagement/switchUser',
            payload: {
                body: {
                    id: this.props.record.id,
                    user_id: Number(user_id),
                },
            },
            callback: () => {
                message.success('转移成功')
                this.props.goPage()
                this.handleCancel()
            },
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.state.params}
        params[key] = val

        if (key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        }else if (key === 'user_id') {
            params['uin'] = undefined
        }

        this.setState({
            params,
        })
    }

    handleCancel = () => {
        this.props.onModalCancel()
    }

    render() {
        const {
            params = {},
        } = this.state

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        }

        return (
            <Form layout={'horizontal'} {...formItemLayout}>
                <FormItem label={'所属部门'} required={false}>
                    <DepartmentSelect
                        departmentId={params.department_id}
                        onChange={(value) => {
                            this.handleChange('department_id', value)
                        }}
                    />
                </FormItem>
                <FormItem label={'设备保管者'} required={false}>
                    <UserSelect
                        departmentId={params.department_id}
                        userId={params.user_id}
                        onChange={(value) => {
                            this.handleChange('user_id', value)
                        }}
                    />
                </FormItem>
            </Form>
        )
    }
}
