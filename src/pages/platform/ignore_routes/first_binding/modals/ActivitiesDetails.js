/**
 **@Description:活动详情
 **@author: wangchunting
 */

import React from 'react'
import { connect } from 'dva'
import { Modal, Spin } from 'antd'
import styles from '../index.less'
import { getAwardType, getPriceType, PRICE_TYPE } from '../../../services/first_binding'
import { datetime } from '../../../../../utils/display'

@connect(({ platform_first_binding }) => ({
    platform_first_binding
}))

export default class ActivitiesDetails extends React.Component {
    state = {
        visible: false,
        loading: true,
    }

    componentDidMount() {
        const { id } = this.props
        if (id) {
            this.setState({
                visible: true,
            })
            this.getDetailsModal(id)
        }
    }

    getDetailsModal = (id) => {
        this.props.dispatch({
            type: 'platform_first_binding/activitiesDetail',
            payload: {
                activity_id: id,
            },
            callback: () => {
                this.setState({
                    loading: false
                })
            }
        })
    }

    handleCancel = () => {
        const { onClose } = this.props
        onClose && onClose()
    }

    render() {
        const { activitiesDetailData } = this.props.platform_first_binding

        return (
            <div>
                <Modal
                    title="活动详情"
                    footer={null}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                >
                    {
                        this.state.loading ? <div style={{ textAlign: 'center' }}> <Spin /></div> :
                            <ul className={styles.modalContent}>
                                <li>
                                    <span>活动名称 : {activitiesDetailData.name}</span>
                                </li>
                                <li><span>活动标题 : {activitiesDetailData.title}</span></li>
                                <li>
                                    <span>活动时间 : {datetime(activitiesDetailData.begin_at)} ～ {datetime(activitiesDetailData.end_at)}</span>
                                </li>
                                <li>
                                    <span>奖品类型 : {getAwardType(activitiesDetailData.award_type)}</span>
                                </li>
                                <li>
                                    <span>红包类型 : {getPriceType(activitiesDetailData.price_type)}</span>
                                </li>
                                <li>
                                    <span>红包金额 : {activitiesDetailData.price_type === PRICE_TYPE[0].value ? activitiesDetailData.price / 100 + '元' : activitiesDetailData.min_price / 100 + '元 ~ ' + activitiesDetailData.max_price / 100 + '元'}</span>
                                </li>
                                <li><span>活动规则 : {activitiesDetailData.activity_rules}</span></li>
                            </ul>
                    }
                </Modal>
            </div>
        )
    }
}
