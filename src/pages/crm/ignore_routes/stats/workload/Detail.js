'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/27
 */
import React from 'react'
import {Modal, Card} from 'antd'
import styles from './index.scss'
import createG2 from 'g2-react'

export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            width: 900,
            height: 300,
            plotCfg: {
                margin: [10, 100, 50, 120],
            },
        }
    }

    loadWorkloadDetail = ()=> {
        this.props.dispatch({
            type: 'crm_stat_workload/queryDetail',
            payload: {params: {user_id: this.props.record.user_id}}
        })
    };

    handleCancel = () => {
        this.props.onCancel()
    };

    componentDidMount() {
        this.loadWorkloadDetail()
    }


    render() {
        const Line = createG2(chart => {
            chart.line().position('时间*数量').color('类型').shape('spline').size(2)
            chart.render()
        })
        const {detailList, detailTotal}= this.props.crm_stat_workload
        const getTotal = () => {
            return (<div className={styles.total}>
                <div className={styles.item}>
                    <Card bodyStyle={{padding: 0}}>
                        <h3>新增人数</h3>
                        <div className={styles.num}>{detailTotal.new_friend_count}</div>
                    </Card>
                </div>
                <div className={styles.item}>
                    <Card bodyStyle={{padding: 0}}>
                        <h3>发送人数</h3>
                        <div className={styles.num}>{detailTotal.send_friend_count}</div>
                    </Card>
                </div>
                <div className={styles.item}>
                    <Card bodyStyle={{padding: 0}}>
                        <h3>回复人数</h3>
                        <div className={styles.num}>{detailTotal.receive_friend_count}</div>
                    </Card>
                </div>
                <div className={styles.item}>
                    <Card bodyStyle={{padding: 0}}>
                        <h3>发送消息数</h3>
                        <div className={styles.num}>{detailTotal.send_count}</div>
                    </Card>
                </div>
                <div className={styles.item}>
                    <Card bodyStyle={{padding: 0}}>
                        <h3>回复消息数</h3>
                        <div className={styles.num}>{detailTotal.receive_count}</div>
                    </Card>
                </div>
            </div>)
        }
        return ( <Modal visible={this.props.visible}
            title={this.props.record.user.nickname + ' 在 ' + this.props.crm_stat_workload.params.start_time + '~' + this.props.crm_stat_workload.params.end_time + ' 之间的详细工作' }
            onCancel={this.handleCancel}
            width={960}
            className={styles.workload}
            footer={[]}>
            {getTotal()}
            <div className={styles.lineChat}>
                <Line
                    data={detailList}
                    width={this.state.width}
                    height={this.state.height}
                    plotCfg={this.state.plotCfg}
                />
            </div>

        </Modal>)
    }
}
