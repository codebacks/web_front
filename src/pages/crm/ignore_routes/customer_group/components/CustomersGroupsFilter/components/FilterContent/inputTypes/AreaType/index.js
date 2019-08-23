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
import AreaChoose from '../../components/AreaChoose'
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

            const val = value.map(item => item.label || '').join(',')

            if(item.values.indexOf(val) > -1) {
                callback('不能重复')
                return
            }

            callback()
        },
        beforeSetState: (values) => {
            values.value = values.value.map(item => item.label || '').join(',')

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
                            <AreaChoose/>,
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

