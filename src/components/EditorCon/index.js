// photoPrefix 图片前缀如image.51zan.com
// photoToken  图片上传token
// changeQuill 编辑框内容发生改变时调用
// textRefs    获取富文本的refs，例如更改文本框内容this.textRefs.onChange('示例内容')

import React from 'react'
import PropTypes from 'prop-types'
import { Upload, message } from 'antd'
import ReactQuill, {Quill} from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import styles from './index.less'

let Block = Quill.import('blots/block')
Block.tagName = 'DIV'
Quill.register(Block, true)

class EditorCon extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            editorHtml: '',
            range: { index: 0, length: 0 },
            lastRange: '',
        }
        this.quillRef = null
        this.reactQuillRef = null
    }
    componentDidMount() {
        this.attachQuillRefs()
        let content = this.props.content || ''
        this.setState({
            editorHtml: content
        })
    }
    componentDidUpdate() {
        this.attachQuillRefs()
    }
    attachQuillRefs= () => {
        if (typeof this.reactQuillRef.getEditor !== 'function') return
        if (this.quillRef !== null) return
        const quillRef = this.reactQuillRef.getEditor()
        if (quillRef !== null) {
            this.quillRef = quillRef
        }
    }
    onChange = (html, delta, source, editor) => {
        this.setState({
            editorHtml: html
        })
        this.props.changeQuill(html)
    }
    // 上传图片时候的逻辑
    imageHandler = () => {
        this.imageRef.click()
    }
    handleImage = (info) => {
        const { photoPrefix } = this.props
        if(info.file.status === 'done'){
            if(info.file.response&&info.file.response.key){
                let img = `//${photoPrefix}/${info.file.response.key}`
                const range = this.quillRef.getSelection()
                let position = range ? (range.index ? range.index : 0 ) : 0
                this.quillRef.insertEmbed(position, 'image', img)
    
                // 插入图片后，光标向后移一位
                this.props.changeQuill(this.state.editorHtml)
                this.quillRef.focus()
                this.quillRef.setSelection(position + 1, 0)
                range.index = position + 1
                this.setState({range: range})
            }
            // setTimeout(() => {

            // }, 0)
            // return false
        } else if (info.file.status === 'error') {
            message.error(`上传失败`)
        }
    }
    handleChangeSelection = (range) => {
        // console.log(range)
        if (range) {
            this.setState({
                range: range
            })
        }
    }
    render () {
        const { photoToken } = this.props
        const { editorHtml } = this.state
        const option = [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }], 
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }], 
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean'] 
        ]
        const uploadProps = {
            name: 'file',
            action: '//upload.qiniup.com/',
            accept: ".jpg,.png",
            headers: {},
            data: {
                token: photoToken,
            },
            beforeUpload: (file, fileList)=>{
                this.setState({
                    isUpload: true
                })
                const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
                if (!isJPG) {
                    message.error('文件限制jpg/jpeg/png!')
                    fileList.pop()
                    this.setState({
                        isUpload: false
                    })
                }
                const isLt1M = file.size / 1024 / 1024 < 1
                if (!isLt1M) {
                    message.error('大小限制1MB!')
                    fileList.pop()
                    this.setState({
                        isUpload: false
                    }) 
                }
                return isJPG && isLt1M
            },
        }
        return (
            <div className={styles.textEditor}>
                <ReactQuill
                    ref={(el) => {
                        this.reactQuillRef = el
                    }}
                    value={editorHtml}
                    onChange={this.onChange}
                    onChangeSelection={this.handleChangeSelection}
                    placeholder={this.props.placeholder}
                    modules={{
                        toolbar: {
                            container: option,
                            handlers: {
                                'image': this.imageHandler
                            }
                        }
                    }}
                >     
                </ReactQuill>
                <Upload
                    className={styles.uploadClass}
                    {...uploadProps}
                    onChange={this.handleImage} 
                >
                    <span ref={node => this.imageRef = node}></span>
                </Upload>
            </div>
        )
    }
}
//设置属性类型
EditorCon.propTypes = {
    placeholder: PropTypes.string,
}
//设置默认属性
EditorCon.defaultProps  = {
    theme: 'snow'
}
export default EditorCon
