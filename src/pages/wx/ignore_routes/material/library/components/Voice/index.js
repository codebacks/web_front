import React, {Component, Fragment} from 'react'
import {connect} from 'dva'
import {Checkbox, Icon} from 'antd'
import numeral from 'numeral'
import config from 'wx/common/config'
import helper from 'wx/utils/helper'
import Edit from '../Edit'
import Info from '../Info'
import Tip from '../Tip'
import utils from "../../utils"
import styles from './index.scss'

const {materialType} = config

@connect(({loading}) => ({
    convertLoading: loading.effects['wx_material_library/voiceConvert']
}))
export default class Voice extends Component {
    constructor(props) {
        super(props)
        this.state = {
            editVisible: false,
            record: {},
            parent: '',
            audios: {}, // id: { ele: node, playing: bool }
            currentAudio: {},
        }
        this._isMounted = false
    }

    componentDidMount() {
        this._isMounted = true
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    handlePlayAudio = (item) => {
        const {id, body} = item
        this.setState({currentAudio: id})
        if(body && body.media_url) {
            let audios = {...this.state.audios}
            const audio = audios[id]

            const ids = Object.keys(audios)
            for (let i = 0; i < ids.length; i++) {
                let key = ids[i]
                if (parseInt(key, 10) === id) {
                    continue
                }
                const audio = audios[key]
                if (audio.playing) {
                    audios[key].ele.pause()
                    break
                }
            }

            if (audio) {
                if (audio.playing) {
                    audio.ele.pause()
                } else {
                    audio.ele.play()
                }
            } else {
                this.voiceConvert(body.media_url, (data)=>{
                    const audioEle = new Audio(data.url)
                    audios[id] = {
                        ele: audioEle,
                        playing: false
                    }
                    this.setState({audios: audios}, () => {
                        this.play(id)
                        this.pause(id)
                        this.ended(id)
                        audioEle.play()
                    })
                })
            }
        }
    }

    voiceConvert = (url, callback) => {
        this.props.dispatch({
            type: 'wx_material_library/voiceConvert',
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

    play = (id) => {
        const audios = {...this.state.audios}
        const audioEle = audios[id].ele
        audioEle.addEventListener('play', () => {
            audios[id].playing = true
            this.setState({
                audios: audios
            })
        })
    }

    pause = (id) => {
        const audios = {...this.state.audios}
        const audioEle = audios[id].ele
        audioEle.addEventListener('pause', () => {
            audios[id].playing = false
            this.setState({
                audios: audios
            })
        })
    }

    ended = (id) => {
        const audios = {...this.state.audios}
        const audioEle = audios[id].ele
        audioEle.addEventListener('ended', () => {
            audios[id].playing = false
            this.setState({
                audios: audios
            })
        })
    }

    handleShowEdit = (type, record) => {
        this.setState({
            editVisible: true,
            record: record,
            parent: `materialLibrary${type}Edit${record.id}`,
        })
    }

    handleEditOk = (record, payload) => {
        this.handleHideEdit()
        this.props.onEditOk(record, payload)
    }

    handleHideEdit = () => {
        this.setState({
            editVisible: false,
            record: {},
            parent: '',
        })
    }

    render() {
        const {list, selectedMaterials, removeLoading, onSelectMaterial, onRemove, onTagManagement, convertLoading} = this.props
        const {editVisible, record, parent, audios, currentAudio} = this.state

        const messages = list.length ? helper.parseList(materialType.voice.type, list) : []

        return  (
            <div className={styles.voiceWrap}>
                <Tip/>
                <div className={styles.boxes}>
                    {
                        messages.map((item)=>{
                            const audio = audios[item.id]
                            const body = item.body
                            return <div key={item.id} className={styles.box}>
                                {
                                    item.is_operable ?  <div className={styles.checkbox}>
                                        <Checkbox checked={utils.isSelected(selectedMaterials, item.id)}
                                            onChange={(e)=>{onSelectMaterial(item.id, e)}}
                                        />
                                    </div> : null
                                }
                                <div className={styles.wrapper}>
                                    <div className={styles.voiceInfo}>
                                        <div className={styles.mark}
                                            onClick={()=>{this.handlePlayAudio(item)}}
                                        >
                                            {
                                                audio && audio.playing ? <div className={styles.playing}>
                                                    <img src={require('wx/assets/images/bubble.svg')}
                                                        className={styles.bubble}
                                                        alt=""/>
                                                    <img src={require('wx/assets/images/voice_left.gif')}
                                                        className={styles.icon}
                                                        alt=""
                                                    />
                                                </div> : (convertLoading && currentAudio === item.id ? <div className={styles.convert}>
                                                    <img src={require('wx/assets/images/bubble.svg')}
                                                        className={styles.bubble}
                                                        alt=""/>
                                                    <Icon type="loading"
                                                        className={styles.icon}
                                                    />
                                                </div> : <div className={styles.pause}>
                                                </div>)
                                            }
                                        </div>
                                        <span className={styles.duration}>{numeral(body && body.duration/1000 || 0).format('0')}"</span>
                                    </div>
                                    <div className={styles.titleWrap}>
                                        <span className={styles.title}>{item.title}</span>
                                        {
                                            item.is_operable ? <Fragment><Icon type="edit"
                                                className={styles.edit}
                                                id={`materialLibraryVoiceEdit${item.id}` }
                                                onClick={()=>{this.handleShowEdit('Voice', item)}}
                                            />{
                                                editVisible && record.id === item.id ? <Edit {...this.props}
                                                    visible={editVisible}
                                                    record={{...record, ...{url: body && body.media_url || ''}}}
                                                    parent={parent}
                                                    onOk={this.handleEditOk}
                                                    onCancel={this.handleHideEdit}
                                                /> : null
                                            }</Fragment>: null
                                        }
                                    </div>
                                    <Info type={materialType.voice.type}
                                        item={item}
                                        record={this.props.record}
                                        removeLoading={removeLoading}
                                        onRemove={onRemove}
                                        onTagManagement={onTagManagement}
                                    />
                                </div>
                            </div>
                        })
                    }
                </div>
            </div>
        )
    }
}

