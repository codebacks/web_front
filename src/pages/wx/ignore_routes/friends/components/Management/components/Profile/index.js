'use strict'

/**
 * 文件说明: 客户资料
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期: 18/8/20
 */

import React, {Component} from 'react'
import {Modal, Spin, Avatar, Tag, Button} from 'antd'
import {connect} from 'dva'
import _ from 'lodash'
import Helper from 'wx/utils/helper'
import config from 'wx/common/config'
import styles from './index.scss'


const {Sex, DefaultAvatar, DefaultImage} = config

@connect(({loading}) => ({
    customerDetailLoading: loading.effects['wx_friends/customerDetail'],
}))
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount() {
        const {record} = this.props
        if(record && record.id) {
            this.loadInfo(record.id)
        }
    }

    loadInfo = (id) => {
        this.props.dispatch({
            type: 'wx_friends/customerDetail',
            payload: {id: id}
        })
    }

    handleCancel = () => {
        this.props.onCancel()
    }

    render() {
        const {customerDetail: detail} = this.props.wx_friends
        const {visible, customerDetailLoading} = this.props

        const getArea = (record) => {
            if (record.province || record.city) {
                return record.province + record.city
            } else {
                return '未知'
            }
        }

        const getMobile = (detail) => {
            let mobile = _.get(detail, 'wechat.lvbuff.mobile')
            if (mobile) {
                if (mobile.endsWith(',')) {
                    return mobile.substr(0, mobile.length - 1)
                }
                return mobile
            }
            return '--'
        }

        return (
            <Modal
                title="好友详情"
                visible = {visible}
                width = {800}
                maskClosable={false}
                onCancel={this.handleCancel}
                footer={[<Button key="cancel" onClick={this.handleCancel}>取消</Button>]}>
                <Spin spinning={customerDetailLoading}>
                    {
                        Object.keys(detail).length ? <div>
                            <div className={styles.box}>
                                <p className={styles.title}>微信信息</p>
                                <div className={styles.content}>
                                    <div className={styles.baseWrap}>
                                        <Avatar className={styles.avatar}
                                            src={detail.wechat.head_img_url || DefaultAvatar}
                                            rel="noreferrer"
                                        />
                                        <div className={styles.main}>
                                            <div className={styles.row}>
                                                <span className={styles.nickname}>{detail.wechat.remark_name || detail.wechat.nickname}</span>
                                            </div>
                                            <div className={styles.left}>
                                                <div className={styles.row}>
                                                    <span className={styles.label}>微信号：</span>{detail.wechat.alias || detail.wechat.username}
                                                </div>
                                                <div className={styles.row}>
                                                    <span className={styles.label}>性别：</span><span>{Sex[detail.wechat.sex]}</span>
                                                </div>
                                                <div className={styles.row}>
                                                    <span className={styles.label}>地区：</span><span>
                                                        { _.get(detail, 'wechat.lvbuff.province', '') || _.get(detail, 'wechat.lvbuff.city', '')
                                                            ? _.get(detail, 'wechat.lvbuff.province', '') + _.get(detail, 'wechat.lvbuff.city', '')
                                                            : '未知'}</span>
                                                </div>
                                                <div className={styles.row}>
                                                    <span className={styles.label}>电话号码：</span><span>{getMobile(detail)}</span>
                                                </div>
                                            </div>
                                            <div className={styles.right}>
                                                <div className={styles.row}>
                                                    <span className={styles.label}>个性签名：</span><span>{_.get(detail, 'wechat.lvbuff.signature') || '--'}</span>
                                                </div>
                                                <div className={styles.row}>
                                                    <span className={styles.label}>来源：</span><span>{Helper.getFriendSource(_.get(detail, 'wechat.lvbuff.source'))}</span>
                                                </div>
                                                <div className={styles.row}>
                                                    <span className={styles.label}>描述：</span><span>{_.get(detail, 'wechat.lvbuff.description') || '--'}</span>
                                                </div>
                                                <div className={styles.row}>
                                                    <span className={styles.label}>附加图片：</span>
                                                    {
                                                        _.get(detail, 'wechat.lvbuff.extra_image', '') ? <img
                                                            className={styles.extraImage}
                                                            src={_.get(detail, 'wechat.lvbuff.extra_image', '')}
                                                            onError={(e) => {e.target.src = DefaultImage}}
                                                            rel="noreferrer"
                                                            alt="附加图片"
                                                        /> : '--'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.box}>
                                <p className={styles.title}>扩展资料</p>
                                <div className={styles.content}>
                                    <div className={styles.row}>
                                        <span className={styles.label}>姓名：</span>
                                        <span className={styles.value}>{detail.name || '--'}</span>
                                    </div>
                                    <div className={styles.row}>
                                        <span className={styles.label}>手机号：</span>
                                        <span className={styles.value}>{detail.mobile || '--'}</span>
                                    </div>
                                    <div className={styles.row}>
                                        <span className={styles.label}>性别：</span>
                                        <span className={styles.value}>{Sex[detail.gender]}</span>
                                    </div>
                                    <div className={styles.row}>
                                        <span className={styles.label}>地区：</span>
                                        <span className={styles.value}>{getArea(detail)}</span>
                                    </div>
                                    <div className={styles.row}>
                                        <span className={styles.label}>生日：</span>
                                        <span className={styles.value}>{Helper.formatBirthday(detail.birth_year, detail.birth_month, detail.birth_day) || '未知'}</span>
                                    </div>
                                    <div className={styles.row}>
                                        <span className={styles.label}>备注：</span>
                                        <span className={styles.value}>{detail.remark || '无'}</span>
                                    </div>
                                </div>
                            </div>
                            {
                                detail.tags.length ? <div className={styles.box}>
                                    <p className={styles.title}>微信标签</p>
                                    <div className={styles.content}>
                                        {
                                            detail.tags.map((tag, idx) => {
                                                return <Tag key={idx} color="blue" className={styles.tag}>{tag}</Tag>
                                            })
                                        }
                                    </div>
                                </div> : null
                            }
                        </div> : null
                    }
                </Spin>
            </Modal>
        )
    }
}
