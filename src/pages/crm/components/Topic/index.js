import React, { Component, Fragment, Children } from 'react'
import Item from './Item'
import styles from './index.scss'

function validateFields() {
    return function (validateFields) {

    }
}
export default class Topic extends Component {
    static Item = Item
    state = {
        errors: {}
    }
    sourceData = []
    getFields = () => {
        return this.sourceData
    }
    setField = (data) => {
        let flag = true
        for (let i = 0; i < this.sourceData.length; i++) {
            if (this.sourceData[i].name === data.name) {
                this.sourceData[i].type = data.type
                this.sourceData[i].data = data.data
                this.sourceData[i].ext_data = data.ext_data
                flag = false
            }
        }
        if (flag) {
            this.sourceData.push(data)
        }
    }
    onTopicDelete = (data) => {
        this.sourceData = this.sourceData.filter(item => (
            item.name !== data.name
        ))
    }
    // 验证所有
    validator = (callback) => {
        let errors = this.errors
        Object.keys(errors).forEach(err => {
            this.onInput(err, this.errors[err].options, this.errors[err].value, false)
        })
        let flag = Object.keys(this.errors).filter(err => {
            return !this.errors[err].status
        })
        this.forceUpdate()
        callback(flag.length === 0, this.state.errors, this.sourceData)

    }
    // 设置错误
    setError(name, errorMessage) {
        if (name) {
            if (errorMessage) {
                let errors = this.state.errors
                errors[name] = errorMessage
                this.setState({ errors })
                this.errors[name].status = false
            } else {
                let errors = { ...this.state.errors }
                delete errors[name]
                this.setState({ errors })
                this.errors[name].status = true
            }
        }
    }
    // 验证规则
    validate = (name, rule, value, cb) => {
        let flag = true

        if (rule.requried) {
            if (rule.type === 'number') {
                flag = !isNaN(value) && value !== ''
            } else if (rule.type === 'array') {
                flag = value && value.length > 0
            } else {
                flag = !!value || value === 0
            }
        }
        this.setError(name, !flag ? rule.message : '')
        if (typeof cb === 'function' && flag) {
            cb(rule, value, this.setError, name)
        }
        return flag
    }
    // 触发验证value
    onInput = (name, options, value, isForceUpdate = true) => {
        if (isForceUpdate) this.errors[name].value = value
        if (typeof options === 'object') {
            if (options.rules && options.rules.length > 0) {
                // options.rules.forEach(item => this.validate(name, item, value, item.cb))
                let flag = true
                for (let i = 0; i < options.rules.length; i++) {
                    if (!flag) {
                        break;
                    }
                    let item = options.rules[i]
                    flag = this.validate(name, item, value, item.cb)
                }
                if (!flag && isForceUpdate) {
                    this.forceUpdate()
                }
            }
        }

    }
    errors = {}
    // 验证器
    validateFields = (data, name, options = {}) => {
        return (Comp) => {
            let rule = options.rule && options.rule.length > 0
            if (!this.errors[name]) {
                this.errors[name] = {
                    value: null,
                    status: !rule,
                    options: options
                }
            }

            if (typeof Comp === 'function') {
                Comp = Comp(this.onInput.bind(this, name, options))

                if (typeof Comp.type === 'function') {
                    const Com = Comp.type
                    return (
                        <Fragment>
                            <Com  {...Comp.props}>{Comp.props.child}</Com>
                            <span className={styles.error__label}>{this.state.errors[name]}</span>
                        </Fragment>
                    )
                } else if (Array.isArray(Comp)) {
                    const Com = Comp.map((item, index) => {
                        if (typeof item.type === 'function') {
                            const Item = item.type
                            return <Item key={index} {...item.props}>{item.props.child}</Item>
                        }
                    })
                    return (
                        <Fragment>
                            {Com}
                            <span className={styles.error__label}>{this.state.errors[name]}</span>
                        </Fragment>
                    )
                }
            }

            return Comp
        }
    }

    render() {

        return (
            <Fragment>
                {
                    Children.map(this.props.children, (child) => {
                        if (typeof child.type === 'function') {
                            const ComItem = child.type
                            return <ComItem
                                setField={this.setField}
                                errors={child.props.rowkey ? this.state.errors[child.props.rowkey] : this.state.errors}
                                validateFields={this.validateFields}
                                onTopicDelete={this.onTopicDelete}
                                {...child.props}>
                                {child.props.children}
                            </ComItem>
                        }
                        return child
                    })
                }
            </Fragment>
        )
    }
}