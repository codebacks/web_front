/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/1/14
 */

import React from 'react'
import {
    Input,
    Form,
} from 'antd'
import styles from './index.less'
import PropTypes from "prop-types"

@Form.create()
export default class extends React.PureComponent {
    static propTypes = {
        placeholder: PropTypes.string,
        validator: PropTypes.func.isRequired,
        beforeSetState: PropTypes.func,
    }

    static defaultProps = {
        placeholder: '请输入内容，按回车添加',
        validator: ({item, rule, value, callback}) => {
            if(!value) {
                callback('必填')
                return
            }

            if(item.values.indexOf(value) > -1) {
                callback('不能重复')
                return
            }

            callback()
        },
    }

    handleSubmit = (e) => {
        e && e.preventDefault()
        this.props.form.validateFields({force: true}, (err, values) => {
            if(!err) {
                const {
                    item,
                    setFilterContentState,
                    beforeSetState,
                } = this.props
                if(beforeSetState) {
                    values = beforeSetState(values)
                }

                item.values.push(values.value)
                setFilterContentState(item)
            }
        })
    }

    validator = (rule, value, callback) => {
        const {
            validator,
            item,
        } = this.props
        validator({item, rule, value, callback})
    }

    render() {
        const {
            placeholder,
            form,
        } = this.props

        const {getFieldDecorator} = form

        const formItemLayout = {
            wrapperCol: {span: 18},
        }

        return (
            <div>
                <Form.Item
                    {...formItemLayout}
                    className={styles.formItem}
                >
                    {
                        getFieldDecorator('value', {
                            rules: [
                                {
                                    validator: this.validator,
                                },
                            ],
                            initialValue: '',
                        })(
                            <Input
                                onPressEnter={this.handleSubmit}
                                placeholder={placeholder}
                            />,
                        )
                    }
                </Form.Item>
            </div>
        )
    }
}

