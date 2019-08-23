import React, {PureComponent} from 'react'
import MiniApp from '../MiniApp/index'
import File from '../File/index'
import Image from '../Image'
import Music from '../Music/index'
import config from 'common/config'
import Forward from '../Forward/index'
import {MessageSubType} from '../../config'
import styles from './index.less'

const {DefaultImage} = config

export default class Sharing extends PureComponent {
    constructor(props) {
        super(props)
        this.state = { }
    }

    componentDidMount() {

    }

    render() {
        const {record, onClick} = this.props
        const body = record.body

        if(body) {
            // 小程序
            if (MessageSubType.miniApp.includes(record.app_msg_type) || MessageSubType.miniApp.includes(body.type)) {
                return <MiniApp record={record}/>
            } else if (record.app_msg_type === MessageSubType.music || body.type === MessageSubType.music) {
                // 音乐
                return <Music record={record}/>
                // 文件
            } else if (record.app_msg_type === MessageSubType.file || body.type === MessageSubType.file) {
                return  <File record={record}/>
                // GIF
            }else if (record.app_msg_type === MessageSubType.gif || body.type === MessageSubType.gif) {
                return <Image record={record} onClick={onClick}/>
            } else if (record.app_msg_type === MessageSubType.forward || body.type === MessageSubType.forward) {
                return <Forward record={record}/>
            } else {
                return <div className={`${styles.box} ${styles.sharing}`}>
                    <a href={body.url ? body.url : null}
                        className={styles.link}
                        target="_blank"
                        rel="noopener noreferrer">
                        <div className={styles.title}>{body.title}</div>
                        <div className={styles.cont}>
                            <div className={styles.desc}>{body.des}</div>
                            <img className={styles.cover}
                                src={body.thumb_url || ''}
                                onError={(e) => {
                                    e.target.src = DefaultImage
                                }}
                                rel="noreferrer"
                                alt=""
                            />
                        </div>
                    </a>
                </div>
            }
        } else {
            return <div className={`${styles.box} ${styles.text}`}>
                【未知消息】请在手机上查看
            </div>
        }
    }
}

