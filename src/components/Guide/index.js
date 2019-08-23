/**
 **@Description:引导
 **@author: wangchunting
 */

import React, { Component } from 'react'
import { connect } from 'dva'
import { Modal } from 'antd'
import styles from "./index.less"

@connect(({ base, guide }) => ({
    base, guide
}))
export default class Guide extends Component {
    state = {
        guideVisible: false,
        isGuideModal: false,
        isUpdataGuide: false
    }

    componentDidMount() {
        const { type } = this.props
        this.getGuidances(type)
    }

    getGuidances(type) {
        this.props.dispatch({
            type: 'guide/guidances',
            payload: {
                type: type,
                is_update: 2
            },
            callback: (data) => {
                if (data && data.status === 1) {
                    this.setState({
                        isGuideModal: true,
                        isUpdataGuide: true
                    })
                }
            }
        })
    }

    handleGuideCancel = () => {
        this.setState({
            guideVisible: false,
            isGuideModal: false
        }, () => {
            if (this.state.isUpdataGuide) {
                this.getHideGuidances()
            }
        })
    }

    guideFlowModal = () => {
        this.setState({
            guideVisible: true,
            isGuideModal: false
        })
    }

    getHideGuidances() {
        const { type } = this.props
        this.props.dispatch({
            type: 'guide/hideGuidances',
            payload: {
                type: type
            }
        })
    }

    render() {
        const { guideTitle, guideFlowImg } = this.props
        return (
            <div>
                {
                    this.state.isGuideModal ?
                        <div className={styles.guide}>
                            <div className={styles.guideBg}>
                                <div className={styles.guideContent}>
                                    <p>{guideTitle}</p>
                                </div>
                            </div>
                        </div>
                        : ''
                }
                <div className={styles.guideIcon} onClick={() => this.guideFlowModal()}>
                    <div>
                        <img src={require(`platform/assets/images/icon_guide.svg`)} alt="" width='32' height='32' />
                        <p>引导</p>
                    </div>
                </div>
                <Modal
                    title="使用引导"
                    visible={this.state.guideVisible}
                    onCancel={this.handleGuideCancel}
                    width={480}
                    height={542}
                    cancelText="关闭"
                    className={styles.guideModelBtn}
                >
                    <div className={styles.guideModal}>
                        <img src={guideFlowImg} alt="" />
                    </div>
                </Modal>
            </div >
        )
    }
}