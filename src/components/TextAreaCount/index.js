import React, { Component ,Fragment} from "react"
import propType from 'prop-types'
import { Input } from "antd"
import styles from "./index.less"
const TextArea = Input.TextArea

export default class extends Component {
    state = {
        
        contentLenght: 0
    }
    static propTypes = {
        limitSize: propType.number.isRequired,
        type: propType.string
    }
    timestamp = null
    timer = null
    throttle = (callback, time = 50) => {
        this.timer = setTimeout(_ => {
            const timestamp = new Date().getTime()
            if (!this.timestamp || timestamp - this.timestamp >= time) {
                this.timestamp = timestamp
                callback()
            } else {
                clearTimeout(this.timer)
            }
        })
    }
    requestAnimationFrame = (callback, time = 50) => {
        this.timer = window.requestAnimationFrame(timestamp => {
            if (!this.timestamp || timestamp - this.timestamp >= time) {
                this.timestamp = timestamp
                callback()
            } else {
                window.cancelAnimationFrame(this.timer)
            }
        })
    }

    requestIdleCallback = (callback, time = 50) => {
        if (window.requestIdleCallback) {
            this.timer = window.requestIdleCallback(idleDeadline => {
                if (idleDeadline.timeRemaining() > 0) {
                    callback()
                } else {
                    // 为了最后可以执行
                    this.requestAnimationFrame(callback, 100)
                    window.cancelIdleCallback(this.timer)
                }
            }, { timeout: time })
        } else if (window.requestAnimationFrame) {
            this.requestAnimationFrame(callback, time)
        } else {
            this.throttle(callback, time)
        }
    }
    onChange = e => {
        this.requestIdleCallback(() => {
            if (this.textAreaRef) {
                let textArea = this.textAreaRef
                const pos = this.getCursortPosition(textArea)
                let value = textArea.value
                let contentLenght = value.length
                let toBottom = false
                if (pos >= contentLenght) {
                    toBottom = true
                } else {
                    // 让部分倒数第二行输入时也能到最底部
                    let fontSize = this.getComputedStyle(textArea, 'font-size')
                    let width = textArea.offsetWidth - 24
                    let len = this.getStrLength(value, fontSize, width)
                    let splitLength = this.getStrLength(value.slice(0, pos), fontSize, width)
                    if ((len - splitLength) / width < 1) toBottom = true
                }
                if (toBottom) {
                    let diffHeight = textArea.scrollHeight - textArea.offsetHeight
                    if (diffHeight > 0) textArea.scrollTop = diffHeight
                }

            }
        }, 50)
        this.setState({ contentLenght: e.target && e.target.value.length })
        this.props.onChange && this.props.onChange(e)
    }
    // 获取光标位置
    getCursortPosition = element => {
        let cursorPos = 0
        if (document.selection) {
            // IE Support
            element.focus()
            let selectRange = document.selection.createRange()
            selectRange.moveStart("character", -element.value.length)
            cursorPos = selectRange.text.length
        } else if (element.selectionStart || element.selectionStart + '' === "0") {
            cursorPos = element.selectionStart
        }
        return cursorPos
    }

    //获取字符长度
    getStrLength = (str, fontSize = 14, width) => {
        let strArr = str.split('')
        let length = 0
        strArr.forEach(item => {
            if (/[\n]/.test(item)) {
                length += width
                // eslint-disable-next-line no-control-regex
            } else if (/[^\x00-\xff]|[@%]/.test(item)) {
                length += fontSize
            } else if (/[^a-zA-Z0-9#~&\?]/.test(item)) {
                length += (fontSize * 0.289)
            } else if (/[a-zA-Z\d#~&\?]/.test(item)) {
                length += (fontSize * 0.65)
            }
        })
        return Math.round(length)
    }
    getComputedStyle = (elem, prop, filter = true) => {
        let _value = window.getComputedStyle(elem, null)[prop]
        if (filter && _value) {
            _value = _value.replace && Number(_value.replace(/[^\d\.]+/g, ''))
        }
        return _value
    }
    textAreaRef = null
    getRefTextArea = ref => {
        this.textAreaRef = ref && ref.textAreaRef
    }
    text = ''
    getValueChange = (value)=>{
        if(this.text !== value){
            this.text = value
            this.props.getValueChange && this.props.getValueChange(value)
        }
    }
    render() {
        const {limitSize , type} = this.props
        let _props = {
            ...this.props,
            ref: this.getRefTextArea,
            onChange: this.onChange
        }
        let isLimit = (!type || type === 'limit')
        if(isLimit) _props.maxLength = limitSize
        delete _props.limitSize
        delete _props.type
        if( _props.getValueChange ) delete _props.getValueChange
        let { contentLenght } = this.state
        if (_props.value && contentLenght !== _props.value.length) contentLenght = _props.value.length
        if('value' in _props && !_props.value) contentLenght = 0
        
        this.getValueChange(_props.value)

        return (
            <div className={`${styles.textAreaCount} ${this.props.className}`}>
                <TextArea {..._props} />
                
                <p className={[styles.textAreaCount_content, _props.disabled ? styles.disabled : ""].join(' ')}>
                    {
                        isLimit ? <Fragment>{ contentLenght } / <span>{ limitSize }</span> </Fragment>  :
                            <span>{contentLenght}</span>
                    }
                </p>
            </div>
        )
    }
}
