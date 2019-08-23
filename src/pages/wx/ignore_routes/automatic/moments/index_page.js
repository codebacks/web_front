import React from 'react'
import ContentTabs from 'components/business/ContentTabs'
import documentTitleDecorator from 'hoc/documentTitle'
import Task from './components/Task'
import Log from './components/Log'
import DefaultWatermark from './components/DefaultWatermark'
import styles from './index.scss'

@documentTitleDecorator()
export default class MomentsPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}

    render() {
        return (
            <div>
                <ContentTabs
                    location={this.props.location}
                    content={[
                        {
                            name: '发朋友圈',
                            tabKey: '1',
                            content: <Task {...this.props}/>,
                            description: '用于批量朋友圈内容营销，可定时群发朋友圈'
                        },
                        {
                            name: '执行明细',
                            tabKey: '2',
                            content:  <Log {...this.props}/>,
                        },
                        {
                            name: '默认水印',
                            tabKey: '3',
                            content:  <DefaultWatermark/>,
                        },
                    ]}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E4%B8%AA%E4%BA%BA%E5%8F%B7/%E5%8F%91%E6%9C%8B%E5%8F%8B%E5%9C%88.md'
                    }}
                />
            </div>
        )
    }
}
