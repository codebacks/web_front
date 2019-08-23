'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/8
 */
import React from 'react'
import  {Modal, Button, Table, Icon} from 'antd'
import styles from './Create.scss'

class Member extends React.Component {
    constructor(props) {
        super()
        this.state = {}
    }

    componentDidMount() {

    }

    handleRemoveMember = (idx) => {
        this.props.onRemoveMember.call(this, idx)
    };


    render() {
        const {member} = this.props
        const columns = [{
            title: '姓名',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: '手机号',
            dataIndex: 'mobile',
            key: 'mobile',
        }, {
            title: '操作',
            dataIndex: 'option',
            key: 'option',
            render: (text, record, index) => <Icon type="close" onClick={this.handleRemoveMember.bind(this, index)}/>
        }]
        return (
            <Modal
                visible={this.props.visible}
                title="客户列表"
                onCancel={this.props.onCancel}
                width={600}
                footer={[
                    <Button key="back" size="large" onClick={this.props.onCancel}>确认</Button>,
                ]}
            >
                <div className={styles.content} style={{height: 400, overflow: 'auto'}}>
                    <Table columns={columns} dataSource={member} rowKey={record => record.id}/>
                </div>
            </Modal>
        )
    }
}

export default Member
