import React from "react"
import { Modal, Table } from "antd"
import { connect } from "dva"
import router from 'umi/router'
import { datetime } from '../../../../../utils/display'
import styles from './index.less'

@connect(({wxpublic_qrcode }) => ({wxpublic_qrcode}))
export default class extends React.Component {
    onClick = (e,row) =>{
        e.preventDefault()
        this.props.onOk && this.props.onOk(row)
        this.onCancel()
    }
    onCancel =()=>{
        this.props.onCancel && this.props.onCancel()
    }
    go = ()=>{
        router.push('/platform/blueprint')
    }
    render() {
        const columns = [
            {
                title: '活动名称',
                dataIndex: 'name',
                key:'name'
            },{
                title: '活动时间',
                dataIndex: 'time',
                key:'time',
                render: (text, item) => 
                    <div>
                        <span>{datetime(item.begin_at)}</span>~<span>{datetime(item.end_at)}</span>
                    </div>
                
            },{
                title: '操作',
                dataIndex: 'id',
                key:'id',
                render:(id,row) => <a onClick={e =>this.onClick(e,row)}>选择</a>
            }
        ]
        const {activityList} = this.props.wxpublic_qrcode
        const { visible } = this.props
        return (
            <Modal
                visible={visible}
                title="晒图活动"
                okText="提交"
                cancelText="返回"
                destroyOnClose
                onCancel={this.onCancel}
                width={900}
                footer={null}
            >
                <div className={styles.tips}> <a onClick={this.go}>去添加活动</a></div>
                <Table
                    columns={columns}
                    dataSource={activityList}
                    size="middle"
                    rowKey={(record, index) => index}
                    pagination={false}
                />
            </Modal>
        )
    }
}
