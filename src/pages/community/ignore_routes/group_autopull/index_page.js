import React, {Component} from 'react'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import AutoPull from './components/AutoPull'
import AutoPullRecord from './components/AutoPullRecord'
import ContentTabs from 'business/ContentTabs'


@connect(({base}) => ({
    base,
}))
@documentTitleDecorator()
export default class extends Component {
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
                            name: '自动拉群',
                            tabKey: 'group_autopull',
                            content: <AutoPull {...this.props}/>,
                            help: {
                                url: 'http://newhelp.51zan.cn/manual/content/%E8%87%AA%E5%8A%A8%E6%8B%89%E7%BE%A4.md',
                            },
                        },
                        {
                            name: '自动拉群记录',
                            tabKey: 'group_autoPull_record',
                            content: <AutoPullRecord {...this.props}/>,
                            help: {
                                url: 'http://newhelp.51zan.cn/manual/content/%E8%87%AA%E5%8A%A8%E6%8B%89%E7%BE%A4.md',
                            },
                        },
                    ]}
                />
            </div>
        )
    }
}
