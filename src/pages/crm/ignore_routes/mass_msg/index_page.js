import React from 'react'
import {Tabs} from 'antd'
import {connect} from "dva/index"
import router from 'umi/router'
import documentTitleDecorator from 'hoc/documentTitle'
import Group from './Group/index'
import Record from './Record/index'
import styles from './index.scss'

const TabPane = Tabs.TabPane

@connect(({base, crm_mass_msg_group, crm_mass_msg_record}) => ({
    base,
    crm_mass_msg_group,
    crm_mass_msg_record,
}))
@documentTitleDecorator()
export default class FriendsMassMsgPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}

    handleChange = (key) => {
        router.push({
            pathname: '/crm/mass_msg',
            query: {
                type: key
            }
        })
    }

    render() {
        const query = this.props.location.query
        const activeKey = query && query.type || '1'
        return (
            <div className={styles.container}>
                <Tabs defaultActiveKey={activeKey} onChange={this.handleChange}>
                    <TabPane tab="客户群发" key="1">
                        <Group {...this.props}/>
                    </TabPane>
                    <TabPane tab="群发记录" key="2">
                        <Record {...this.props}/>
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}
