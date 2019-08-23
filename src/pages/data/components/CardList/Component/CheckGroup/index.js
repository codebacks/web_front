import React, { Fragment } from 'react'
import { Checkbox, Form } from 'antd'
import styles from './index.less'
const CheckboxGroup = Checkbox.Group
const FormItem = Form.Item

@Form.create({
    onFieldsChange (props, changedFields) {
        props.onChange&&props.onChange(changedFields)
    },
})
export default class Index extends React.Component {
    componentDidMount () { 
        this.props.refName(this)
    }
    render () {
        const { item } = this.props
        const { getFieldDecorator } = this.props.form
        return (
            <Fragment>
                <FormItem className={styles.radio}>
                    {getFieldDecorator('data',{
                        rules: [{
                            required: true,
                            message: '条件不能为空',
                        }],
                    })(
                        <CheckboxGroup
                            options={item.option}
                        />
                    )}
                </FormItem>
            </Fragment>
        )
    }
}