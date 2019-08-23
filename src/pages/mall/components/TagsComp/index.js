import { Component } from 'react'
import PropTypes from 'prop-types'
import { Tag, Tooltip, Input, Icon, message } from 'antd'
import styles from './index.less'
export default class TagsComp extends Component {
    static propTypes = {
        maxLen: PropTypes.number,
        text: PropTypes.string,
        error: PropTypes.string,
    }
    state = {
        tags: [],
        inputVisible: false,
        inputValue: '',
    }
    componentDidMount() {
        let tags = this.props.tags || []
        this.setState({tags})
    }
    static getDerivedStateFromProps (nextProps, state) { 
        // console.log(nextProps)
        if (nextProps.tags && JSON.stringify(nextProps.tags)!==JSON.stringify(state.tags)) { 
            return {
                tags: nextProps.tags
            }
        }
        return null
    }
    // 删除标签
    handleClose = (removedTag) => {
        if (this.props.activityDisabled) {
            return false
        }
        const tags = this.state.tags.filter(tag => tag !== removedTag)
        this.setState({ tags })
        this.props.onChangeTag(tags)
    }
    showInput = () => {
        if (this.props.activityDisabled) {
            return false
        }
        this.setState({ inputVisible: true }, () => {
            this.saveInputRef.focus()
        })
    }
    handleInputChange = (e) => {
        this.setState({ inputValue: e.target.value })
    }
    // 按enter保存
    handleInputConfirm = () => {
        const state = this.state
        const inputValue = state.inputValue
        let tags = state.tags
        //如果不是已经存在的则添加
        if (inputValue) {
            if (tags.indexOf(inputValue) === -1) {
                tags = [...tags, inputValue]
            } else {
                message.error(this.props.error?this.props.error+'已经存在！':'值已经存在！')
            }
        }

        this.setState({
            tags,
            inputVisible: false,
            inputValue: '',
        })
        this.props.onChangeTag(tags)
    }
    render(){
        const { tags, inputVisible, inputValue } = this.state
        let { maxLen, text, activityDisabled } = this.props
        maxLen = maxLen || 9999
        return (
            <div>
                {tags.map((tag, index) => {
                    const isLongTag = tag.length > 20
                    const tagElem = (
                        <Tag key={tag} closable={true} onClose={()=>this.handleClose(tag)} className={activityDisabled?styles.activityDisabled:styles.tagStyle}>
                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                        </Tag>
                    )
                    return isLongTag ? <Tooltip title={tag} key={tag}>{tagElem}</Tooltip> : tagElem
                })}
                {inputVisible && (
                    <Input
                        ref={node => this.saveInputRef = node }
                        type="text"
                        style={{ width: 80 }}
                        value={inputValue}
                        onChange={this.handleInputChange}
                        onBlur={this.handleInputConfirm}
                        onPressEnter={this.handleInputConfirm}
                        maxLength={20}
                        disabled={activityDisabled}
                    />
                )}
                {(!inputVisible&&tags.length< maxLen) && (
                    <Tag
                        onClick={this.showInput}
                        className={activityDisabled?styles.activityDisabled:styles.addStyle}
                    >
                        <Icon type="plus" style={{fontSize: 14}}/>{text}
                    </Tag>
                )}
            </div>
        )
    }
}
