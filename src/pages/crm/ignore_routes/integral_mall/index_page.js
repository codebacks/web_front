import {Fragment} from 'react'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '@/components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import {Form, Button, Table, Divider, message, Modal, Icon } from 'antd'
import { connect } from 'dva'
import router from 'umi/router'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import QRCode from 'components/QrCode'
import {datetime} from '../../../../utils/display'
import styles from './index.less'

const DEFAULT_CONDITION = {}

@documentTitleDecorator()
@Form.create()
@connect(({ base,crm_intergral }) => ({
    base,
    crm_intergral
}))
export default class Index extends Page.ListPureComponent {
    state = {
        loading: false,
        visible: false,
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER }
    }
    componentDidMount() {
        super.componentDidMount()
        this.props.dispatch({
            type: 'crm_intergral/getGzhList',
            payload: {},  
        })
    }
    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        this.getPageData(condition, pager, isSetHistory)
    }

    getPageData = (condition, pager, isSetHistory = true, callback) => {
        if (isSetHistory) {
            this.history(condition, pager)
        }

        this.setState({
            condition: condition,
            pager: pager,
            loading: true
        })
        this.props.dispatch({
            type: 'crm_intergral/getMallList',
            payload:{
                offset: pager.current - 1,
                limit: pager.pageSize
            },
            callback: ()=>{
                this.setState({
                    loading: false
                })
            }
        })
    }


    openMall = ()=>{
        const { getGzhList} = this.props.crm_intergral
        if(Array.isArray(getGzhList)&&getGzhList.length===0){
            this.setState({visible: true})
        }else{
            router.push('/crm/integral_mall/mall_detail')
        }
    }
    editMall = (item)=>{
        router.push(`/crm/integral_mall/mall_detail?id=${item.id}`)
    }
    copyUrl = ()=>{}
    downQrcode = (e) => {
        const canvas = e.currentTarget.querySelector('canvas')
        this.canvasDownload(canvas)
    }

    /*下载二维码*/
    canvasDownload = (canvas) => {
        var type = 'png'
        var dataurl = canvas.toDataURL('image/png').replace("image/png", "image/octet-stream")
        var filename = `二维码_${(new Date()).getTime()}.${type}`
        this.saveFile(dataurl, filename)
    }
    /**
    * 在本地进行文件保存
    * @param  {String} data     要保存到本地的图片数据
    * @param  {String} filename 文件名
    */
    saveFile = (data, filename) => {
        var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
        save_link.href = data
        save_link.download = filename

        var event = document.createEvent('MouseEvents')
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        save_link.dispatchEvent(event)
    }

    onCancel = ()=>{
        this.setState({visible: false})
    }

    onOk = ()=>{
        this.setState({visible: false},()=>{
            router.push('/setting/authorization/subscription')
        })
    }

    render() {
        const columns = [
            {
                title: '添加时间',
                dataIndex: 'created_at',
                render: (value,item,index) => {
                    return value&&datetime(value)
                }
            },
            {
                title: '商城名称',
                dataIndex: 'title'
            },
            {
                title: '所属公众号',
                dataIndex: 'app_id',
                render: (value, record, index) => {
                    const { getGzhList } = this.props.crm_intergral
                    if(Array.isArray(getGzhList)&&getGzhList.length > 0){
                        let obj = getGzhList.filter(item =>  item.app_id === record.app_id)
                        return Array.isArray(obj)&&obj.length>0&&obj[0].name
                    }
                }  
            },
            {
                title: '创建人',
                dataIndex: 'creater'
            },
            {
                title: '操作',
                render: (value, record, index) => {
                    return (
                        <Fragment>
                            <a href='javascript:;' onClick={() => this.editMall(record)}>编辑</a>
                            < Divider type = "vertical" />
                            <CopyToClipboard
                                text={record.url}
                                onCopy={() => { message.success('复制链接成功！') }}
                            >
                                <a href='javascript:;' onClick={() => this.copyUrl(record)}>复制链接</a>
                            </CopyToClipboard>
                            < Divider type = "vertical" />
                            <a href='javascript:;' onClick={(e) => this.downQrcode(e)}>
                                下载二维码
                                <span style={{ display: 'none' }}>
                                    <QRCode useDevicePixelRatio={false} size={258} value={record.url} />
                                </span>
                            </a>
                        </Fragment>
                    )
                }
            },
        ]

        const {getMallList, getGzhList} = this.props.crm_intergral
        const { loading } = this.state
        return (
            <Page>
                {/*头部面包屑*/}
                <Page.ContentHeader
                    title={this.props.documentTitle}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E5%AE%A2%E6%88%B7%E7%AE%A1%E7%90%86/%E7%A7%AF%E5%88%86%E8%BF%90%E8%90%A5.md"
                />
                {
                    Array.isArray(getMallList)&&getMallList.length===0&&(
                        <Button className={styles.btnClick} type="primary" onClick={this.openMall}>
                            <Icon type="plus" />
                            开通积分商城
                        </Button>
                    )
                }
                <div className={styles.head}>
                    <div className={styles.headTit}>温馨提示</div>
                    <div>
                        <div className={styles.headCon}>1. 商城开通，系统须有已授权的公众号；</div>
                        <div className={styles.headCon}>2. 如公众号解除授权，则新用户无法授权登陆，老用户红包奖品无法兑换。</div>
                    </div>
                </div>

                {getMallList.length ?
                    (
                        <Fragment>
                            <Table
                                rowKey='id'
                                columns={columns}
                                pagination={false}
                                loading={loading}
                                dataSource={getMallList}
                            />
                            {/* <Pagination
                                className="ant-table-pagination"
                                current={current}
                                total={getMallListTotal}
                                showTotal={(total) => `共 ${total} 条`} 
                                showQuickJumper={true} 
                                showSizeChanger={true}  
                                pageSize={pageSize} 
                                pageSizeOptions= {['10', '20', '50', '100']}
                                onShowSizeChange={this.handleListPageChangeSize}
                                onChange={this.handleListPageChange} /> */}
                        </Fragment>
                    ): ''
                }
                <Modal
                    title="商城开通"
                    visible={this.state.visible}
                    onOk={this.onOk}
                    onCancel={this.onCancel}
                    okText="去设置"
                >
                    当前系统中无授权公众号，请至<span style={{fontWeight: 'bold', margin: '0 4px'}}>公众号</span>中设置！
                </Modal>
            </Page>
        )
    }
}
