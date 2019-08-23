import React from 'react'
import styles from './index.less'
// import AutoReply from './components/AutoReply'
import ContentTabs from 'components/business/ContentTabs'
import documentTitleDecorator from "hoc/documentTitle"
import AutoReplyTemplate from './components/AutoReplyTemplate'
import AutoReplyGlobal from './components/AutoReplyGlobal'

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
                        url: 'http://newhelp.51zan.cn/manual/content/%E4%B8%AA%E4%BA%BA%E5%8F%B7/%E6%99%BA%E8%83%BD%E7%AE%A1%E7%90%86.md'
                    }}
                />
            </div>
        )
    }
}
