import React, {Component} from 'react'
import ContentTabs from 'business/ContentTabs'
import documentTitleDecorator from 'hoc/documentTitle'
import Stat from './components/Stat'
import Management from './components/Management'
import AutoReplyKeyword from './components/AutoReplyKeyword'
import styles from './index.less'

@documentTitleDecorator()
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}

    render() {
        return (
            <ContentTabs
                location={this.props.location}
                content={[
                    {
                        name: '关键词统计',
                        tabKey: '1',
                        content: <Stat {...this.props}/>,
                    },
                    {
                        name: '关键词管理',
                        tabKey: '2',
                        content: <Management {...this.props}/>,
                    },
                    {
                        name: '自动回复关键词统计',
                        tabKey: '3',
                        content: <AutoReplyKeyword {...this.props}/>,
                    },
                ]}
            />
        )
    }
}
