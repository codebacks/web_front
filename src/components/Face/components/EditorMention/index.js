/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/9/20
 *
 * const a = Editor.replaceMentionHtml(values.editorContent, (mentionHtml, id, index)=>{
        console.log(id)
        return '[xxxx]'
    })
 *
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import ReactQuill, {Quill} from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import {Row, Col} from 'antd'
import _ from 'lodash'
import classNames from 'classnames'
import '../../Quill/divEmbed'
import '../../Quill/ImageEmbed'
import './quill/mention'
import FaceTab from '../FaceTab'
import styles from './index.less'
import utils, {HZFaceKey} from '../../utils'
import {replaceMentionHtml} from './utils'

const Delta = Quill.import('delta')

const atValues = [
    {"id": "5a97b2a402de91c5b6c3e8a4", "value": "Josie Rice"},
    {"id": "5a97b2a464a8ff2d0996d2ef", "value": "Elva Bowman"},
    {"id": "5a97b2a4ecb768a2092a298b", "value": "Ella Cochran"},
    {"id": "5a97b2a418b984d2aff97657", "value": "Knowles Walls"},
    {"id": "5a97b2a4436c2c9acc6b5ad0", "value": "Hanson Webb"},
    {"id": "5a97b2a4436c2c9acc6b5ad1", "value": "Maria Cruz"},
    {"id": "5a97b2a4436c2c9acc6b5ad2", "value": "Pablo Escobar"},
    {"id": "5a97b2a4436c2c9acc6b5ad3", "value": "Richard Smith"},
]

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
        formats: ['image', 'mention'],
        modules: {
            mention: {
                wait: 200,
                mentionDenotationChars: ["@"],
                renderMentionContent: (value, denotationChar) => {
                    return `${denotationChar}${value}`
                },
                renderItem: (item, searchTerm) => {
                    return `${item.value}`
                },
                renderMentionListLoading(mentionChar, searchTerm) {
                    return 'loading...'
                },
                source: (searchTerm, mentionChar) => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            let values
                            if(mentionChar === "@") {
                                values = atValues
                            }

                            resolve(values)

                            // if(searchTerm.length === 0) {
                            //     resolve(values)
                            // }else {
                            //     const matches = []
                            //     for(let i = 0; i < values.length; i++)
                            //         if(~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())) matches.push(values[i])
                            //     resolve(matches)
                            // }
                        }, 500)
                    })
                },
            },
        },
    }

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

    static replaceMentionHtml = (editorHtml, cb) => {
        if(editorHtml) {
            return replaceMentionHtml(editorHtml, cb)
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

    onChange = (value) => {
        if(!('value' in this.props)) {
            this.setState({value})
        }

        const {onChange} = this.props
        if(onChange) {
            onChange(value)
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

    getMentionIsSelected() {
        return _.get(this.getQuill(), 'theme.modules.mention.isSelected', false)
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

            quillRef.insertEmbed(position, 'image', utils.getImgAttr({idx, type}), Quill.sources.API)

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
                <div className={styles.head}>
                    <Row>
                        <Col span={12}>
                            <FaceTab
                                {...this.props}
                                onIconClick={this.handleFace}
                                insertFace={this.insertFace}
                            >
                            </FaceTab>
                            {this.props.extend}
                        </Col>
                    </Row>
                </div>
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
            </div>
        )
    }
}

export default Editor
