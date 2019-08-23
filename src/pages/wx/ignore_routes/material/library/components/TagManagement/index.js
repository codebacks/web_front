import React, {Component, Fragment} from 'react'
import PropTypes from 'prop-types'
import {connect} from "dva/index"
import {Modal, message, Button, Tag, Input} from 'antd'
import {tagMaxLength} from '../../config'

import styles from './index.scss'

@connect(({loading}) => ({
    updateTagsLoading: loading.effects['wx_material_library/updateTags'],
}))
export default class TagManagement extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: '',
            originTags: [],
            tags: []
        }
    }

    static propTypes = {
        visible: PropTypes.bool,
        record: PropTypes.object,
        onOk: PropTypes.func,
        onCancel: PropTypes.func
    }

    static defaultProps = {
        visible: false,
        record: {},
        onOk: ()=>{},
        onCancel: ()=>{},
    }

    componentDidMount() {
        const tags = this.getOriginTags()
        this.setState({
            tags: tags,
            originTags: tags
        })
    }

    componentWillUnmount() {
    }

    getOriginTags = () => {
        const {record} = this.props
        return record && record.tags ? record.tags : []
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
        const currentTags = [...this.state.tags]
        const has = currentTags.find((v) => {
            return v === value
        })
        if (has) {
            message.warning('标签已存在')
            return
        }
        currentTags.unshift(value)
        this.setState({
            value: '', // 清空输入框
            tags: currentTags,
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
        const tags = this.getOriginTags()
        const {tags: currentTags} = this.state

        if(tags.length === currentTags.length) {
            let include = true

            tags.forEach((v) => {
                if (!currentTags.includes(v)) {
                    include = false
                }
            })
            if(include) {
                let some = true

                for (let i = 0; i < tags.length; i++) {
                    if (tags[i] !== currentTags[i]) {
                        some = false
                    }
                }
                if(some) {
                    message.warning('标签没有变化')
                    return
                }
            }
        }
        this.updateTags(currentTags)
    }

    handleCancel = () =>{
        this.props.onCancel()
    }

    updateTags = (tags) => {
        const {record} = this.props
        tags = tags.reverse()
        const payload = {
            id: record.id,
            body: tags
        }
        this.props.dispatch({
            type: 'wx_material_library/updateTags',
            payload: payload,
            callback: () => {
                message.success('修改成功')
                this.props.onOk(payload)
            }
        })
    }

    render() {
        const {visible, record,  updateTagsLoading } = this.props
        const {value, tags} = this.state

        return <Modal
            title="管理标签"
            visible={visible}
            className={styles.wrapper}
            width={540}
            destroyOnClose={true}
            maskClosable={false}
            onOk={this.handleOk}
            okButtonProps={{ disabled: updateTagsLoading }}
            confirmLoading={updateTagsLoading}
            onCancel={this.handleCancel}
        >
            { record.id ?   <Fragment>
                <div className={styles.formItem}>
                    <span className={styles.label}>标签：</span> <Input placeholder={`输入限制${tagMaxLength}个字`}
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
            </Fragment> : null}
        </Modal>
    }
}

