import React from 'react'
import {Badge} from 'antd'
import {connect} from 'dva'
import Stat from './components/stat'
import Page, { DEFAULT_PAGER , DEFAULT_PAGER_FILTER} from '../../../../../components/business/Page'
import Setting from './components/setting'
import styles from './index.less'
import DocumentTitle from 'react-document-title'

@connect(({base}) => ({
    base
}))
// @documentTitleDecorator()    
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeKey:'1',
            currentTitle:'销售统计',
            showLine:true
        }
    }

    componentDidMount() {
        this.setState({
            showLine:  window.localStorage.getItem('HUZAN_SHOWLINE')
        })
    }

    handleChangeTab = (key) =>{
        if(key === '1'){
            this.setState({
                currentTitle: '销售统计',
                activeKey:key
            })
        }else{
            this.setState({
                currentTitle: '设置',
                activeKey:key,
                showLine:true
            })
            window.localStorage.setItem('HUZAN_SHOWLINE',true)
        }
    }
    render() {
        const {activeKey,showLine} = this.state
        const action = <div className={styles.setting}><span>设置</span><span className={!showLine?styles.line:styles.none}><Badge status="processing" className={styles.circle} />绩效统计支持按聊天互动统计啦</span></div>
        return (
            <DocumentTitle title={this.state.currentTitle}>
                <Page>
                    <Page.ContentHeader
                        tabs={
                            <Page.ContentHeader.Tabs
                                onChange={this.handleChangeTab}
                                defaultActive='1'
                                activeValue={activeKey}
                                options={[
                                    {label: '销售统计',value:'1'},
                                    {label: action,value:'2'}
                                ]}
                            />
                        }
                        helpUrl="http://newhelp.51zan.cn/manual/content/%E6%95%B0%E6%8D%AE%E4%B8%AD%E5%BF%83/%E7%BB%A9%E6%95%88%E6%8A%A5%E8%A1%A8.md"
                    />
                    <div>
                        {
                            activeKey === '1' ?
                                <Stat/>:<Setting/>
                        }
                    </div>
                </Page>
            </DocumentTitle>
        )
    }
}
