/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import styles from './index.less'
import {Spin} from 'antd'
import _ from 'lodash'

export default class Index extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            error: false,
        }
        this.timestamp = this.getTimestamp()
        this.isFirst = false
    }

    getTimestamp() {
        return Math.floor(Date.now())
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'app/setStateByPath',
            payload: {
                path: 'activeIframeMessage',
                value: this.postMessage,
            },
        })
    }

    postMessage = (message, targetOrigin = this.getUrl()) => {
        try {
            if (this.iframeRef) {
                this.iframeRef.contentWindow.postMessage(message, targetOrigin)
            }
        }catch (e) {
            console.error(e)
        }
    }

    getIframe = (node) => {
        this.iframeRef = node
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'app/setStateByPath',
            payload: {
                path: 'activeIframeMessage',
                value: null,
            },
        })
    }

    onLoad = (e) => {
        this.setState({
            loading: false,
        })
    }

    onError = (e) => {
        this.setState({
            loading: false,
            error: true,
        })
    }

    setUrl = () => {
        return window.encodeURI(`${this.getUrl()}?hz_timestamp=${this.timestamp}&access_token=${this.props.accessToken}`)
    }

    getUrl = () => {
        return _.get(this, 'props.url', '')
    }

    render() {
        const {
            show,
        } = this.props
        const {
            loading,
            error,
        } = this.state

        if (show) {
            this.isFirst = true
        }

        return (
            <div
                className={styles.main}
                style={{
                    display: !show && 'none',
                }}
            >
                <div
                    className={styles.loading}
                    style={{
                        display: !loading && 'none',
                    }}
                >
                    <Spin size="large"/>
                </div>
                <div
                    className={styles.error}
                    style={{
                        display: !error && 'none',
                    }}
                >
                    应用出错了!!!
                </div>
                {
                    this.isFirst && (
                        <iframe
                            ref={this.getIframe}
                            className={styles.iframe}
                            src={this.setUrl()}
                            onLoad={this.onLoad}
                            onError={this.onError}
                        />
                    )
                }
            </div>
        )
    }
}
