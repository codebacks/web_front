import { Component, Fragment } from 'react'
import {connect} from 'dva'
// import router from 'umi/router'
import Page from 'components/business/Page'
import { Col, Form, Button, Collapse, List, message } from 'antd'
import styles from './index.less'
import safeSetState from 'hoc/safeSetState'
const Panel = Collapse.Panel

@connect(({base, mp_setting}) => ({
    base,
    mp_setting,
}))
@Form.create()
@safeSetState()
export default class Experience extends Component {
    state = {
        loading: false,
    }
    componentDidMount(){
 
    }
    static getDerivedStateFromProps (nextProps, state) { 
        if (nextProps.loading!== state.loading) { 
            return {
                loading: nextProps.loading
            }
        }
        return null
    }
    // 提交审核
    subMpaAudit = ()=> {
        this.props.dispatch({
            type: 'mp_setting/subMpaAudit',
            payload: {},
            callback: (data) => { 
                if (JSON.stringify(data) === '{}') { 
                    message.success('提交成功')
                }
            }
        })
    }
    onClickHref = ()=>{
        // router.push('/mall/category_management')
        window.open('http://www.51zan.cn/hotArticle.html?type=skill&articleId=29#lmsz')
    }
    render(){
        const { loading } = this.state
        const { mpaAudit, versionList } = this.props.mp_setting
        return(
            <Fragment>
                <Page.ContentBlock title='主体信息' hasDivider={false}>
                    <div className={styles.versMain}>
                        <Col className={styles.shuoMing}>上线小程序需要先提交审核</Col>
                        <Col className={styles.versMainBtn}>
                            <Button type='primary' disabled={mpaAudit===2} onClick={this.subMpaAudit}>{mpaAudit===2?'审核中':'提交审核'}</Button>
                            <div className={styles.versMainText}>
                                <span>注意：请确保您已经正确填写了<a onClick={this.onClickHref}>必要的类目设置</a>，且已经上架了商品(空白商品可能无法通过微信审核)</span>
                            </div>
                        </Col>
                    </div>
                </Page.ContentBlock>
                <Page.ContentBlock title='历史版本更新记录' hasDivider={false}>
                    <div className={styles.versBug}>
                        <List
                            itemLayout="horizontal"
                            bordered={false}
                            locale={'暂无数据'}
                            split={false}
                            loading={loading}
                            pagination={false}
                            dataSource={versionList}
                            renderItem={item => item&&(
                                <List.Item style={{ paddingTop: 0, paddingBottom: 0, borderBottom: '1px solid #E3E3E3'}}>
                                    <Collapse bordered={false} className={styles.versCollapse}>
                                        <Panel key="1" style={{marginBottom: 0, border: 0}} header={(
                                            <div className={styles.versBugHead}>
                                                <div>版本号：{item.template&&item.template.version || '暂无'}</div>
                                                <div className={styles.versBugHeadTime}>（{item.release_at&&item.release_at.split(' ')[0]}）</div>
                                            </div>
                                        )}>
                                            <div className={styles.versBugbody}>
                                                <div className={styles.versBugItem}>
                                                    <div>新功能：</div>
                                                    <div className={styles.versBugItemCon}>{item.template&&item.template.description}</div>
                                                </div>
                                                <div className={styles.versBugItem}>
                                                    <div>改进：</div>
                                                    <div className={styles.versBugItemCon}>{item.template&&item.template.improvement}</div>
                                                </div>
                                                <div className={styles.versBugItem}>
                                                    <div>BUG修复：</div>
                                                    {
                                                        (<div className={styles.versBugItemCon} >{item.template&&item.template.bug}</div>)
                                                    }
                                                </div>
                                            </div>
                                        </Panel>
                                    </Collapse>
                                </List.Item>
                            )}
                        />
                    </div>
                </Page.ContentBlock>
            </Fragment>
        )
    }
}