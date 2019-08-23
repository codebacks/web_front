import React, {Component} from 'react'
import {Tabs} from 'antd'
import {connect} from 'dva'
import ContentTabs from 'components/business/ContentTabs'
import documentTitleDecorator from 'hoc/documentTitle'
import Whitelist from './components/Whitelist'
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
                            name: '白名单',
                            tabKey: '1',
                            content: <Whitelist/>,
                        },
                    ]}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E4%B8%AA%E4%BA%BA%E5%8F%B7/%E7%99%BD%E5%90%8D%E5%8D%95.md'
                    }}
                />
			</div>
		)
	}
}
