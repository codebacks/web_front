import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import Page from '../../../../components/business/Page'
import router from 'umi/router'
import DocumentTitle from 'react-document-title'
import { Button, Modal, Spin, Icon } from 'antd'
import { jine } from '../../../../utils/display'
import styles from './index.less'
import Agreement from './agreement'

@connect(({ base, zww_survey }) => ({
    base,
    zww_survey
}))
export default class Index extends Component {
    state = {
        showDefault: '',
        visiable: false,
        loading: false,
    }
    componentDidMount () { 
        this.getAccountStatus()
    }
    // 获取账户信息
    getAccountStatus = () => {
        this.setState({
            loading: true,
        })
        this.props.dispatch({
            type: 'zww_survey/getAccountStatus',
            payload: {},
            callback: (data) => {
                const { isOpen } = this.props.zww_survey
                let status
                if (isOpen && isOpen === 1) {
                    status = 1
                } else { 
                    status = 0
                }
                this.setState({
                    showDefault: status,
                    loading: false,
                })
            }
        })
    }
    // 开启服务
    openService = () => {
        this.setState({
            visiable: true,
        })
    }
    onCancel = () => { 
        this.setState({
            visiable: false,
        })
    }
    onOk = () => { 
        this.props.dispatch({
            type: 'zww_survey/openService',
            payload: {},
            callback: (data) => {
                this.onCancel()
                this.getAccountStatus()
            }
        })
    }
    showMoney = () => { 
        router.push('/platform/zww_account/trading_record?tab=1')
    }
    showAccount = () => { 
        router.push('/platform/zww_account')
    }
    renderText = (num) => { 
        if (num) { 
            const { 
                yesterMoney,
                yesterUnset,
                sevenMoney,
                sevenUnset,
                totalMoney,
                totalUnset,
            } = this.props.zww_survey
            let arr = [
                yesterMoney,
                yesterUnset,
                sevenMoney,
                sevenUnset,
                totalMoney,
                totalUnset
            ]
            // 获取最大数值长度
            let newArr = Array.isArray(arr)&&arr.map((item) => { 
                return jine(item).toString().length
            })
            let len = Array.isArray(newArr)&&newArr.sort((a,b) => { 
                return  b - a 
            })
            len = len && len[0]
            // 计算字体大小，最小16px最大20px
            let fonts
            if (len) {
                fonts = 116 / len + 6
                if (fonts < 16) {
                    fonts = 16
                }
                if (fonts > 24) {
                    fonts = 24
                }
            } else { 
                fonts = 16
            }
            let styles = { fontSize: `${fonts}px` }
            return <span style={styles}>{jine(num)}</span>
        }
        return ''
    }
    render () { 
        const { showDefault, loading } = this.state
        const { 
            yesterIsk,
            sevenIsk,
            totalIsk,
            yesterMoney,
            yesterUnset,
            sevenMoney,
            sevenUnset,
            totalMoney,
            totalUnset,
        } = this.props.zww_survey
        return (
            <DocumentTitle title={showDefault ? '基础设置' : '概况'}>
                <Page>
                    <Spin spinning={loading}>
                        {
                            showDefault === 0 && (
                                <Fragment>
                                    <Page.ContentHeader
                                        title="基础设置"
                                        helpUrl="http://newhelp.51zan.cn/manual/content/%E8%90%A5%E9%94%80%E5%B9%B3%E5%8F%B0/%E5%A4%A9%E5%A4%A9%E6%8A%93%E5%A8%83%E5%A8%83.md"
                                    />
                                    <div style={{marginTop: 24}}>
                                        <Button type='primary' onClick={this.openService}>开启服务</Button>
                                    </div>
                                </Fragment>
                            )
                        }
                        {
                            showDefault=== 1 && (
                                <Fragment>
                                    <Page.ContentHeader
                                        title="概况"
                                        helpUrl="http://newhelp.51zan.cn/manual/content/%E8%90%A5%E9%94%80%E5%B9%B3%E5%8F%B0/%E5%A4%A9%E5%A4%A9%E6%8A%93%E5%A8%83%E5%A8%83.md"
                                    />
                                    <Page.ContentBlock title={(<Fragment><span>游戏币</span><span className={styles.skipClick} onClick={this.showMoney}>点击查看</span></Fragment>)} hasDivider={false} style={{marginTop: -16}}>
                                        <div>
                                            <div className={styles.cardWarp}>
                                                <div className={styles.cardCont}>
                                                    <div className={styles.cardTitle}>昨日发送游戏币</div>
                                                    <div className={styles.cardNum}>{yesterIsk}</div>
                                                </div>
                                            </div>
                                            <div className={styles.cardWarp}>
                                                <div className={styles.cardCont}>
                                                    <div className={styles.cardTitle}>最近7天发送游戏币</div>
                                                    <div className={styles.cardNum}>{sevenIsk}</div>
                                                </div>
                                            </div>
                                            <div className={styles.cardWarp}>
                                                <div className={styles.cardCont}>
                                                    <div className={styles.cardTitle}>已发送游戏币总数</div>
                                                    <div className={styles.cardNum}>{totalIsk}</div>
                                                </div>
                                            </div>
                                        </div> 
                                    </Page.ContentBlock>
                                    <Page.ContentBlock title={(<Fragment><span>账单</span><span className={styles.skipClick} onClick={this.showAccount}>点击查看</span></Fragment>)} hasDivider={false}>
                                        <div>
                                            <div className={styles.accWarp}>
                                                <div className={styles.accCont}>
                                                    <div>
                                                        <div className={styles.cardIcon}>
                                                            <img src={require(`platform/assets/images/zww_yesterday.svg`)} alt=''/>
                                                        </div>
                                                        <div className={styles.cardTable}>
                                                            <div className={styles.cardTableTitle}>昨日账单</div>
                                                            <div className={styles.cardTableContent}>
                                                                <div className={styles.cardTableLeft}>
                                                                    <div className={styles.tit}>昨日订单金额(元)</div>
                                                                    <div className={styles.con}>{jine(yesterMoney)}<span className={styles.small}></span></div>
                                                                </div>
                                                                <div className={styles.cardTableRight}>
                                                                    <div className={styles.tit}>未结算金额(元)</div>
                                                                    <div className={styles.con}>{jine(yesterUnset)}<span className={styles.small}></span></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.accWarp}>
                                                <div className={styles.accCont}>
                                                    <div>
                                                        <div className={styles.cardIcon}>
                                                            <img src={require(`platform/assets/images/zww_senve.svg`)} alt=''/>
                                                        </div>
                                                        <div className={styles.cardTable}>
                                                            <div className={styles.cardTableTitle}>最近7天账单</div>
                                                            <div className={styles.cardTableContent}>
                                                                <div className={styles.cardTableLeft}>
                                                                    <div className={styles.tit}>近7天订单金额(元)</div>
                                                                    <div className={styles.con}>{jine(sevenMoney)}<span className={styles.small}></span></div>
                                                                </div>
                                                                <div className={styles.cardTableRight}>
                                                                    <div className={styles.tit}>未结算金额(元)</div>
                                                                    <div className={styles.con}>{jine(sevenUnset)}<span className={styles.small}></span></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.accWarp}>
                                                <div className={styles.accCont}>
                                                    <div>
                                                        <div className={styles.cardIcon}>
                                                            <img src={require(`platform/assets/images/zww_total.svg`)} alt=''/>
                                                        </div>
                                                        <div className={styles.cardTable}>
                                                            <div className={styles.cardTableTitle}>至现在为止账单总数</div>
                                                            <div className={styles.cardTableContent}>
                                                                <div className={styles.cardTableLeft}>
                                                                    <div className={styles.tit}>订单总金额(元)</div>
                                                                    <div className={styles.con}>{jine(totalMoney)}<span className={styles.small}></span></div>
                                                                </div>
                                                                <div className={styles.cardTableRight}>
                                                                    <div className={styles.tit}>未结算金额(元)</div>
                                                                    <div className={styles.con}>{jine(totalUnset)}<span className={styles.small}></span></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div> 
                                    </Page.ContentBlock>
                                </Fragment>
                            )
                        }
                    </Spin>
                    <Page.ContentBlock title={(<Fragment><span>应用介绍</span></Fragment>)} hasDivider={false}>
                        <div className={styles.introduct}>
                            <div className={styles.intrTitle}>这是一个在线直播抓娃娃游戏</div>
                            <div className={styles.intrDec}>1. 通过微信分享链接，邀请用户入驻游戏由您来控制用户的游戏次数</div>
                            <div className={styles.intrDec}>2. 抓到娃娃的用户，再由您在规定期限内统一付款结算，付款后平台会自动发货</div>
                            <div className={styles.intrDec}>3. 娃娃的售价范围为人民币9-29元/个</div>
                            <div className={styles.intrPic}>
                                <img src='https://image.51zan.com/2019/03/25/FsMr2s4vPNft87HzW_t2TXUos91v.png'  alt=''/>
                                <img src='https://image.51zan.com/2019/03/25/FtMa7Tzx8d85Oxm07gJBvPc1xHib.png'  alt=''/>
                                <img src='https://image.51zan.com/2019/03/25/Fm3Aqxxn6lrwowjNHECSMhWtyQI6.png'  alt=''/>
                                <img src='https://image.51zan.com/2019/03/25/Fojn6q2QsO5J7J7koXoD5bZHHQvA.png'  alt=''/>
                                <img src='https://image.51zan.com/2019/03/25/Fqax2Lz6OpBfBYenOJT7WWutq_bD.png'  alt=''/>
                            </div>
                        </div>
                    </Page.ContentBlock>
                    <Modal
                        closable={false}
                        visible={this.state.visiable}
                        onCancel={this.onCancel}
                        width={600}
                        footer={(
                            <div>
                                <Button type="primary" onClick={this.onOk}>同意并开通</Button>
                                <Button  onClick={this.onCancel}>返回</Button>
                            </div>
                        )}
                    >
                        <div className={styles.modalCon}>
                            <Agreement/>
                        </div>
                    </Modal>
                </Page>
            </DocumentTitle>
        )
    }
}
