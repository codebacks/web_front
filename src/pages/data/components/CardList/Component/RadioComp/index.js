import React, { Fragment } from 'react'
import { Radio, Form, Input, InputNumber } from 'antd'
import styles from './index.less'
const RadioGroup = Radio.Group
const InputGroup = Input.Group
const FormItem = Form.Item
const parttern = /^[1-9]*[1-9][0-9]*$/
const part = /[1-9]*[1-9][0-9]*/g

@Form.create({
    onFieldsChange (props, changedFields) {
        props.onChange&&props.onChange(changedFields)
    },
})
export default class Index extends React.Component { 
    state = {
        init: 'between',
        first: '',
        second: '',
        val: '',
    }
    focusOne = false
    focusTwo = false
    componentDidMount () { 
        this.props.refName(this)
        const { item } = this.props
        this.props.form.setFieldsValue({
            type: item&&item.type || 'between',
            data: item&&item.data || [],
        }) 
    }
    componentWillUnmount () { 
        if (this.timerOne) { 
            clearTimeout(this.timerOne)
        }
        if (this.timerTwo) { 
            clearTimeout(this.timerTwo)
        }
    }
    testValue = (value) => { 
        //value.match(/[1-9]*[1-9][0-9]*/g).join('')
        return value&&(value.match(part) || []).join('') || ''
    }
    onChange = (e) => {
        const value = e.target.value
        this.setState(() => { 
            return {
                init: value,
                val: '',
            }
        })
        this.props.form.setFieldsValue({
            type: value,
            data: [],
        }) 
    }
    onInputChange = (value) => { 
        if (!parttern.test(value) && value!==0) { 
            value= this.testValue(value) 
        }
        this.setState({
            val: value,
        })
        this.props.form.setFieldsValue({
            data: [value]
        })
    }
    onBlur = () => { 
        this.props.form.validateFields()
    }
    onChangeOne = (value) => { 
        if (!parttern.test(value) && value!==0) { 
            value= this.testValue(value) 
        }
        const data = this.props.form.getFieldValue('data')
        data[0] = value
        this.props.form.setFieldsValue({
            data: data
        })
        this.setState({
            first: value,
        })
    }
    onChangeTwo = (value) => { 
        if (!parttern.test(value) && value!==0) { 
            value= this.testValue(value) 
        }
        const data = this.props.form.getFieldValue('data')
        data[1] = value
        this.props.form.setFieldsValue({
            data: data,
        })
        this.setState({
            second: value,
        })
    }
    onFocusOne = () => { 
        this.focusOne = true
    }
    onBlurOne = () => { 
        this.focusOne = false
        this.timerOne = setTimeout(() => { 
            if (!this.focusTwo) { 
                this.props.form.validateFields()
            }
        },0)
    }
    onFocusTwo = () => { 
        this.focusTwo = true
    }
    onBlurTwo = () => { 
        this.focusTwo = false
        this.timerTwo = setTimeout(() => { 
            if (!this.focusOne) { 
                this.props.form.validateFields()
            }
        },0)
    }
    validator = (rule, value, callback) => { 
        const { first, second, val, init } = this.state 
        if (init === 'between') { 
            if (first && !parttern.test(first)) {
                callback('条件设置异常')
                return 
            }
            if (second&&!parttern.test(second)) { 
                callback('条件设置异常')
                return 
            }
            if ((!first&&first!==0) || (!second&&second!==0)) { 
                callback('条件不能为空')
                return
            }
            if (parseInt(first, 10) > parseInt(second, 10)) { 
                callback('条件设置异常')
                return
            } 
        } else {
            if (!val&&val!==0) { 
                callback('条件不能为空')
                return
            }
            if (val&&!parttern.test(val)) { 
                callback('条件设置异常')
                return 
            }
        }
        callback()
    }
    render () {
        const { item } = this.props
        const { option, unit, max } = item
        const { getFieldDecorator } = this.props.form
        const { init, val, first, second  } = this.state       
        return (
            <Fragment>
                <FormItem className={styles.radio}>
                    {getFieldDecorator(`type`,{
                        rules: [
                            {
                                required: true,
                                message: '必选',
                            }
                        ],
                        initialValue: option.length>0&&option[0].value || ''
                    })(
                        <RadioGroup onChange={this.onChange}>
                            {
                                option.map((item,index) => {
                                    return <Radio value={item.value} key={index}>{item.label}</Radio>
                                })
                            }
                        </RadioGroup>
                    )}
                </FormItem>
                <FormItem>
                    {getFieldDecorator(`data`,{
                        rules: [{
                            validator: this.validator
                        }],
                        initialValue: [],
                    })(
                        init !== 'between' ?
                            (
                                <Fragment>
                                    <InputNumber min={0} max={max} style={{ width: 56 }} value={val} onChange={this.onInputChange} onBlur={this.onBlur}/>
                                    <span style={{marginLeft: 8,fontSize: 12}}>{unit}</span>
                                </Fragment>
                            )
                            : 
                            (
                                <InputGroup>
                                    <InputNumber min={0} max={max} style={{ width: 56 }} value={first} onChange={this.onChangeOne} onBlur={this.onBlurOne}onFocus={this.onFocusOne}/>
                                    <div className={styles.group}>{unit}<span className={styles.text}>(含)</span></div>
                                    <div className={styles.groupText}>至</div>
                                    <InputNumber min={0} max={max} style={{width: 56}} value={second} onChange={this.onChangeTwo} onBlur={this.onBlurTwo}onFocus={this.onFocusTwo}/>
                                    <div className={styles.group}>{unit}<span className={styles.text}>(含)</span></div>
                                </InputGroup>
                            )
                    )}
                </FormItem>
            </Fragment>
        )
    }
}