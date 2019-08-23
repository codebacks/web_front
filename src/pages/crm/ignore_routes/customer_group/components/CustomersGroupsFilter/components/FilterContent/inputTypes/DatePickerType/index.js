/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/1/14
 */

import React from 'react'
import {
    DatePicker,
    Form,
    Button,
} from 'antd'
import styles from './index.less'
import PropTypes from "prop-types"

const {RangePicker} = DatePicker

@Form.create()
export default class extends React.PureComponent {
    static propTypes = {
        placeholder: PropTypes.string,
        validator: PropTypes.func.isRequired,
        beforeSetState: PropTypes.func,
        momentToString: PropTypes.func,
        rangePickerOption: PropTypes.object,
    }

    static defaultProps = {
        placeholder: '请输入内容，按回车添加',
        validator: ({item, rule, value, momentToString, callback}) => {
            if(!value) {
                callback('必填')
                return
            }

            if(typeof value[0] === 'undefined' || typeof value[1] === 'undefined') {
                callback('必填')
                return
            }

            const time = momentToString(value)

            if(item.values.indexOf(time) > -1) {
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
            momentToString,
        } = this.props
        validator({item, rule, value, momentToString, callback})
    }

    render() {
        const {
            form,
            rangePickerOption,
        } = this.props

        const {getFieldDecorator} = form

        const formItemLayout = {
            wrapperCol: {span: 18},
        }

        return (
            <div className={styles.content}>
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
                            initialValue: [],
                        })(
                            <RangePicker
                                {...rangePickerOption}
                            />,
                        )
                    }
                </Form.Item>
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

