'use strict'

/**
 * 文件说明: 客户资料
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期: 18/8/20
 */

import React from 'react'
import {Form, Row, Col, Avatar, Tag} from 'antd'
import styles from './Base.scss'
import Helper from 'crm/utils/helper'
import config from 'crm/common/config'

const FormItem = Form.Item
const {Sex, DefaultAvatar} = config

export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
        }
    }
    componentDidMount() {
        const {id} = this.props.match.params
        this.loadInfo(id)
    }

    loadInfo = (id) => {
        this.props.dispatch({
            type: 'crm_customers/queryDetail',
            payload: {id: id}
        })
    }

    render() {
        const {detail} = this.props.crm_customers

        const getArea = (record) => {
            if (record.province || record.city) {
                return record.province + record.city
            } else {
                return '未知'
            }
        }
        return (
            <div>
                { Object.keys(detail).length ?  <div className={styles.base}>
                    <div className={styles.box}>
                        <p className={styles.title}>客户信息</p>
                        <div className={styles.content}>
                            <div className={styles.row}>
                                <span className={styles.label}>姓名：</span>
                                <span className={styles.value}>{detail.name || '--'}</span>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.label}>性别：</span>
                                <span className={styles.value}>{Sex[detail.gender]}</span>
                                <span className={styles.label}>生日：</span>
                                <span className={styles.value}>{Helper.formatBirthday(detail.birth_year, detail.birth_month, detail.birth_day) || '未知'}</span>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.label}>地区：</span>
                                <span className={styles.value}>{getArea(detail)}</span>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.label}>备注：</span>
                                <span className={styles.value}>{detail.remark || '无'}</span>
                            </div>
                        </div>
                    </div>
                    { Object.keys(detail.wechat).length ? <div className={styles.box}>
                        <p className={styles.title}>微信信息</p>
                        <div className={`${styles.content} ${styles.wechatInfo}`}>
                            <div className={styles.baseWrap}>
                                <Avatar className={styles.avatar} src={detail.wechat.head_img_url || DefaultAvatar}
                                />
                                <div className={styles.main}>
                                    <div className={styles.row}>
                                        {detail.wechat.nickname}
                                    </div>
                                    <div className={styles.row}>
                                        <span className={styles.label}>性别：</span><span>{Sex[detail.wechat.sex]}</span>
                                    </div>
                                    <div className={styles.row}>
                                        <span>地区：</span><span>
                                            { detail.wechat.lvbuff.province || detail.wechat.lvbuff.city
                                                ? detail.wechat.lvbuff.province + detail.wechat.lvbuff.city
                                                : '未知'}</span>
                                    </div>
                                    <div className={styles.row}>
                                        <span>个性签名：</span><span>{detail.wechat.signature}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.tagsWrap}>
                                <span>标签：</span>
                                {
                                    detail.tags.map((tag, idx)=>{
                                        return  <Tag key={idx} color="blue" className={styles.tag}>{tag}</Tag>
                                    })
                                }
                            </div>
                        </div>

                        <div className={styles.other}>
                            { detail.wechat.lvbuff.mobile ? <p><span>电话号码：</span>{detail.wechat.lvbuff.mobile}</p> : ''}
                            { detail.wechat.lvbuff.description ? <p><span>描述：</span>{detail.wechat.lvbuff.description}</p> : ''}
                            { detail.wechat.lvbuff.extra_image ? <p><span>附加图片：</span>
                                <img className={styles.additional} src={detail.wechat.lvbuff.extra_image} alt="附加图片"/>
                            </p> :''}
                        </div>
                    </div> : ''}
                </div> : ''}
            </div>
        )
    }
}
