import React, { Fragment } from 'react'
import {connect} from 'dva'
import { Form, Select } from 'antd'
import styles from './index.less'
const FormItem = Form.Item
const Option = Select.Option

@connect(({ base, customer_group }) => ({
    base, customer_group
}))
@Form.create({
    onFieldsChange (props, changedFields) {
        props.onChange&&props.onChange(changedFields)
    },
})
export default class Index extends React.Component { 
    state = {
        values: []
    }
    componentDidMount () { 
        this.props.refName(this)
        this.loadTags()
        const { item } = this.props
        this.props.form.setFieldsValue({
            data: item&&item.data || []
        })
    }
    componentWillUnmount() {
        if (this.timer) { 
            clearTimeout(this.timer)
        }
    }
    onChange = (value) => {
        this.setState({
            values: value
        })
        this.props.form.setFieldsValue({
            data: value
        })
    }
    onBlur = (value)=>{
        this.setState({
            values: value
        })
        this.props.form.setFieldsValue({
            data: value
        })
    }
    loadTags = () => {
        this.timer = setTimeout(() => {
            this.props.dispatch({
                type: 'customer_group/queryTags',
                payload: {}
            })
        }, 0)
    }
    
    render () {
        const { getFieldDecorator } = this.props.form
        const { tags } = this.props.customer_group
        const getTagsOptions = () => {
            let options = []
            tags.forEach((item) => {
                options.push(<Option value={'' + item.name} key={item.id}>{item.name}</Option>)
            })
            return options
        }
        return (
            <Fragment>
                <FormItem style={{marginTop: 24}}>
                    {getFieldDecorator('data', {
                        rules: [{
                            required: true,
                            message: '条件不能为空',
                        }]
                    })(
                        <div>
                            <Select
                                value={this.state.values}
                                mode="multiple"
                                className={styles.selectTag}
                                placeholder="请选择"
                                onChange={this.onChange}
                                onBlur={this.onBlur}
                            >
                                {getTagsOptions()}
                            </Select>
                        </div> 
                    )}
                </FormItem>
            </Fragment>
        )
    }
}