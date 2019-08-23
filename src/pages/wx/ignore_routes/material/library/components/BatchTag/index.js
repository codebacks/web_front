import React, {Component} from 'react'
import {connect} from 'dva/index'
import PropTypes from 'prop-types'
import {Modal, message, Button, Input, Tag} from 'antd'
import {tagMaxLength} from '../../config'
import styles from './index.scss'

@connect(({loading}) => ({
    batchTagLoading: loading.effects['wx_material_library/batchTag']
}))
export default class BatchTag extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: '',
            tags: []
        }
    }

    static propTypes = {
        visible: PropTypes.bool,
        onOK: PropTypes.func,
        onCancel: PropTypes.func
    }

    static defaultProps = {
        visible: false,
        onOk: ()=>{},
        onCancel: ()=>{},
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    handleChange = (e) => {
        let value = e.target.value
        value = value.trim()
        this.setState({
            value: value
        })
    }

    handleAddTag = (value) => {
        if(!value) {
            return
        }
        const tags = [...this.state.tags]
        const has = tags.find((v) => {
            return v === value
        })
        if (has) {
            message.warning('标签已存在')
            return
        }
        tags.unshift(value)
        this.setState({
            value: '', // 清空输入框
            tags: tags,
        })
    }

    removeTag = (tag) => {
        const currentTags = this.state.tags.filter((v) => {
            return v !== tag
        })
        this.setState({
            tags: currentTags
        })
    }

    handleOk = () => {
        const {tags} = this.state
        if (!tags.length) {
            message.warning('请先添加标签')
            return
        }
        this.batchTag(tags)
    }

    handleCancel = () =>{
        this.props.onCancel()
    }

    batchTag = (tags) => {
        const {ids} = this.props
        tags = tags.reverse()
        const body = ids.map((id)=>{
            return {
                media_id: id,
                tags: tags
            }
        })
        const payload = {
            body: body
        }
        this.props.dispatch({
            type: 'wx_material_library/batchTag',
            payload: payload,
            callback: () => {
                message.success('批量打标成功')
                this.props.onOk()
            }
        })
    }

    render() {
        const {visible, batchTagLoading} = this.props
        const {value, tags} = this.state

        return <Modal
            title="批量打标"
            width={540}
            visible={visible}
            className={styles.wrapper}
            destroyOnClose={true}
            maskClosable={false}
            onOk={this.handleOk}
            okText="保存"
            okButtonProps={{ disabled: batchTagLoading }}
            confirmLoading={batchTagLoading}
            onCancel={this.handleCancel}
        >
            <h3 className={styles.title}>统一添加标签</h3>
            <div className={styles.formItem}>
                <span className={styles.label}>标签：</span><Input placeholder={`输入限制${tagMaxLength}个字`}
                    className={styles.item}
                    value={value}
                    maxLength={tagMaxLength}
                    onChange={this.handleChange}
                    onPressEnter={()=>{this.handleAddTag(value)}}
                />
                <Button className={styles.add}
                    onClick={()=>{this.handleAddTag(value)}}
                >添加标签</Button>
            </div>
            <div className={styles.tagsWrap}>
                <p className={styles.tip}>若无此标签，将创建一个</p>
                <div className={styles.tags}>
                    {
                        tags.map((tag)=>{
                            return <Tag key={tag}
                                closable={true}
                                color="blue"
                                className={styles.tag}
                                onClose={()=>{this.removeTag(tag)}}
                            >{tag}</Tag>
                        })
                    }
                </div>
            </div>
        </Modal>
    }
}

