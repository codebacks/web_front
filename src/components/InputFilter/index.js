import React from 'react'
import { Input, InputNumber } from 'antd'
import PropTypes from 'prop-types'

export default class extends React.PureComponent {
    constructor(props) {
        super()
        this.state = {
            value: ''
        }
        this.changeInput = false
    }
    static propTypes = {
        type: PropTypes.string,
        filter: PropTypes.string,
        regex: function (props, propName) {
            if (props[propName] && ({}).toString.call(props[propName]) !== '[object RegExp]') {
                return new Error('[InputFilter]: regex must be a RegExp type.')
            }
        }
    }
    handleRegex = (value, isReplace = false) => {
        const REGEXP = {
            default: /[\-\d]{1}/g,
            number: /[\-\d\.]{1}/g,
            int: /[\d]{1}/g,
            chinese: /[\u4e00-\u9fa5]{1}/g
        }
        const filter = this.props.filter
        const regex = filter && REGEXP[filter] ? REGEXP[filter] : REGEXP['default']
        if (isReplace && value) {
            const _regex = this.props.regex || regex
            let str = ''
            value.replace(_regex, (match) => {
                str += match
            })
            return str
        }
        return this.props.regex ? this.props.regex.test(value) : regex ? regex.test(value) : true
    }
    _value = ''
    onBlur = (event) => {
        let value = event.target && event.target.value
        value = this.handleRegex(value, true)
        if (typeof value === 'string') {
            this.changeInput = true
            this.setState({ value }, () => {
                this.changeInput = false
                if (this._value !== value ) {
                    this._value = value
                    this.props.onChange && this.props.onChange(value)
                }
            })
            event.target.value = value
        }
        this.props.onBlur && this.props.onBlur(event)
    }

    onChange = (event) => {
        let value = ''
        if (event) {
            value = event.target && event.target.value
        }

        if (value) {
            let endStr = value.charAt && value.charAt(value.length - 1)
            value = endStr && this.handleRegex(endStr) ? value : value.slice(0, value.length - 1)
        }

        if (!this.changeInput) {
            this.changeInput = true
            this.setState({ value }, () => {
                this._value = value
                this.changeInput = false
                this.props.onChange && this.props.onChange(value)
            })
        }

    }
    render() {
        const _props = {
            ...this.props,
            onChange: this.onChange,
            onBlur: this.onBlur
        }
        if (this.changeInput) {
            _props.value = this.state.value
        }

        return this.props.type === 'InputNumber' ? <InputNumber {..._props} /> : <Input onBlur {..._props} />
    }
}