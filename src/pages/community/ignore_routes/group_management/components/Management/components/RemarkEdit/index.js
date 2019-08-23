'use strict'

import React from 'react'
import {Input, Button, Icon, message, Popover} from 'antd'
import styles from './index.less'
const { TextArea } = Input

class RemarkModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            remark: '',
            record: null,
            editLoading: false
        }
    }

    componentDidMount() {
        let {remark} = this.props.record.target
        this.setState({
            remark: remark,
            record: this.props.record
        })
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.record && (nextProps.record.target.username !== prevState.record.target.username
            || nextProps.record.from.uin !== prevState.record.from.uin)) {
            return {
                remark: nextProps.record.target.remark,
                record: nextProps.record,
            }
        }
        return null
    }

    handleChange = (e) => {
        const limit = 20
        if (e.target.value.length > limit) {
            e.target.value = e.target.value.substr(0, limit)
            message.error(`限制${limit}字以内`)
        }
        this.setState({remark: e.target.value})
    };
    handleSave = () => {
        this.setState({editLoading: true})
        let {record} = this.props
        this.props.dispatch({
            type: 'community_group_management/update',
            payload: {
                uin: record.from.uin,
                username: record.target.username,
                body: {
                    remark: this.state.remark
                }
            },
            callback: () => {
                this.setState({editLoading: false})
                this.props.onOk()
            }
        })
    };
    handleCancel = () => {
        this.setState({
            remark: this.props.record.target.remark
        })
        this.props.onCancel()
    }
    render() {
        const {visible} = this.props
        const {editLoading, remark} = this.state
        const content = <div className={styles.remarkEdit}>
            <TextArea
                placeholder="请输入备注（限制20字以内）"
                value={remark}
                onChange={this.handleChange} />
            <div className={styles.footer}>
                <Button className={styles.save}
                    type="primary"
                    size="small"
                    onClick={this.handleSave}
                >
                    {editLoading ? <Icon type="loading"/> : '确定'}
                </Button>
                <Button className={styles.cancel}
                    onClick={this.handleCancel}
                    size="small"
                >取消</Button>
            </div>
        </div>
        return (
            <Popover
                title="备注"
                content={content}
                visible={visible}
                trigger="click"
                onVisibleChange={this.props.onChangeVisible}
            >
            </Popover>
        )
    }
}

RemarkModal.propTypes = {}


export default RemarkModal
