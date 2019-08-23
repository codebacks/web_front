/**
 * 文件说明: 好友管理
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期: 18/11/12
 */
import React from 'react'
import ContentTabs from 'components/business/ContentTabs'
import documentTitleDecorator from 'hoc/documentTitle'
import Management from './components/Management'
import Pass from './components/Pass'
import Deleted from './components/Deleted'
import styles from './index.scss'

@documentTitleDecorator()
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}

    render() {
        return (
            <div className={styles.container}>
                <ContentTabs
                    location={this.props.location}
                    content={[
                        {
                            name: '好友管理',
                            tabKey: '1',
                            content: <Management {...this.props}/>,
                        },
                        {
                            name: '通过记录',
                            tabKey: '2',
                            content: <Pass {...this.props}/>,
                        },
                        {
                            name: '删除记录',
                            tabKey: '3',
                            content: <Deleted {...this.props}/>,
                        },
                    ]}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E4%B8%AA%E4%BA%BA%E5%8F%B7/%E5%A5%BD%E5%8F%8B%E7%AE%A1%E7%90%86.md'
                    }}
                />
            </div>
        )
    }
}
