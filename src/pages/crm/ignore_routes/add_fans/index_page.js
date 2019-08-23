/** @description 主动加粉
 * @author liyan
 * @date 2018/12/17
 */
import React, {Component} from 'react'
import documentTitleDecorator from "hoc/documentTitle"
import ContentTabs from 'components/business/ContentTabs'
import Initiative from './components/Initiative'
import Record from './components/Record'
import Template from './components/Template'
import styles from './index.scss'

@documentTitleDecorator()
export default class extends Component {
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
                            name: '主动加粉',
                            tabKey: '1',
                            content: <Initiative/>,
                        },
                        {
                            name: '加粉记录',
                            tabKey: '2',
                            content: <Record/>,
                        },
                        {
                            name: '加粉模板',
                            tabKey: '3',
                            content: <Template/>,
                        },
                    ]}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E5%AE%A2%E6%88%B7%E7%AE%A1%E7%90%86/%E5%8A%A0%E7%B2%89.md'
                    }}
                />
            </div>
        )
    }
}
