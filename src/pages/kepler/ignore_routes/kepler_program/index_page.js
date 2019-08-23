import Page, { DEFAULT_PAGER , DEFAULT_PAGER_FILTER} from '../../../../components/business/Page'
import {connect} from 'dva'
import router from 'umi/router'
import DocumentTitle from 'react-document-title'
import { Button, Icon, Table, Pagination, Divider, Form, Row, Col, Input, Select, Popconfirm } from 'antd'
import styles from './index.less'
import numeral from 'numeral'
import moment from 'moment'
import PlusSvg from '../../../../assets/font_icons/plus.svg'
import MoveGroup from './Modal/MoveGroup'

const Option = Select.Option

const DEFAULT_CONDITION = {
    cardTitle: undefined,
    cardGroup: undefined,
}

@Form.create()
@connect(({kepler_program, base}) =>({
    kepler_program, base
}))
export default class extends Page.ListPureComponent {
    state = {
        loading: false,
        condition: {...DEFAULT_CONDITION},
        pager: {...DEFAULT_PAGER},
        moveGrouVisible: false,
        currentModalGroupId: undefined
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)

        const { cardTitle, cardGroup } = condition

        this.getPageData(condition, pager, isSetHistory)
        this.getGroupList()
        this.props.form.setFieldsValue({
            'cardTitle': cardTitle,
            'cardGroup': cardGroup
        })
    }

    getPageData = (condition, pager, isSetHistory = true,callback) => {
        if( isSetHistory ){
            this.history(condition, pager)
        }

        this.setState({
            condition: condition,
            pager: pager,
            loading: true
        })
        
        this.props.dispatch({
            type: 'kepler_program/getKeplerCardList',
            payload: {
                title: condition.cardTitle,
                category_id: condition.cardGroup,
                page: pager.current - 1,
                offset: pager.pageSize * (pager.current - 1),
                limit: pager.pageSize
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
            }
        })
    }

    searchData = () => {        
        this.props.form.validateFields((error,value) => {
            if (error) return

            const condition = {
                ...this.state.condition,
                ...{
                    cardTitle: value.cardTitle,
                    cardGroup: value.cardGroup
                }
            }

            const pager = {
                pageSize : this.state.pager.pageSize,
                current : DEFAULT_PAGER.current
            }
            
            this.getPageData(condition, pager)
        })
    }

    getGroupList = () => {
        this.props.dispatch({
            type: 'kepler_program/getGroupList',
        })
    }

    /* 事件处理 */
    handleCreateCard = () => {
        router.push('/kepler/kepler_program/create_card')
    }

    handleMoveGroup = (id) => {
        this.setState({
            currentModalGroupId: id,
            moveGrouVisible: true
        })
    }

    closeMoveModal = (value) => {
        if (value && value === 'moveAlready') {
            this.setState({moveGrouVisible: false})
            this.searchData()
        } else {
            this.setState({moveGrouVisible: false})
        }
    }

    onReset = () => {
        this.props.form.resetFields()

        this.searchData()
    }

    onDelete = (id) => {
        const { cardList } = this.props.kepler_program
        this.setState({loading: true})
        this.props.dispatch({
            type: 'kepler_program/deleteCard',
            payload: id,
            callback: (data) => {
                if (data.meta && data.meta.code === 200) {
                    const current = cardList.length === 1 ? 1 : this.state.pager.current
                    this.getPageData(this.state.condition, {
                        ...this.state.pager,
                        current
                    })
                }
            }
        })
    }

    onSubmit = (e) => {
        e.preventDefault()

        this.searchData()
    }

    render () {
        const columns = [
            {
                title: '卡片样式',
                dataIndex: 'image_url',
                render: (value) => {
                    return <img className={styles.cardImg} src={value} alt=''></img>
                }
            },
            {
                title: '卡片标题',
                dataIndex: 'title'
            },
            {
                title: '小程序原始ID',
                dataIndex: 'original_app_id'
            },
            {
                title: '小程序路径',
                dataIndex: 'app_path',
                render: (value) => {
                    let app_path
                    if (value.indexOf('pages/cmData/cmData.html') != -1) {
                        app_path = decodeURIComponent(value.split('?')[1].split('=')[1])
                        app_path = app_path.replace(/&cm_source/, '')
                    } else {
                        app_path = value
                    }
                    return <span>{app_path}</span>
                }
            },
            {
                title: '所属分组',
                dataIndex: 'category',
                render: (value) => {
                    return <span>{value[0] ? value[0].name : '默认分组'}</span>
                }
            },
            {
                title: '操作',
                dataIndex: 'action',
                render: (vlaue, {id}) => {
                    return (
                        <div className={styles.nowrap}>
                            {/* <a href='javascript:;' onClick={() => this.onEdit(id)}>编辑</a>
                            <Divider type="vertical" /> */}
                            <Popconfirm
                                title={<span style={{fontWeight: 'bold', color: '#0D1A26'}}>确定删除</span>}
                                icon={<Icon type="exclamation-circle" theme="filled" style={{color: '#F15043'}} />}
                                onConfirm={() => this.onDelete(id)}
                            >
                                <a href='javascript:;'>删除</a>
                            </Popconfirm>
                            <Divider type="vertical" />
                            <a href='javascript:;' onClick={() => this.handleMoveGroup(id)}>移动分组</a>
                        </div>
                    )
                }
            },
        ]
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '70px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const { getFieldDecorator } = this.props.form
        const { current, pageSize } = this.state.pager
        const { count, cardList, groupArray } = this.props.kepler_program
        const { loading, moveGrouVisible, currentModalGroupId } = this.state

        return (
            <DocumentTitle title='开普勒小程序'>
                <Page>
                    <Page.ContentHeader
                        title='开普勒小程序'
                        action={(
                            <div>
                                <Button type='primary' onClick={this.handleCreateCard}>
                                    <Icon component={PlusSvg} style={{fontSize: '16px'}} />
                                    创建卡片
                                </Button>
                            </div>
                        )}
                    />
                    <Page.ContentAdvSearch multiple={false}>
                        <Form onSubmit={this.onSubmit}>
                            <Row>
                                <Col span={8}>
                                    <Form.Item label='卡片标题' {...formItemLayout}>
                                        {getFieldDecorator('cardTitle',{})(
                                            <Input placeholder='请输入卡片标题'/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label='所属分组' {...formItemLayout}>
                                        {getFieldDecorator('cardGroup',{
                                        })(
                                            <Select placeholder='选择卡片分组'>
                                                <Option value=''>全部</Option>
                                                {groupArray.map((item, index) => {
                                                    return <Option key={index} value={item.id}>{item.name}</Option>
                                                })}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8} style={{paddingTop: '4px'}}>
                                    <Button type='primary' icon="search" htmlType='submit'>搜索</Button>
                                    <Button style={{marginLeft: '16px'}} onClick={this.onReset}>重置</Button>
                                </Col>
                            </Row>
                        </Form>
                    </Page.ContentAdvSearch>
                    <Table
                        columns={columns}
                        scroll={{ x: 1366 }}
                        dataSource={cardList}
                        rowKey='id'
                        pagination={false}
                        loading={loading}
                    />
                    {parseFloat(count) > 0 ?
                        <Pagination
                            className="ant-table-pagination"
                            current={current}
                            total={parseFloat(count)}
                            showTotal={(total) => `共 ${total} 条`} 
                            showQuickJumper={true} 
                            showSizeChanger={true}  
                            pageSize={pageSize} 
                            pageSizeOptions= {['10', '20', '50', '100']}
                            onShowSizeChange={this.handleListPageChangeSize}
                            onChange={this.handleListPageChange} />
                        : ''
                    }
                    <MoveGroup visible={moveGrouVisible} onCancel={this.closeMoveModal} groupArray={groupArray} id={currentModalGroupId}/>
                </Page>
            </DocumentTitle>
        )
    }
}