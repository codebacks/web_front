import React from 'react'
import {Form, Modal, Table} from 'antd'
import {connect} from 'dva'
import styles from './index.less'

const imageUrl = 'https://image.51zan.com/'

@connect(({shop_fitment}) => ({
    shop_fitment
}))
@Form.create()
export default class extends React.Component {
    state = {
        loading: true
    }

    componentDidMount () {
        this.props.dispatch({
            type: 'shop_fitment/getCategory',
            payload: {},
            callback: ()=>{
                this.setState({
                    loading: false
                })
            }
        })
    }

    handleChoose = (item) => {
        this.props.onChosen(item)
    }

    render(){
        const { visible, onCancel } = this.props
        const { categoryList } = this.props.shop_fitment
        const columns = [
            {
                title: '类目',
                dataIndex: 'icon_url',
                key: 'icon_url',
                render: (value) => {
                    return <img className={styles.cate_img} src={imageUrl + value} alt=''></img>
                }
            },
            {
                title: '类目名称',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '操作',
                dataIndex: 'action',
                key: 'action',
                render: (value, item) => {
                    return <a href='javascript:;' style={{textDecoration: 'none'}} onClick={() => this.handleChoose(item)}>选择</a>
                }
            }
        ]

        return <Modal
            title="选择类目"
            visible={visible}
            onCancel={onCancel}
            footer={null}
            width='900px'
        >
            <Table
                pagination={false}
                dataSource={categoryList}
                loading={this.state.loading}
                columns={columns}
                rowKey='id'
            />
        </Modal>
    }
}
