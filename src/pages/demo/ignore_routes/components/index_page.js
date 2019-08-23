/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期: 18/08/14
 */
import React from 'react'
import {Row, Col, Button} from 'antd'
import {connect} from 'dva'
import baseConfig from 'config'
import WeChatSelectMulti from '@huzan/hz-wechat-select'
import '@huzan/hz-wechat-select/style/index'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'

import styles from './index.less'

@connect(({base}) => ({
    base,
}))
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = this.getInitialState()
    }

    componentDidMount() {

    }

    getInitialState = () => {
        return {
            visible: false,
            params: {
                userId: undefined,
                departmentId: undefined,
                uin: undefined,
            }
        }
    }

    handleShowSelect = () =>{
        this.setState({
            visible: true,
        })
    }

    handleCancel = () => {
        this.setState({
            visible: false,
        })
    }

    handleOk = (wechats) => {
        console.log('微信列表：',wechats)
    }

    handleChange = (key, value) => {
        console.log(key, value)
        let params = {...this.state.params}
        params[key] = value
        if (key === 'departmentId') {
            params['userId'] = undefined
            params['uin'] = undefined
        } else if (key === 'userId') {
            params['uin'] = undefined
        }
        this.setState({
            params: params
        })
    }

    resetState = () => {
        this.setState(this.getInitialState())
    }

    render() {
        const {visible, params} = this.state

        return (
            <div style={{margin: 100}}>
                <Row style={{margin: 20}}>
                    <Col span={4}>
                   部门选择：
                    </Col>
                    <Col span={8}>
                        <DepartmentSelect
                            cls={styles.select} // 自定义class
                            placeholder="placeholder" // 自定义placeholder
                            searchPlaceholder="searchPlaceholder"  // 搜索框的placeholder
                            departmentId={params.departmentId}
                            onChange={(value)=>{this.handleChange('departmentId', value)}}
                        />
                    </Col>
                </Row>
                <Row style={{margin: 20}}>
                    <Col span={4}>
                  员工选择：
                    </Col>
                    <Col span={8}>
                        <UserSelect
                            cls={styles.select}
                            placeholder="placeholder"
                            departmentId={params.departmentId}
                            userId={params.userId}
                            onChange={(value)=>{this.handleChange('userId', value)}}
                        />
                    </Col>
                </Row>
                <Row style={{margin: 20}}>
                    <Col span={4}>
                     微信单选：
                    </Col>
                    <Col span={8}>
                        <WeChatSelectSingle
                            cls={styles.select}
                            placeholder="placeholder"
                            departmentId={params.departmentId}
                            userId={params.userId}
                            uin={params.uin}
                            onChange={(value)=>{this.handleChange('uin', value)}}
                        />
                    </Col>
                </Row>
                <Row style={{margin: 20}}>
                    <Col span={4}>
                        微信多选：
                    </Col>
                    <Col span={20}>
                        <Button onClick={this.handleShowSelect}>选择微信</Button>
                    </Col>
                </Row>
                <Button onClick={this.resetState}>重置</Button>
                {/*微信多选*/}
                <WeChatSelectMulti
                    apiHost={`${baseConfig.apiHost}/api`}
                    accessToken={this.props.base.accessToken}
                    cls={styles.modal}
                    visible={visible}
                    disableByQrCode={true}
                    filterBySerialno={true}
                    searchOption={['query', 'group_id', 'online']} // 搜索项
                    onCancel={this.handleCancel}
                    onOk={this.handleOk}/>
            </div>
        )
    }
}
