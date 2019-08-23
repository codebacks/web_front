/**
 **@Description:
 **@author: leo
 */

import React, { Component } from "react"
import { Modal, Pagination, Table } from "antd"
import { connect } from "dva"
import styles from "./index.less"
@connect(({ sms_record }) => ({
    sms_record
}))
export default class Index extends Component {
    state = {
        loading: false,
        current:1,
        limit:10
    }
    onCancel = () => {
        this.props.onCancel && this.props.onCancel()
    }
    getList = (page,pageSize) => {
        this.setState({
            loading:true
        })
        this.props.dispatch({
            type: "sms_record/getMsmSendReportList",
            payload: {
                send_history_id: this.props.id,
                status: 2,
                offset: (page -1 ) * pageSize,
                limit: pageSize
            },
            callback:()=>{
                this.setState({
                    current:page,
                    limit:pageSize,
                    loading:false
                })
            }
        })
    }
    handlePageChange = page => {
        this.getList(page,this.state.limit)
    }
    handleChangeSize =(page,pageSize) =>{
        this.getList(1,pageSize)
    }
    render() {
        const { visible } = this.props
        const { reportList, reportTotal } = this.props.sms_record
        let columns = [
            {
                title: "发送时间",
                dataIndex: "created_at",
                width:200,
                key: "created_at"
            },
            {
                title: "手机号",
                dataIndex: "phone",
                width:200,
                key: "phone"
            },
            {
                title: "失败原因",
                dataIndex: "reason",
                key: "reason",
            }
        ]

        return (
            <Modal
                className={styles.model_frist_btn_hidden}
                visible={visible}
                title={"错误报告"}
                okText="返回"
                destroyOnClose={true}
                onCancel={this.onCancel}
                onOk={this.onCancel}
                width={720}
            >
                <div className={styles.table_margin_top}>
                    <Table
                        columns={columns}
                        dataSource={reportList}
                        size="middle"
                        rowKey={(record, index) => index}
                        pagination={false}
                        scroll={{y:400}}
                        loading={this.state.loading}
                    />
                    {reportList.length ? (
                        <Pagination
                            className="ant-table-pagination"
                            total={reportTotal}
                            current={this.state.current}
                            showQuickJumper={true}
                            showTotal={total => `共 ${total} 条`}
                            pageSize={this.state.limit}
                            size='small'
                            pageSizeOptions={['10', '20', '50', '100']}
                            showSizeChanger={true}
                            onShowSizeChange={this.handleChangeSize}
                            onChange={this.handlePageChange}
                        />
                    ) : (
                        ""
                    )}
                </div>
            </Modal>
        )
    }
}
