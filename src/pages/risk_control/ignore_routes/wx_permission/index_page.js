import React from 'react'
import ByWxConfig from './components/ByWxConfig'
import ByPermissionConfig from './components/ByPermissionConfig'
import ContentTabs from 'business/ContentTabs'

export default class Index extends React.PureComponent {
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
                            name: '按微信号配置',
                            tabKey: 'wx_config',
                            content: <ByWxConfig />,
                        },
                        {
                            name: '按权限配置',
                            tabKey: 'permission_config',
                            content: <ByPermissionConfig />,
                        },
                    ]}
                />
            </div>
        )
    }
}
