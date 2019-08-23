/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/9/20
 */

import React from 'react'
import PropTypes from 'prop-types'
import {Popover, Tabs} from 'antd'
import styles from './index.less'
import faceMap from '../../faceMap'

const TabPane = Tabs.TabPane
const {QQFaceList, QQFaceMap, EmojiList} = faceMap

class Index extends React.PureComponent {
    static propTypes = {
        onIconClick: PropTypes.func,
        insertFace: PropTypes.func,
    }

    constructor(props) {
        super(props)
        this.state = {
            visible: false,
        }
    }

    componentDidMount() {
    }

    handleFace = (e) => {
        this.props.insertFace(e)
        this.setState({visible: false})
        e.stopPropagation()
        e.preventDefault()
    }

    handleVisibleChange = (visible) => {
        this.setState({visible})
    }

    render() {
        const content = (
            <Tabs defaultActiveKey="1" style={{width: 435, height: 284}}>
                <TabPane tab="表情" key="1">
                    <div className={styles.qq_face} onClick={this.handleFace}>
                        {QQFaceList.map((item, idx) => {
                            return (
                                <a
                                    type="qq"
                                    key={'face' + idx}
                                    data-idx={idx}
                                    className={`${styles.face} ${styles[`qqface${QQFaceMap[item]}`]}`}
                                    title={'[' + item + ']_web'}
                                >
                                </a>
                            )
                        })}
                    </div>
                </TabPane>
                <TabPane tab="符号表情" key="2">
                    <div className={`${styles.emoji_wrap} ${styles.tinyScrollbar}`}>
                        <div className={styles.emoji_face} onClick={this.handleFace}>
                            {EmojiList.map((item, idx) => {
                                return (
                                    <a
                                        type="emoji"
                                        key={'emoji' + idx}
                                        data-idx={idx}
                                        className={`${styles.face} ${styles[`emoji${idx}`]}`}
                                        title={'[' + item + ']_web'}
                                    >
                                    </a>
                                )
                            })}
                        </div>
                    </div>
                </TabPane>
            </Tabs>
        )

        return (
            <div className={styles.faceWrap}>
                <Popover
                    content={content}
                    title=""
                    placement="topLeft"
                    trigger="click"
                    visible={this.state.visible}
                    arrowPointAtCenter
                    onVisibleChange={this.handleVisibleChange}
                >
                    <button type="button" onClick={this.props.onIconClick} className={styles.faceBtn}>
                        <span className={styles.icon}/>
                    </button>
                </Popover>
            </div>
        )
    }
}

export default Index
