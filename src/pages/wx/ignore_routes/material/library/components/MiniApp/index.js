import React, {Component} from 'react'
import {Checkbox} from 'antd'
import helper from 'wx/utils/helper'
import Info from '../Info'
import Tip from '../Tip'
import utils from "../../utils"
import styles from './index.scss'

import config from 'wx/common/config'
const {DefaultImage, materialType} = config

export default class MiniApp extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}

    componentWillUnmount() {}

    render() {
        const {list, record, selectedMaterials, removeLoading, onSelectMaterial, onRemove, onTagManagement} = this.props

        const messages = list.length ? helper.parseList(materialType.miniApp.type, list) : []

        return  (
            <div className={styles.miniAppWrap}>
                <Tip/>
                <div className={styles.boxes}>
                    {
                        messages.map((item)=>{
                            const {body} = item
                            return <div key={item.id} className={styles.box}>
                                {
                                    item.is_operable ?  <div className={styles.checkbox}>
                                        <Checkbox checked={utils.isSelected(selectedMaterials, item.id)}
                                            onChange={(e)=>{onSelectMaterial(item.id, e)}}
                                        />
                                    </div> : null
                                }
                                <div className={styles.wrapper}>
                                    <div className={styles.info}>
                                        <div className={styles.meta}>
                                            <img className={styles.icon}
                                                src={body && body.weappinfo && body.weappinfo.weappiconurl || DefaultImage}
                                                onError={(e) => {
                                                    e.target.src = DefaultImage
                                                }}
                                                rel="noreferrer"
                                                alt=""
                                            />
                                            <span className={styles.title}>{body?.appinfo?.appname ? body?.appinfo?.appname: body?.sourcedisplayname || ''}</span>
                                        </div>
                                        <div className={styles.desc}>
                                            {body && body.title || ''}
                                        </div>
                                        <img src={body && body.thumb_url || DefaultImage}
                                            className={styles.cover}
                                            onError={(e) => {
                                                e.target.src = DefaultImage
                                            }}
                                            alt=""
                                        />
                                        <div className={styles.mark}><i className={styles.miniAppIcon}/><span>小程序</span></div>
                                    </div>
                                    <Info type={materialType.miniApp.type}
                                        item={item}
                                        record={record}
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

