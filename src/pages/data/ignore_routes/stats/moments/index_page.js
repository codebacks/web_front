import React, {Component} from 'react'
import {connect} from 'dva'
import ContentTabs from 'components/business/ContentTabs'
import documentTitleDecorator from 'hoc/documentTitle'
import Stat from './components/Stat'
import Heat from './components/Heat'

import styles from './index.scss'

@connect(({base}) => ({
    base,
}))
@documentTitleDecorator()
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}

    render() {
        return (<div className={styles.moments}>
            <ContentTabs
                location={this.props.location}
                content={[
                    {
                        name: '朋友圈统计',
                        tabKey: '1',
                        content: <Stat/>,
                    },
                    {
                        name: '朋友圈热度',
                        tabKey: '2',
                        content: <Heat/>,
                    },
                ]}
                help={{
                    url: 'http://newhelp.51zan.cn/manual/content/%E6%95%B0%E6%8D%AE%E4%B8%AD%E5%BF%83/%E5%BE%AE%E4%BF%A1%E7%BB%9F%E8%AE%A1.md'
                }}
            />
        </div>)
    }
}
