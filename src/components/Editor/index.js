'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 2017/7/14
 */
import React from 'react'
import PropTypes from 'prop-types'
import ReactQuill, {Quill} from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import {Row, Col} from 'antd'
import Face from '../Im/Face'
import Helper from 'utils/helper'
import config from 'common/config'
import styles from './index.scss'

const {EmojiFolder, QQFaceFolder} = config
let Block = Quill.import('blots/block')
Block.tagName = 'DIV'
Quill.register(Block, true)

class Editor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            editorHtml: '',
            mountedEditor: false,
            range: {index: 0, length: 0}
        }
        this.quillRef = null
        this.reactQuillRef = null
        this.handleChange = this.handleChange.bind(this)
        this.handleKeyDown = this.handleKeyDown.bind(this)
        this.attachQuillRefs = this.attachQuillRefs.bind(this)
    }

    componentDidMount() {
        this.attachQuillRefs()
    }

    componentDidUpdate() {
        this.attachQuillRefs()
    }

    attachQuillRefs() {
        if (typeof this.reactQuillRef.getEditor !== 'function') return
        if (this.quillRef !== null) return
        const quillRef = this.reactQuillRef.getEditor()
        if (quillRef !== null) {
            this.quillRef = quillRef
            window.ChatEditor = quillRef //插件使用
        }
    }

    handleChange(html, delta, source, editor) {
        this.setState({editorHtml: html})
        this.props.onChange(html)
    }

    handleKeyDown(e) {
        if (this.props.disableKeyDown) {
            return
        }
        const range = this.quillRef.getSelection()
        if (e.keyCode === 13 && (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey)) {
            this.quillRef.deleteText(range.index - 1, 1)
            this.quillRef.formatLine(range.index, 1, 'list', 'bullet')
            this.quillRef.setSelection(range.index - 1)
            setTimeout(() => {
                this.props.onEnter(this.state.editorHtml)
                this.quillRef.setText('')
            }, 0)
            return false
        }
    }

    insertFace(idx, type) {
        let range = {...this.state.lastRange}
        let position = range ? range.index ? range.index : 0 : 0
        let img = ''
        if (type === 'emoji') {
            img = Helper.format(EmojiFolder, {idx: idx})
        } else {
            img = Helper.format(QQFaceFolder, {idx: idx})
        }
        this.quillRef.insertEmbed(position, 'image', img)
        setTimeout(() => {
            this.quillRef.focus()
            this.quillRef.setSelection(position + 1, 0)
            range.index = position + 1
            this.setState({lastRange: range})

        }, 0)
    };

    handleChangeSelection = (range) => {
        if (range) {
            this.setState({range: range})
        }
    };
    handleFace = () => {
        let lastRange = this.quillRef.getSelection()
        this.setState({lastRange: lastRange})
    };

    clear = () => {
        this.setState({editorHtml: ''})
        this.reactQuillRef.setEditorContents(this.quillRef, '')
    };

    render() {
        return (
            <div className={styles.editor}>
                <div className={styles.head}>
                    <Row>
                        <Col span="12">
                            <Face {...this.props}
                                onIconClick={this.handleFace}
                                insertFace={this.insertFace.bind(this)}>
                            </Face>
                            {this.props.extend}
                        </Col>
                    </Row>
                </div>
                <ReactQuill
                    ref={(el) => {
                        this.reactQuillRef = el
                    }}
                    theme={'snow'}
                    id="ql-editor"
                    onChange={this.handleChange}
                    modules={Editor.modules}
                    formats={Editor.formats}
                    defaultValue={this.state.editorHtml}
                    onChangeSelection={this.handleChangeSelection}
                    onKeyDown={this.handleKeyDown}
                    placeholder={this.props.placeholder}/>
            </div>
        )
    }
}
Editor.modules = {
    "toolbar": false
}
Editor.modules.toolbar = []
Editor.formats = ['image']
Editor.propTypes = {
    placeholder: PropTypes.string,
}


export default Editor