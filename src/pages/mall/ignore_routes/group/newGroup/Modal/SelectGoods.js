import { PureComponent } from 'react'
import {connect} from 'dva'
import { Modal, Col, Row, Button, Form, Input, Table, Pagination, Icon } from 'antd'
import styles from './index.less'
import numeral from 'numeral'

const ImageUrl = '//image.yiqixuan.com/'

@Form.create()
@connect(({base}) => ({
    base
}))
export default class extends PureComponent {
    /* 事件处理 */
    onCancel = () => {
        this.props.closeModal()
        this.props.form.setFieldsValue({'input': ''})
    }

    onSelectGood = (value) => {
        this.props.closeModal(value)
        this.props.form.setFieldsValue({'input': ''})
    }

    onSearch = () => {
        const { form } = this.props
        let searchValue = form.getFieldValue('input')
        this.props.handleSearch(searchValue)
    }

    handleChangeSize = (value, pageSize) => {
        this.props.handleChangeSize(value, pageSize)
    }

    goToPage = (page, pageSize) => {
        this.props.goToPage(page, pageSize)
    }

    render() {
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '80px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 18,
            },
        }

        const {
            visible,
            data,
            loading,
            currentPage,
            totalPage,
            pageSize
        } = this.props
        const { getFieldDecorator } = this.props.form
        const columns = [
            {
                title: '商品',
                dataIndex: 'name',
                render: (value,{cover_url}) => {
                    return <div  className={styles.goods}>
                        <img src={ImageUrl + cover_url} alt='' className={styles.goodsImg}/>
                        <div>{value}</div>
                    </div>
                }
            },
            {
                title: '售价',
                dataIndex: 'price',
                width: '200px',
                render: (value, {price_high, price_low}) => {
                    if (price_low === price_high) {
                        return <span className={styles.priceColor}>￥{numeral(price_high/100).format('0,0.00')}</span>
                    } else {
                        return <span className={styles.priceColor}>￥{numeral(price_low/100).format('0,0.00')} ~ ￥{numeral(price_high/100).format('0,0.00')}</span>
                    }
                }
            },
            {
                title: '操作',
                dataIndex: 'action',
                width: '100px',
                render: (value, {id}) => {
                    return (
                        <a
                            style={{textDecoration: 'none'}}
                            href='javascript:;'
                            onClick={() => this.onSelectGood(id)}
                        >
                        选择
                        </a>
                    )
                }
            }
        ]

        return (
            <Modal
                title='选择商品'
                visible={visible}
                onCancel={this.onCancel}
                footer={null}
                width='900px'
            >
                <Row>
                    <Col span={12}>
                        <Form.Item label='商品名称' {...formItemLayout}>
                            {getFieldDecorator('input',{})(
                                <Input placeholder="请输入商品名称" />
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={2}>
                        <Button type='primary' style={{marginTop: '4px'}} onClick={this.onSearch}>
                            <Icon type="search" />
                            搜索
                        </Button>
                    </Col>
                </Row>
                <Table
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    pagination={false}
                    scroll={{y:400}}
                    rowKey='id'
                />
                <Row>
                    {parseFloat(totalPage) > 0 ?
                        <Pagination
                            className="ant-table-pagination"
                            current={currentPage}
                            total={totalPage}
                            showTotal={(total) => `共 ${total} 条`} 
                            showQuickJumper={true} 
                            showSizeChanger={true}  
                            pageSize={pageSize} 
                            pageSizeOptions= {['10', '20', '50', '100']}
                            onShowSizeChange={this.handleChangeSize}
                            onChange={this.goToPage} />
                        : ''
                    }
                </Row>
            </Modal>
        )
    }
}