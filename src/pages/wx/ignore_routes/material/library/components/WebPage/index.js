import React, {Component} from 'react'
import {Checkbox} from 'antd'
import config from 'wx/common/config'
import helper from 'wx/utils/helper'
import Info from '../Info'
import Tip from '../Tip'
import utils from "../../utils"
import styles from './index.scss'

const {DefaultImage, materialType} = config

export default class WebPage extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}

    componentWillUnmount() {}

    render() {
        const {list, record, selectedMaterials, removeLoading, onSelectMaterial, onRemove, onTagManagement} = this.props

        const messages = list.length ? helper.parseList(materialType.webPage.type, list) : []

        return  (
            <div className={styles.webPageWrap}>
                <Tip/>
                <div className={styles.boxes}>
                    {
                        messages.map((item)=>{
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
                                    <a href={body && body.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.info}>
                                        <div className={styles.title}>{body && body.title}</div>
                                        <div className={styles.desc}>
                                            <p className={styles.des}>{body && body.des}</p>
                                            <img src={body && body.thumb_url || DefaultImage}
                                                className={styles.icon}
                                                onError={(e) => {
                                                    e.target.src = DefaultImage
                                                }}
                                                rel="noreferrer"
                                                alt=""
                                            />
                                        </div>
                                    </a>
                                    <Info type={materialType.webPage.type}
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

