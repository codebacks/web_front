/**
 **@Description:
 **@author: AmberYe
 */

import React, { Component } from 'react'
import { connect } from 'dva'
import {
    Button,
    Icon,
    Table,
    Divider,
    Modal,
    Popover,
    Input,
    Row,
    Col,
    message,
    Pagination
} from 'antd'
import router from 'umi/router'
import styles from './index.scss'
import Page from '@/components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import api from 'platform/common/api/wxcodelist'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import DownloadSvg from '../../../../assets/font_icons/download.svg'
import Guide from '@/components/Guide'

const QR_DOWNLOAD_SIZES = [{
    text: "小尺寸",
    description: '适用于屏幕类、宣传册类边长8cm（258*258px）',
    size: 258
}, {
    text: "中尺寸",
    description: '适用于海报类、展架类边长15cm（430*430px）',
    size: 430
}, {
    text: "大尺寸",
    description: '适用于幕布、大型广告边长50cm（1417*1417px）',
    size: 1417
}]
@connect(({ platform_list, base }) => ({
    platform_list,
    base
}))
@documentTitleDecorator({
    title: '新码'
})
export default class Index_page extends Component {
    constructor(props) {
        super(props)
        this.state = {
            downloadModal: false,
            downSize: '',
            id: '',
            qrUrl: '',
            name: '',
            current: 1,
            limit: 10,
        }
    }
    componentDidMount() {
        this.getWxData(this.state.current, this.state.limit)
    }
    //获取新码数据
    getWxData = (page, limit) => {
        this.props.dispatch({
            type: 'platform_list/query',
            payload: {
                offset: page - 1,
                limit: limit
            }
        })
    }
    //编辑
    edit = (id) => {
        router.push({
            pathname: 'wx_code/create',
            query: {
                id: id
            }
        })
    }
    //数据
    checkData = (data) => {
        router.push({
            pathname: 'wx_code/data',
            query: {
                id: data.id,
                type:data.addChildQrcodeType
            }
        })
    }
    //下载
    downLoad = (data) => {
        const { id } = data

        this.props.dispatch({
            type: 'platform_list/getShortUrl',
            payload: {
                id: id
            },
            callback: () => {
                this.setState({
                    id: data.id,
                    name: data.name,
                    qrUrl: `${api.getDownLoadApiUrl.url}/${id}.png`,
                    downloadModal: true,
                    downSize: ''
                })
            }
        })

    }
    //创建
    create = () => {
        router.push('wx_code/create')
    }
    //切换下载尺寸
    changeDownsize = (size) => {
        this.setState({
            downSize: size
        }, () => {
            window.location.href = `${api.getDownLoadApiUrl.url}/${this.state.id}.png?type=1&size=${this.state.downSize}`
        })
    }
    //点击切换pageSize
    handleChangeSize = (current, size) => {
        this.setState({
            current: current,
            limit: size
        })
        this.getWxData(current, size)
    }
    changeTablePage = (value, key) => {
        this.setState({
            current: value
        })
        this.getWxData(value, this.state.limit)
    }
    handleCancel = () => {
        this.setState({
            downloadModal: false
        })
    }
    render() {
        const {
            data,
            loading,
            shortUrl,
            rows_found
        } = this.props.platform_list
        const { current, limit, qrUrl, name } = this.state
        const {initData} = this.props.base
        const columns = [{
            title: '最后编辑时间',
            dataIndex: 'updatedAt',
            key: "updatedAt"
        }, {
            title: '新码名称',
            dataIndex: 'name',
            key: "name"
        }, {
            title: '创建人',
            dataIndex: 'operatorUserName',
            key: "operatorUserName"
        }, {
            title: '微信号数',
            dataIndex: 'wechatNum',
            key: "wechatNum",
            align: 'center',
        }, {
            title: '使用状态',
            dataIndex: 'status',
            render: (text) => {
                if (text === 2) {
                    return <span className={styles.circleGray}>已停用</span>
                } else {
                    return <span className={styles.circleBlue}>使用中</span>
                }
            },
        }, {
            title: '展示数',
            dataIndex: 'displayNum',
            key: "displayNum",
            align: 'center',
        }, {
            title: '添加数',
            dataIndex: 'addNum',
            key: "addNum",
            align: 'center',
        }, {
            title: '操作',
            key: "action",
            render: (text, record) => {
                return (
                    <div>
                        <a href="javascript:void(0);" onClick={this.checkData.bind(this, record)}>数据</a>
                        <Divider type="vertical" />
                        <a onClick={this.edit.bind(this, record.id)}>编辑</a>
                        <Divider type="vertical" />
                        <a onClick={this.downLoad.bind(this, record)}>下载</a>
                    </div>
                )
            }
        }]
        const action = (<div>
            <Button
                type="primary"
                onClick={this.create.bind(this)}
                disabled={(Object.keys(initData).length && initData.company.product_version.id === 16 && data.length >= 1) ? true : false}
            >
                <Icon type="plus" />
                创建新码
            </Button>
        </div>)
        return (
            <Page>
                <Page.ContentHeader
                    title="新码"
                    titleHelp={<Popover placement="bottomLeft" content={
                        <div>
                            <p>支持对已上传二维码名片的个人号创建新码</p>
                            <p>以微信、QQ、朋友圈、网页、卡片印刷等形式</p>
                            <p>向潜在客户发送新码，方便其扫码添加个人微信号</p>
                        </div>}>
                        <Icon className="hz-text-primary hz-icon-size-default hz-icon-popover" type="question-circle-o" />
                    </Popover>}
                    action={action}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E8%90%A5%E9%94%80%E5%B9%B3%E5%8F%B0/%E6%96%B0%E7%A0%81.md"
                />
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey={record => record.id}
                    pagination={false}
                    bordered={false}
                    loading={loading}
                />
                {
                    data && data.length > 0 && (
                        <Pagination
                            className={styles.wxPagination + ' ant-table-pagination'}
                            total={rows_found}
                            current={current}
                            showQuickJumper={true}
                            showTotal={total => `共 ${rows_found} 条`}
                            pageSize={limit}
                            pageSizeOptions={['10', '20', '50', '100']}
                            showSizeChanger={true}
                            onShowSizeChange={this.handleChangeSize}
                            onChange={this.changeTablePage}
                        />
                    )
                }
                <Modal
                    title="链接二维码"
                    visible={this.state.downloadModal}
                    footer={null}
                    width={480}
                    onCancel={this.handleCancel}
                >
                    <div>
                        {/* {this.checkWxCodeName()} */}
                        <Row type="flex" justify="start" align="middle" style={{ marginBottom: '16px' }}>
                            <Col span={5} className={styles.itemTitle}>新码名称：</Col>
                            <Col span={19}>
                                {name}
                            </Col>
                        </Row>
                        <Row style={{ marginBottom: '20px' }} type="flex" justify="start" align="middle">
                            <Col span={5} className={styles.itemTitle}>
                                复制短连接：
                            </Col>
                            <Col span={19}>
                                <Input readOnly className={styles.showShortUrl} value={shortUrl} />
                                <CopyToClipboard text={shortUrl}
                                    onCopy={() => {
                                        message.success('复制链接成功！')
                                    }}
                                >
                                    <Button type="primary" style={{ verticalAlign: 'middle', width: '80px', marginLeft: '-1px' }} ghost>复制</Button>
                                </CopyToClipboard>
                                <Popover placement="bottomLeft" content={<img src={qrUrl} alt="" className={styles.qrUrlImg} />}>
                                    <img src={require('../../assets/images/qrcode.svg')} alt="" className={styles.qrcodeIcon} />
                                </Popover>
                            </Col>
                        </Row>
                        <Row className={styles.downloadSize} type="flex" justify="start" align="top">
                            <Col span={5} className={styles.itemTitle}>
                                选择尺寸：
                            </Col>
                            <Col span={19}>
                                {
                                    QR_DOWNLOAD_SIZES.map((item, index) => {
                                        return (<Row key={index} className={styles.downloadSizeType} >
                                            <Col span={22}>
                                                <div className={styles.size}>{item.text}</div>
                                                <div className={styles.description}>{item.description}</div>
                                            </Col>
                                            <Col style={{ textAlign: 'right' }}>
                                                <span className={styles.downloadSizeBtn} title='下载二维码' onClick={() => { this.changeDownsize(item.size) }}>
                                                    <Icon component={DownloadSvg} style={{ fontSize: '16px' }} />
                                                </span>
                                            </Col>
                                        </Row>)
                                    })
                                }
                            </Col>
                        </Row>
                    </div>
                </Modal>
                <Guide 
                    type={'wx_code'}
                    guideTitle={'点击引导，快速了解新码!'}
                    guideFlowImg={require(`platform/assets/images/guide-wxcode.jpg`)}
                />
            </Page>
        )
    }
}
