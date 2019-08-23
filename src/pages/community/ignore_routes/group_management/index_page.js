import React, {Component} from 'react'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import Management from './components/Management'
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
                            name: '群管理',
                            tabKey: 'group_manage',
                            content: <Management {...this.props}/>,
                            help: {
                                url: 'http://newhelp.51zan.cn/manual/content/%E7%A4%BE%E7%BE%A4/%E7%BE%A4%E7%AE%A1%E7%90%86.md',
                            },
                        },
                    ]}
                />
            </div>
        )
    }
}
