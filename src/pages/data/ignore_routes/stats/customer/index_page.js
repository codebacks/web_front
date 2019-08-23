import React from 'react'
import {connect} from 'dva'
import ContentTabs from 'components/business/ContentTabs'
import documentTitleDecorator from 'hoc/documentTitle'
import Stat from './components/Stat'
import Dist from './components/Dist'
import Pass from './components/Pass'
import styles from './index.scss'

@connect(({base}) => ({
    base,
}))
@documentTitleDecorator()
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}

    render() {
        return <div className={styles.container}>
            <ContentTabs
                location={this.props.location}
                content={[
                    {
                        name: '好友统计',
                        tabKey: '1',
                        content: <Stat {...this.props}/>,
                    },
                    {
                        name: '好友分布',
                        tabKey: '2',
                        content: <Dist {...this.props}/>,
                    },
                    {
                        name: '通过统计',
                        tabKey: '3',
                        content: <Pass {...this.props}/>,
                    },
                ]}
                help={{
                    url: 'http://newhelp.51zan.cn/manual/content/%E6%95%B0%E6%8D%AE%E4%B8%AD%E5%BF%83/%E5%BE%AE%E4%BF%A1%E7%BB%9F%E8%AE%A1.md'
                }}
            />
        </div>
    }
}
