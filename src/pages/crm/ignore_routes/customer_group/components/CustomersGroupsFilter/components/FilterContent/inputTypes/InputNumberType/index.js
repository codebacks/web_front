/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/1/14
 */

import React from 'react'
import {
    Form,
    Button,
} from 'antd'
import RangeInputNumber from 'components/RangeInputNumber'
import styles from './index.less'
import PropTypes from "prop-types"

@Form.create()
export default class extends React.PureComponent {
    static propTypes = {
        validator: PropTypes.func.isRequired,
        beforeSetState: PropTypes.func,
        afterRender: PropTypes.func,
    }

    static defaultProps = {
        validator: ({item, rule, value, callback}) => {
            if(!value) {
                callback('必填')
                return
            }

            if(typeof value[0] === 'undefined' || typeof value[1] === 'undefined') {
                callback('必填')
                return
            }

            if(value[0] > value[1]) {
                callback('前面的值不能大于后面的值')
                return
            }

            if(item.values.indexOf(value.join(',')) > -1) {
                callback('不能重复')
                return
            }

            callback()
        },
        beforeSetState: (values) => {
            values.value = values.value.join(',')
            return values
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

        validator({
            item,
            rule,
            value,
            callback,
        })
    }

    render() {
        const {
            form,
            afterRender,
        } = this.props

        const {
            getFieldDecorator,
        } = form

        const formItemLayout = {
            wrapperCol: {span: 24},
        }

        return (
            <div className={styles.content}>
                <Form.Item
                    {...formItemLayout}
                    className={styles.box}
                >
                    {
                        getFieldDecorator('value', {
                            rules: [
                                {
                                    validator: this.validator,
                                },
                            ],
                            initialValue: [],
                        })(
                            <RangeInputNumber
                                min={0}
                            />,
                        )
                    }
                </Form.Item>
                {
                    afterRender && (
                        <span className={styles.afterRender}>
                            {afterRender()}
                        </span>
                    )
                }
                <Button
                    type="primary"
                    onClick={this.handleSubmit}
                    icon="plus"
                    className={styles.addBtn}
                >
                    添加
                </Button>
            </div>
        )
    }
}

