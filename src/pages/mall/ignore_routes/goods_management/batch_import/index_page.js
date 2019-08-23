/*
 * @Author: zhousong 
 * @Date: 2019-2-25
 * @Discription: 商品批量导入
 */

import { PureComponent, Fragment } from 'react'
import Page from 'components/business/Page'
import DocumentTitle from 'react-document-title'
import { Steps, Modal } from 'antd'
import styles from './index.less'
import ImportConfirm from './ImportConfirm/ImportConfirm'
import ImportSource from './ImportSource/ImportSource'
import SuccessPage from './SuccessPage/SuccessPage'
import { connect } from 'dva'

const Step = Steps.Step

@connect(({base, goods_management}) => ({
    base, goods_management
}))
export default class extends PureComponent {

    state = {
        currentStep: 0,
        isConfirm: false,
        shopId: '',
        type: '',
        categoryData: null
    }

    abled = true
    
    componentDidMount () {
        this.props.dispatch({
            type: 'goods_management/getToken',
            payload: {
                type: 'image'
            }
        })
        this.props.dispatch({
            type: 'goods_management/getPlatformShops',
        })
    }

    // 页面事件
    handleNextStep = (shopId, type) => {
        this.abled = true
        this.setState({
            shopId: shopId,
            type: type,
        })
        const modal = Modal.info({
            okText: '取消加载',
            content: '正在加载当前店铺的商品数据，请耐心等待…',
            title: '商品加载',
            icon: 'loading',
            onOk: () => {
                this.abled = false
            }
        })
        this.props.dispatch({
            type: 'goods_management/getCategory',
            payload: {
                shop_id: shopId,
                goods_status: type,
            },
            callback: (data) => {
                modal.destroy()
                if (this.abled && data.total > 0) {
                    this.setState({
                        categoryData: data,
                        currentStep: 1
                    })
                } else {
                    Modal.info({
                        okText: '知道了',
                        content: '所选店铺暂无可导入的商品数据',
                        title: '结果反馈',
                        onOk: () => {
                        }
                    })
                }
            }
        })
    }

    handleLastStep = () => {
        this.setState({
            currentStep: 0
        })
    }

    confirmImport = (value) => {
        const { type, shopId } = this.state
        this.props.dispatch({
            type: 'goods_management/goodsBatchImport',
            payload: {
                update_categories: value,
                goods_status: type,
                shop_id: shopId
            },
            callback: () => {
                this.setState({
                    isConfirm: true
                })
            }
        })
    }

    render () {
        const { currentStep, shopId, type, categoryData, isConfirm } = this.state
        const { platformShops } = this.props.goods_management

        return (
            <DocumentTitle title="批量导入商品">
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '商品管理',
                            path: '/mall/goods_management'
                        }, {
                            name: "批量导入商品"
                        }]}
                    />
                    {isConfirm ?
                        <SuccessPage />
                        :
                        (
                            <Fragment>
                                <Steps current={currentStep} className={styles.step}>
                                    <Step title={<span style={{fontWeight: 'bold'}}>选择导入数据源</span>} />
                                    <Step title={<span style={{fontWeight: 'bold'}}>数据匹配确认</span>} />
                                </Steps>
                                {currentStep === 0 ?
                                    <ImportSource nextStep={this.handleNextStep} platformShops={platformShops} shopId={shopId} type={type} />
                                    :
                                    <ImportConfirm confirmImport={this.confirmImport} lastStep={this.handleLastStep} categoryData={categoryData} />
                                }
                            </Fragment>
                        )
                    }
                </Page>
            </DocumentTitle>
        )
    }
}