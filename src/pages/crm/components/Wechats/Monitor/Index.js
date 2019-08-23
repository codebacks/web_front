'use strict';

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/27
 */
import React from 'react'
import {Row, Col} from 'antd'
import styles from './Index.scss'
import Session from './Session'
import History from './History'

export default class extends React.Component {
    constructor(props) {
        super();
        this.state = {
            value: '',
            focus: '',
            activeSession: {},
            visible: false,
            visibleDetail: false,
            record: null
        }
    }


    showDetail = (record) => {
        this.setState({visibleDetail: true, record: record})

    };

    componentDidMount() {

    }

    handleCancel = () => {
        this.setState({visible: false, record: null})

    };
    loadCustomer = () => {

    };
    handleQueryMessages = (item) => {
        this.loadCustomer(item);
    };
    handleCancelDetail = () => {
        this.setState({visibleDetail: false, record: null})
    };

    render() {
        const {winHeight: innerHeight, pageHeight} = this.props.base;
        const _height = innerHeight - 64 - 90;
        return (<div className={styles.monitorWrap} style={{height: pageHeight}}>
            <Row>
                <Col span="7">
                    <div style={{height: _height}}>
                        <Session {...this.props} onChange={this.handleQueryMessages}/>
                    </div>
                </Col>
                <Col span="17">
                    <div style={{height: _height}}>
                        <History {...this.props}/>
                    </div>
                </Col>
            </Row>
        </div>)
    }
}
