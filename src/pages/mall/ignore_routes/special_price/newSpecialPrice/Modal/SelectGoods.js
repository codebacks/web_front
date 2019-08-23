import { PureComponent } from 'react'
import {connect} from 'dva'
import { Modal, Col, Row, Button, Form, Input, Table, Pagination, Tooltip } from 'antd'
import styles from './index.less'
import numeral from 'numeral'

const ImageUrl = '//image.yiqixuan.com/'

@Form.create()
@connect(({base}) => ({
    base
}))
export default class extends PureComponent {

    /* 页面方法 */
    showSpecs (value) {
        let specificList = ''
        if (value.property_a) {
            specificList += value.property_a
            if (value.property_b) {
                specificList += '；' + value.property_b
            }
            if (value.property_c) {
                specificList += '；' + value.property_c
            }
        }
        return specificList
    }

    /* 事件处理 */
    onCancel = () => {
        this.props.closeModal()
        this.props.form.setFieldsValue({'input': ''})
    }

    onChooseGood = (item) => {
        this.props.closeModal(item)
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
                span: 16,
            },
        }

        const columns = [
            {
                title: '商品',
                dataIndex: 'goods',
                render: ({name},item) => {
                    let string = this.showSpecs(item)
                    return <div  className={styles.goods}>
                        <img src={ImageUrl + item.cover_url} alt='' className={styles.goodsImg}/>
                        <div className={styles.description}>
                            <div>{name}</div>
                            <div style={{marginTop: '5px',display: 'flex',alignItems: 'center'}}>
                                <span style={{color: '#FA8910'}}>￥{numeral(item.price / 100).format('0,00.00')}</span>
                                {string !== '' ?
                                    <Tooltip placement="bottom" title={string} arrowPointAtCenter>
                                        <span className={styles.specs}>{string}</span>
                                    </Tooltip>
                                    : ''
                                }
                            </div>
                        </div>
                    </div>
                }
            },
            {
                title: '状态',
                dataIndex: 'status',
                render: (value,{goods}) => {
                    if (goods.status === 1) {
                        return <span style={{color: 'rgb(107, 167, 37)'}}>上架中</span>
                    } else {
                        return <span>已下架</span>
                    }
                }
            },
            {
                title: '操作',
                dataIndex: 'action',
                render: (value, item) => {
                    return (
                        <a
                            style={{textDecoration: 'none'}}
                            href='javascript:;'
                            onClick={() => this.onChooseGood(item)}
                        >
                            选择
                        </a>
                    )
                }
            }
        ]

        const {
            visible,
            data,
            currentPage,
            totalPage,
            pageSize,
            loading
        } = this.props
        const { getFieldDecorator } = this.props.form

        return (
            <Modal
                title='选择商品'
                visible={visible}
                onCancel={this.onCancel}
                footer={null}
                width='800px'
            >
                <Row>
                    <Col span={20}>
                        <Form.Item label='商品名称' {...formItemLayout}>
                            {getFieldDecorator('input',{})(
                                <Input />
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Button type='primary' style={{marginTop: '4px'}} onClick={this.onSearch}>搜索</Button>
                    </Col>
                </Row>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey='id'
                    loading={loading}
                    pagination={false}
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