/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: liyan
 * 创建日期 2019/1/4
 */

import React from 'react'
import PropTypes from 'prop-types'
import ReactQuill, {Quill} from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import {Row, Col} from 'antd'
import _ from 'lodash'
import classNames from 'classnames'
import 'components/Face/Quill/divEmbed'
import 'components/Face/Quill/ImageEmbed'
import FaceTab from 'components/Face/components/FaceTab'
import styles from './index.less'
import utils, {HZFaceKey} from 'components/Face/utils'

const Delta = Quill.import('delta')

class Editor extends React.PureComponent {
    static propTypes = {
        placeholder: PropTypes.string,
        onChange: PropTypes.func,
        onEnter: PropTypes.func,
        handleKeyDown: PropTypes.func,
        disableKeyDown: PropTypes.bool,
        className: PropTypes.string,
        style: PropTypes.object,
    }

    static defaultProps = {
        placeholder: '',
        formats: ['image'],
        modules: {
            toolbar: [],
        },
    }

    static Quill = Quill

    static computeMsgLength = (editorHtml) => {
        if(editorHtml) {
            const str = utils.htmlToMsg(editorHtml)
            if(str.trim().length === 0) {
                return 0
            }else {
                return str.length
            }
        }

        return 0
    }

    static htmlToMsg = (editorHtml) => {
        if(editorHtml) {
            return utils.htmlToMsg(editorHtml)
        }
        return ''
    }

    static msgToHtml = (msg) => {
        if(msg) {
            return utils.wxToHtml(msg)
        }
        return ''
    }

    constructor(props) {
        super(props)
        this.lastRange = null
        this.reactQuillRef = null
        this.state = {
            value: props.value || props.defaultValue || '',
        }
    }

    static getDerivedStateFromProps(nextProps) {
        if('value' in nextProps) {
            return {
                value: nextProps.value || '',
            }
        }
        return null
    }

    onChange = (value, ...arg) => {
        if(!('value' in this.props)) {
            this.setState({value})
        }

        const {onChange} = this.props
        if(onChange) {
            onChange(value, ...arg)
        }
    }

    componentDidMount() {
        this.addMatcher()
    }

    componentWillUnmount() {
    }

    addMatcher = () => {
        const quillRef = this.getQuill()
        if(quillRef) {
            quillRef.clipboard.addMatcher('IMG', function(node, delta) {
                const newDelta = new Delta()
                delta.forEach((op) => {
                    const image = _.get(op, 'insert.image')
                    if(image && image[HZFaceKey]) {
                        newDelta.insert({image})
                    }
                })
                return newDelta
            })
        }
    }

    getQuill = () => {
        if(this.reactQuillRef && typeof this.reactQuillRef.getEditor === 'function') {
            return this.reactQuillRef.getEditor()
        }
    }

    getHtml = () => {
        return _.get(this.getQuill(), 'root.innerHTML', '')
    }

    getHandleKeyDownFn = () => {
        if(this.props.handleKeyDown) {
            return this.props.handleKeyDown
        }
        return this.handleKeyDown
    }

    handleKeyDown = (e) => {
        if(this.props.disableKeyDown) {
            return
        }
        const quillRef = this.getQuill()
        if(quillRef) {
            const range = quillRef.getSelection()
            if(e.keyCode === 13 && (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey)) {
                quillRef.deleteText(range.index - 1, 1)
                quillRef.formatLine(range.index, 1, 'list', 'bullet')
                quillRef.setSelection(range.index - 1)

                setTimeout(() => {
                    this.props.onEnter && this.props.onEnter(quillRef)
                    quillRef.setText('')
                }, 0)

                return false
            }
        }
    }

    insertFace = (e) => {
        const quillRef = this.getQuill()
        if(quillRef) {
            const idx = e.target.getAttribute('data-idx')
            const type = e.target.type
            const imgAttr = utils.getImgAttr({idx, type})
            if(!imgAttr) {
                return
            }

            let range = {...this.lastRange}
            let position = range ? range.index ? range.index : 0 : 0

            quillRef.insertEmbed(position, 'image', utils.getImgAttr({idx, type}))

            setTimeout(() => {
                quillRef.focus()
                quillRef.setSelection(position + 1, 0)
                range.index = position + 1
                this.lastRange = range
            }, 0)
        }
    }

    handleFace = () => {
        const quillRef = this.getQuill()
        if(quillRef) {
            this.lastRange = quillRef.getSelection()
        }
    }

    clear = () => {
        const quillRef = this.getQuill()
        if(quillRef) {
            this.reactQuillRef.setEditorContents(quillRef, '')
        }
    }

    render() {
        const {
            modules,
            formats,
            placeholder,
            className,
            style,
            ...otherQuillOptions
        } = this.props
        const {value} = this.state

        const cls = classNames(styles.editor, className)

        return (
            <div className={cls} style={{...style}}>
                <ReactQuill
                    {...otherQuillOptions}
                    ref={(el) => {
                        this.reactQuillRef = el
                    }}
                    value={value}
                    theme={'snow'}
                    onChange={this.onChange}
                    modules={modules}
                    formats={formats}
                    onKeyDown={this.getHandleKeyDownFn()}
                    placeholder={placeholder}
                />
                <div className={styles.bar}>
                    <FaceTab
                        {...this.props}
                        onIconClick={this.handleFace}
                        insertFace={this.insertFace}
                    >
                    </FaceTab>
                    {this.props.extend}
                </div>
            </div>
        )
    }
}

export default Editor
