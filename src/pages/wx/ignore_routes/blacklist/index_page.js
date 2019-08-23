/**
 * @Description
 * @author XuMengPeng
 * @date 2018/12/14
 */
import React, {Component} from 'react'
import {connect} from 'dva'
import ContentTabs from 'components/business/ContentTabs'
import documentTitleDecorator from 'hoc/documentTitle'
import Blacklist from './components/Blacklist'
import styles from './index.less'

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
        return (
            <div className={styles.container}>
                <ContentTabs
                    location={this.props.location}
                    content={[
                        {
                            name: '黑名单',
                            tabKey: '1',
                            content: <Blacklist/>,
                            description: '当前功能暂时开放群黑名单'
                        },
                    ]}
                />
            </div>
        )
    }
}
