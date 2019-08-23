import React, {PureComponent} from 'react'
import {connect} from 'dva'
import {Icon} from 'antd'
import numeral from 'numeral'
import _ from 'lodash'
import helper from 'utils/helper'
import styles from './index.less'

@connect(({messages, loading}) => ({
    messages,
    convertLoading: loading.effects['messages/voiceConvert']
}))
export default class Voice extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
        }
        this._isMounted = false
    }
    componentDidMount() {
        this._isMounted = true
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    handlePlayAudio = (e, record) => {
        e.stopPropagation()
        const {body} = record
        const uuid = helper.getUniqueMessageId(record)
        if (body && body.media_url) {
            const mediaUrl = body.media_url
            let {audio} = this.props
            let audioEle = audio.ele
            if (audioEle) {
                if (audio.uuid === uuid) {
                    if (audio.playing) {
                        audioEle.pause()
                    } else {
                        audioEle.play()
                    }
                    return
                }

                audio.uuid = uuid

                this.setAudio(audio)
                const url = this.getConvertedUrl(uuid)
                if (url) {
                    audio.ele.src = url
                    this.playAudio(audio)
                } else {
                    this.voiceConvert(mediaUrl, (data) => {
                        this.setAudioUrls(uuid, data.url)
                        audio.ele.src = data.url
                        this.playAudio(audio)
                    })
                }

            } else {
                audio.uuid = uuid
                this.setAudio(audio)
                this.voiceConvert(mediaUrl, (data) => {
                    this.setAudioUrls(uuid, data.url)
                    audio.ele = new Audio(data.url)
                    this.playAudio(audio)
                })
            }
        }
    }

    playAudio = (audio) => {
        this.play(audio)
        this.pause(audio)
        this.ended(audio)
        audio.ele.play()
    }

    play = (audio) => {
        const audioEle = audio.ele
        audioEle.addEventListener('play', () => {
            audio.playing = true
            this.setAudio(audio)
        }, false)
    }

    pause = (audio) => {
        const audioEle = audio.ele
        audioEle.addEventListener('pause', () => {
            audio.playing = false
            this.setAudio(audio)
        }, false)
    }

    ended = (audio) => {
        const audioEle = audio.ele
        audioEle.addEventListener('ended', () => {
            audio.playing = false
            this.setAudio(audio)
        }, false)
    }

    setAudio = (audio) => {
        this.props.dispatch({
            type: 'messages/setProperty',
            payload: {
                audio: audio
            }
        })

    }

    setAudioUrls = (uuid, url) => {
        let audioUrls = {...this.props.messages.audioUrls}
        audioUrls[uuid] = url
        this.props.dispatch({
            type: 'messages/setProperty',
            payload: {
                audioUrls: audioUrls
            }
        })
    }

    getIcon = () => {
        const {convertLoading, record, audio} = this.props
        const uuid = helper.getUniqueMessageId(record)
        if (convertLoading && uuid === audio.uuid) {
            return <Icon type="loading" className={styles.loading}/>
        }
        if (audio.playing && uuid === audio.uuid) {
            return <span className={styles.playing}/>
        }
        return <span className={styles.pause}/>
    }

    voiceConvert = (url, callback) => {
        this.props.dispatch({
            type: 'messages/voiceConvert',
            payload: {
                body: {
                    url: url,
                    is_text: false
                }
            },
            callback: (data) => {
                if(this._isMounted) {
                    callback && callback(data)
                }
            }
        })
    }

    getConvertedUrl = (uuid) => {
        const {audioUrls} = this.props.messages
        const key = Object.keys(audioUrls).find((k) => {
            return k === uuid
        })
        if (key) {
            return audioUrls[key]
        }
    }

    render() {
        // const {record} = this.props
        const record = {...this.props.record}

        let dom = ''

        if (_.get(record, 'body.media_url')) {
            if(record.is_sender){
                dom = <div className={`${styles.box} ${styles.voice}`}>
                    <span className={styles.duration}>{numeral(_.get(record, 'body.duration', 0)/1000).format('0')}"</span>
                    <div className={`${styles.bubble} ${styles.right}`}
                        onClick={(e)=>{this.handlePlayAudio(e, record)}}>
                        {this.getIcon()}
                    </div>
                </div>
            } else {
                dom = <div className={`${styles.box} ${styles.voice}`}>
                    <div className={`${styles.bubble} ${styles.left}`}
                        onClick={(e)=>{this.handlePlayAudio(e, record)}}>
                        {this.getIcon()}
                    </div>
                    <span className={styles.duration}>{numeral(_.get(record, 'body.duration', 0)/1000).format('0')}"</span>
                </div>
            }
        } else {
            dom = <div className={`${styles.box} ${styles.text}`}>【语音】请在手机上查看</div>
        }
        return dom
    }
}
