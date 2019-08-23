'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户:[吴明]
 */
import React,{Fragment} from 'react'
import {Row,Col} from 'antd'
import { connect } from 'dva'
import router from 'umi/router'
import styles from './index.less'


@connect(({ base, sms_managamnet}) => ({
    base, sms_managamnet
}))
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {

        }
    }
    componentDidMount(){
    }



    render() {
        return (
            <Fragment>
                <div className={styles.message_phone}>       
                    <Row className={styles.message_view}>
                        <Col className={styles.per_message}>{this.props.content}</Col>
                    </Row>
                </div>
                <div style={{textAlign:'center'}}>效果预览图</div>
            </Fragment>
        )
    }
}
