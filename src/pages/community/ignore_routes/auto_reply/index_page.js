import React from 'react'
import styles from './index.less'
import AutoReplyTemplate from './components/AutoReplyTemplate'
import AutoReplyGlobal from './components/AutoReplyGlobal'
import ContentTabs from 'components/business/ContentTabs'
import documentTitleDecorator from "hoc/documentTitle"
// import GroupAutoReply from './components/GroupAutoReply'

@documentTitleDecorator()
export default class Index extends React.PureComponent {
    render() {
        return (
            <div className={styles.container}>
                <ContentTabs
                    location={this.props.location}
                    content={[
                        {
                            name: '回复模板',
                            tabKey: '1',
                            content: <AutoReplyTemplate/>,
                        },
                        {
                            name: '全局配置',
                            tabKey: '2',
                            content: <AutoReplyGlobal/>,
                        },
                    ]}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E7%A4%BE%E7%BE%A4/%E8%87%AA%E5%8A%A8%E5%9B%9E%E5%A4%8D.md',
                    }}
                />
            </div>
        )
    }
}
