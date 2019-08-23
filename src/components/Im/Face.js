'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/11/3
 */
/* eslint-disable */
import React from 'react'
import {Popover, Tabs} from 'antd'
import styles from './Face.scss'
import config from 'common/config'

const TabPane = Tabs.TabPane
const {QQFaceList, QQFaceMap, EmojiList} = config

class Face extends React.Component {
    constructor(props) {
        super()
        this.state = {
            visible: false,
        }
    }

    componentDidMount() {
    }

    handleFace(e) {
        this.props.insertFace(e.target.getAttribute('data-idx'), e.target.type)
        this.setState({visible: false})
        e.stopPropagation()
        e.preventDefault()
    }

    handleVisibleChange(visible) {
        this.setState({visible})
    }

    render() {
        const content = (<div className={styles.faceTab}>
            <Tabs defaultActiveKey="1" style={{width: 435, height: 284}} className="baseFaceWrap">
                <TabPane tab="表情" key="1">
                    <div className="base_qq_face" onClick={this.handleFace.bind(this)}>
                        {QQFaceList.map((item, idx) => {
                            return (
                                <a
                                    type="qq"
                                    key={'face' + idx}
                                    data-idx={idx}
                                    className={'base-face base-qqface' + QQFaceMap[item]}
                                    title={'[' + item + ']_web'}
                                />
                            )
                        })}
                    </div>
                </TabPane>

                <TabPane tab="符号表情" key="2">
                    <div className={"base-emoji-wrap " + styles.tinyScrollbar}>
                        <div className="base_emoji_face" onClick={this.handleFace.bind(this)}>
                            {EmojiList.map((item, idx) => {
                                return (
                                    <a
                                        type="emoji"
                                        key={'face' + idx}
                                        data-idx={idx}
                                        className={'base-face base-emoji' + idx}
                                        title={'[' + item + ']_web'}
                                    />
                                )
                            })}
                        </div>
                    </div>
                </TabPane>
            </Tabs>

        </div>)
        return (
            <div className={styles.faceWrap} id="baseEditorFaceWrap">
                <Popover
                    getPopupContainer={()=>document.getElementById('baseEditorFaceWrap')}
                    content={content}
                    title=""
                    placement="topLeft"
                    trigger="click"
                    visible={this.state.visible}
                    arrowPointAtCenter
                    onVisibleChange={this.handleVisibleChange.bind(this)}
                >
                    <button onClick={this.props.onIconClick} className={styles.faceBtn}><span
                        className={styles.icon + ' ' + styles.smileIcon}/>
                    </button>
                </Popover>
            </div>
        )
    }
}

export default Face
