import React from 'react'
import {connect} from 'dva'
import {Input, Button, message, Popover} from 'antd'
import styles from './index.less'
const { TextArea } = Input

@connect(({ community_autoPull, loading}) => ({
    addKeywordLoading: loading.effects['community_autoPull/addKeyword'],
}))
class AddKeyword extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            inputKeyword: '', // 输入的暗号
        }
    }

    componentDidMount() {}

    handleChange = (e) => {
        this.setState({inputKeyword: e.target.value})
    }

    handleSave = () => {
        const { record } = this.props
        let { inputKeyword } = this.state, keyword_setting = [...record?.auto_group_setting?.keyword_setting]
        if(!inputKeyword || !inputKeyword.trim()) {
            message.warning('请输入暗号')
            return
        }
        inputKeyword = inputKeyword.trim()
        if(keyword_setting.findIndex((item) => {return item.keyword === inputKeyword}) > -1) {
            message.warning('请勿输入重复暗号')
            return
        }
        this.props.dispatch({
            type: 'community_autoPull/addKeyword',
            payload: {
                uin: record?.uin,
                body: {
                    keyword: inputKeyword,
                }
            },
            callback: () => {
                this.setState({inputKeyword: ''})
                this.props.onOk()
            }
        })
    }

    handleCancel = () => {
        this.setState({inputKeyword: ''})
        this.props.onCancel()
    }

    render() {
        const { visible, addKeywordLoading } = this.props
        const { inputKeyword } = this.state
        const content = <div className={styles.AddKeyword}>
            <TextArea
                placeholder="请输入暗号（限制10字以内）"
                value={inputKeyword}
                onChange={this.handleChange}
                maxLength={10}
            />
            <div className={styles.footer}>
                <Button
                    className={styles.save}
                    type="primary"
                    size="small"
                    onClick={this.handleSave}
                    loading={addKeywordLoading}
                >确定</Button>
                <Button
                    className={styles.cancel}
                    onClick={this.handleCancel}
                    size="small"
                >取消</Button>
            </div>
        </div>
        return (
            <Popover
                title="暗号"
                content={content}
                visible={visible}
                trigger="click"
                onVisibleChange={this.props.onChangeVisible}
            >
                {this.props.children}
            </Popover>
        )
    }
}

export default AddKeyword
