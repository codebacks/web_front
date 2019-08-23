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
    Select,
} from 'antd'
import styles from './index.less'
import PropTypes from "prop-types"
import _ from 'lodash'

const Option = Select.Option

@Form.create()
export default class SelectType extends React.PureComponent {
    static propTypes = {
        validator: PropTypes.func.isRequired,
        beforeSetState: PropTypes.func,
        onSearch: PropTypes.func,
        defaultOption: PropTypes.array,
        selectOption: PropTypes.object,
        debounceWait: PropTypes.number,
    }

    static defaultProps = {
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
        beforeSetState: (values) => {
            return values
        },
        debounceWait: 200,
    }

    constructor(props) {
        super(props)

        this.state = {
            options: props.defaultOption || [],
            loading: false,
        }

        this.handleSearch = _.debounce((value) => {
            this.onSearch(value)
        }, props.debounceWait)
    }

    componentDidMount() {
        this.onSearch()
    }

    onSearch = async (value) => {
        const {onSearch} = this.props
        if(onSearch) {
            if(this.state.loading) {
                return
            }

            try {
                this.setState({
                    loading: true,
                })
                const data = await onSearch(value)

                this.setState({
                    options: data,
                })
            }catch(e) {

            }finally {
                this.setState({
                    loading: false,
                })
            }
        }
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

    createOption = () => {
        const {options = []} = this.state

        return options.map((item, index) => {
            return (
                <Option value={item.id} key={item.id}>{item.name}</Option>
            )
        })
    }

    render() {
        const {
            form,
            selectOption,
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
                        })(
                            <Select
                                {...selectOption}
                                loading={this.state.loading}
                                onSearch={this.handleSearch}
                            >
                                {this.createOption()}
                            </Select>,
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

