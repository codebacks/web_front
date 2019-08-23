import React, {Component} from 'react'
import {connect} from 'dva'
import ContentTabs from 'components/business/ContentTabs'
import documentTitleDecorator from 'hoc/documentTitle'
import Stat from './components/Stat'

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
                            name: '互动统计',
                            tabKey: '1',
                            content: <Stat/>,
                        },
                    ]}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E7%A4%BE%E7%BE%A4/%E7%BB%9F%E8%AE%A1.md'
                    }}
                />
            </div>
        )
    }
}
