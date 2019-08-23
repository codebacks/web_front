/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/8/16
 */

import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import {Dropdown} from 'antd'

export default class HzDropdown extends Component {
    static propTypes = {
        handleOutside: PropTypes.func.isRequired,
    }

    static defaultProps = {}

    constructor(props) {
        super(props)
        this.state = {}
    }

    isNotFocusable = (el) => {
        return isNaN(window.parseInt(el.getAttribute('tabindex')))
    }

    setFocusable = (el) => {
        el.setAttribute('tabindex', -1)
    }

    componentDidMount() {
        const dropdownDom = this.dropdownDom
        if(dropdownDom) {
            if(this.isNotFocusable(dropdownDom)) {
                this.setFocusable(dropdownDom)
            }
            dropdownDom.addEventListener('focusout', this.handleOutside)
            dropdownDom.focus()
        }
    }

    componentWillUnmount() {
        if(this.dropdownDom) {
            this.dropdownDom.removeEventListener('focusout', this.handleOutside)
        }
        if(this.timer){
            clearTimeout(this.timer)
        }
    }

    handleOutside = () => {
        this.timer = setTimeout(() => {
            this.props.handleOutside()
        }, 150)
    }

    render() {
        const {children, handleOutside, ...other} = this.props
        return (
            <Dropdown
                ref={(ref) => this.dropdownDom = ReactDOM.findDOMNode(ref)}
                {...other}
            >
                {children}
            </Dropdown>
        )
    }
}