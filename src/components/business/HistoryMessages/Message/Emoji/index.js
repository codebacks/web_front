import React, {PureComponent} from 'react'
import {connect} from 'dva'
import {Icon} from 'antd'
import _ from 'lodash'
import config from 'common/config'
import helper from 'utils/helper'
import ErrorImage from '../ErrorImage'

import styles from './index.less'

const {DefaultImage} = config

@connect(({messages, group_messages}) => ({
    messages, group_messages
}))
export default class Emoji extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            url: '',
            loading: false
        }
        this._isMounted = false
    }

    componentDidMount() {
        this._isMounted = true
        this.loadImg()
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    loadImg = () => {
        const {record, onImageLoad} = this.props
        const mediaUrl = _.get(record, 'body.media_url') || _.get(record, 'body.thumb_url')

        if (mediaUrl || record.isLoaded) {
            this.setState({url: mediaUrl})
        } else {
            const md5 = record.body.md5
            const url = _.get(record, 'body.cdnurl') || ''
            this.setState({
                loading: true
            }, () => {
                if(_.isFunction(onImageLoad)) {
                    const payload = {url, md5, record}
                    onImageLoad(payload, (url) => {
                        if (this._isMounted) {
                            let obj = {url}
                            obj.loading = false
                            this.setState({...obj})
                        }
                    })
                }
            })
        }
    }

    onLoad = (e) => {
    }

    onError = (e) => {
        e.target.src = DefaultImage
    }

    render() {
        const {record, onClick} = this.props
        const {url, loading} = this.state
        const wrapCls = {width: 120, height: 120}
        const uuid = helper.getUniqueMessageId(record)

        return <div className={styles.box} style={wrapCls}>
            {
                loading ? <div className={styles.loading}>
                    <Icon type="loading"/>
                </div>
                    : url ? <div className={styles.emoji}>
                        <img src={url}
                            className={styles.img}
                            onClick={() => onClick(url, uuid)}
                            onLoad={this.onLoad}
                            onError={this.onError}
                            rel="noreferrer"
                            alt=""/>
                    </div> : <ErrorImage tip={'[表情]请在手机上查看'}/>
            }
        </div>
    }
}
