import React from 'react'
import {Tabs} from 'antd'
import ContentTabs from 'components/business/ContentTabs'
import TagsStatistics from './components/TagsStatistics'

import styles from './index.less'

export default class TagsIndex extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
    }

    render() {
        return (
            <div>
                <ContentTabs
                    location={this.props.location}
                    content={[
                        {
                            name: '标签统计',
                            tabKey: 'tags_statistics',
                            content: <TagsStatistics/>,
                            help: {
                                name: '帮助',
                                url: 'http://newhelp.51zan.cn/manual/content/%E5%AE%A2%E6%88%B7%E7%AE%A1%E7%90%86/%E5%AE%A2%E6%88%B7.md'
                            }
                        },
                    ]}
                />
            </div>
        )
    }
}
