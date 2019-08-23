import React from 'react'
import { Modal, Input, Radio, DatePicker, message } from 'antd'
import {connect} from 'dva'
import styles from './index.less'
import _ from "lodash"
import moment from "moment/moment"
import Editor from 'components/Face/components/Editor'

const TextArea = Input.TextArea
const RadioGroup = Radio.Group
const TEXT_MAX_LENGTH = 1000

@connect(({base, community_groupNotice, loading}) => ({
    base, community_groupNotice,
    editLoading: loading.effects['community_groupNotice/update'],
}))
export default class extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        this.reset()
    }

    reset = () => {
        this.props.dispatch({
            type: 'community_groupNotice/resetParams',
        })
        this.props.dispatch({
            type: 'community_groupNotice/resetEditBody',
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if(key === 'execute_now') {
            val = e.target.value
        }else if(key === 'execute_time' || key === 'notice') {
            val = e
        }
        let editBody = {...this.props.community_groupNotice.editBody}
        editBody[key] = val
        if(key === 'execute_now') {
            if(val === 1) {
                editBody['execute_time'] = undefined
            }
        }
        this.props.dispatch({
            type: 'community_groupNotice/setEditBody',
            payload: {
                editBody: editBody,
            },
        })
    }

    onCancel = () => {
        this.props.onCancel()
    }

    refresh = () => {
        this.props.refresh()
    }

    onOk = () => {
        const { editBody, selectedRows } = this.props.community_groupNotice
        const { dispatch } = this.props
        let notice = editBody?.notice || ''

        if(!notice || !Editor.computeMsgLength(notice)) {
            message.warn('请输入群公告')
            return false
        }
        if(Editor.computeMsgLength(notice) > TEXT_MAX_LENGTH) {
            message.warn(`公告内容字数不超过${TEXT_MAX_LENGTH}字`)
            return false
        }
        if(editBody.execute_now === 0 && !editBody.execute_time) {
            message.warn('请选择时间')
            return false
        }

        let chatroom_names = ''
        selectedRows.forEach((item, index) => {
            if(index === 0){
                chatroom_names += item.target.username
            }else{
                chatroom_names += `,${item.target.username}`
            }
        })

        dispatch({
            type: 'community_groupNotice/setEditBody',
            payload: {
                editBody: {...editBody, chatroom_names: chatroom_names}
            }
        })
        let params = {}
        if(selectedRows.length > 1) {
            params.batch = 1
        }
        setTimeout(() => {
            dispatch({
                type: 'community_groupNotice/update',
                payload: {
                    unFaceNotice: Editor.htmlToMsg(notice),
                    params: params,
                },
                callback: this.refresh,
            })
        }, 500)
    }

    onTimeOk = (value) => {
        if(!value) {
            message.warn('请选择时间')
            return false
        }
    }

    disabledDate = (current) => {
        return current && current < moment().startOf('day')
    }

    disabledTime = (current) => {
        current = current || moment()
        if(!current) {
            return
        }

        return {
            disabledHours: this.getDisabledHoursFn(current),
            disabledMinutes: this.getDisabledMinutesFn(current),
        }
    }

    getDisabledHoursFn = (current) => {
        return () => {
            const arr = []
            const startCurrent = current.clone()
            startCurrent.startOf('day')
            const now = moment().add(10, 'minutes').startOf('hour')

            for(let i = 0; i < 23; i++) {
                if(startCurrent < now) {
                    arr.push(i)
                }

                startCurrent.add(1, 'hours')
            }

            return arr
        }
    }

    getDisabledMinutesFn = (current) => {
        return () => {
            const arr = []

            const startCurrent = current.clone()
            startCurrent.startOf('hour')
            const now = moment().add(10, 'minutes').startOf('minute')

            for(let i = 0; i < 60; i++) {
                if(startCurrent < now) {
                    arr.push(i)
                }

                startCurrent.add(1, 'minutes')
            }

            return arr
        }
    }

    render() {
        const { selectedRows, editBody, onlyOne } = this.props.community_groupNotice
        const { editLoading, visible } = this.props

        return (
            <Modal
                className={styles.noticeModal}
                visible={visible}
                width={800}
                title="修改群公告"
                onOk={this.onOk}
                onCancel={this.onCancel}
                okButtonProps={{loading: editLoading}}
                maskClosable={false}
            >
                <h3>编辑公告内容</h3>
                <Editor
                    placeholder={`限制${TEXT_MAX_LENGTH}个字`}
                    onChange={(e) => this.handleChange('notice', e)}
                    extend={<span/>}
                    disableKeyDown={true}
                    value={editBody?.notice}
                    className={styles.faceEditor}
                />
                {/*<TextArea
                    rows={4}
                    value={editBody.notice}
                    placeholder="请输入群公告，1000字以内"
                    onChange={(e) => this.handleChange('notice', e)}
                    maxLength={1000}
                />*/}
                {
                    onlyOne
                        ? <div className={styles.marginVertical}>当前修改群：{_.get(selectedRows[0], 'target.nickname') ? _.get(selectedRows[0], 'target.nickname'): _.get(selectedRows[0], 'target.display_name')}</div>
                        : <div className={styles.marginVertical}>已选择群总数量： {selectedRows.length} 个</div>
                }
                <RadioGroup
                    onChange={(e) => this.handleChange('execute_now', e)}
                    value={editBody.execute_now}
                >
                    <Radio value={1}>立即执行</Radio>
                    <Radio value={0}>定时执行</Radio>
                </RadioGroup>
                {
                    editBody.execute_now === 0 ?
                        <DatePicker
                            disabledDate={this.disabledDate}
                            disabledTime={this.disabledTime}
                            showTime={{
                                format: 'HH:mm',
                                defaultValue: moment().add(10, 'minutes'),
                            }}
                            value={editBody.execute_time && moment(editBody.execute_time).format() !== 'Invalid date' ? moment(editBody.execute_time) : null}
                            format="YYYY-MM-DD HH:mm:ss"
                            placeholder="请选择时间"
                            onChange={(e) => this.handleChange('execute_time', e)}
                            onOk={this.onTimeOk}
                        />
                        : null
                }

            </Modal>
        )
    }
}
