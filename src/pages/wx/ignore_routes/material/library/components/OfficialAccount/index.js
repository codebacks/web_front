import React, {Component} from 'react'
import {Checkbox} from 'antd'
import _ from 'lodash'
import helper from 'wx/utils/helper'
import Info from '../Info'
import Tip from '../Tip'
import utils from "../../utils"
import styles from './index.scss'

import config from 'wx/common/config'
import {filterUsername} from '../../config'
const {DefaultImage, materialType} = config


export default class OfficialAccount extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}

    componentWillUnmount() {}

    getMeta = (item) => {
        let username = _.get(item, 'card_username') || _.get(item, 'body.username') || ''
        let meta = ''
        if (username.startsWith('gh_') || filterUsername.includes(username) || _.get(item, 'body.certflag')) {
            meta = '公众号名片'
        } else {
            meta = '个人名片'
        }
        return meta
    }

    render() {
        const {list, record, selectedMaterials, removeLoading, onSelectMaterial, onRemove, onTagManagement} = this.props

        const messages = list.length ? helper.parseList(materialType.officialAccount.type, list) : []

        return  (
            <div className={styles.officialAccountWrap}>
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
                                    <div className={styles.card}>
                                        <div className={styles.info}>
                                            <img src={body && (body.brandIconUrl || body.head_img_url || body.smallheadimgurl) || DefaultImage}
                                                className={styles.cover}
                                                onError={(e) => {
                                                    e.target.src = DefaultImage
                                                }}
                                                alt=""
                                                rel="noreferrer"
                                            />
                                            <div className={styles.title}>
                                                <span>{body && body.nickname}</span>
                                            </div>
                                        </div>
                                        <div className={styles.meta}>{this.getMeta(item)}</div>
                                    </div>
                                    <Info type={materialType.officialAccount.type}
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

