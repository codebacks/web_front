import { Component } from 'react'
import {connect} from 'dva'
import Page from 'components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import DocumentTitle from 'react-document-title'
import { Row, Tabs  } from 'antd'
import General  from './General'
import Experience  from './Experience'
import Version  from './Version'
import ShopFitment  from './ShopFitment'
const TabPane = Tabs.TabPane

@connect(({base, mp_setting}) => ({
    base,
    mp_setting,
}))
@documentTitleDecorator()
export default class Index extends Component{
    state = {
        currentKey: '1',
        currentName: '通用设置',
        loading: false, 
    }
    componentDidMount () {
        let key
        if (this.props.location.params) { 
            key = this.props.location.params.key
        }
        if (key) {
            this.onTabClick(key.toString())
        } else { 
            this.onTabClick('1')
        }
    }
    onTabClick = (key) => {
        let name
        if(key === '1'){
            name = '通用设置'
            this.props.dispatch({
                type: 'mp_setting/getSettingData',
                payload: {}
            })
        } else if (key === '2') {
            name = '设置体验账号'
            const { currentPage, perPage } = this.props.mp_setting
            this.props.dispatch({
                type: 'mp_setting/getExperieList',
                payload: {
                    page: currentPage,
                    per_page: perPage,
                }
            }) 
        }else if(key === '3'){
            name = '版本管理'
            this.props.dispatch({
                type: 'mp_setting/getMpaAudit',
                payload: {}
            }) 
            this.setState({
                loading: true, 
            })
            this.props.dispatch({
                type: 'mp_setting/getMpaHistory',
                payload: {},
                callback: ()=> {
                    this.setState({
                        loading: false, 
                    })
                }
            })
        }else if(key === '4'){
            name = '界面设置'
            this.props.dispatch({
                type: 'mp_setting/getMpaAudit',
                payload: {}
            }) 
            this.setState({
                loading: true, 
            })
            this.props.dispatch({
                type: 'mp_setting/getMpaHistory',
                payload: {},
                callback: ()=> {
                    this.setState({
                        loading: false, 
                    })
                }
            })
        }
        this.setState({
            currentKey: key,
            currentName: name,
        })
    }
    render(){
        const { currentKey, currentName } = this.state
        return (
            <DocumentTitle title={currentName}>
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '店铺管理',
                            path: '/setting/shop_management'
                        },{
                            name: currentName
                        }]}
                    /> 
                    <Row>
                        <Tabs activeKey={currentKey} onTabClick={this.onTabClick}>
                            <TabPane tab="通用设置" key="1">
                                <General key={currentKey}/>
                            </TabPane>
                            <TabPane tab="设置体验账号" key="2">
                                <Experience key={currentKey}/>
                            </TabPane>
                            <TabPane tab="版本管理" key="3">
                                <Version key={currentKey} loading={this.state.loading} />
                            </TabPane>
                            <TabPane tab="界面设置" key="4">
                                <ShopFitment />
                            </TabPane>
                        </Tabs>
                    </Row>
                </Page>
            </DocumentTitle>
        )
    }
}