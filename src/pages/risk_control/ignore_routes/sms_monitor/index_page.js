import React from 'react'
import MobileMsg from './components/MobileMsg'
import SensitiveMsg from './components/SensitiveMsg'
import SmsSensitiveWord from './components/SmsSensitiveWord'
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
                            name: '手机短信',
                            tabKey: 'mobile_msg',
                            content: <MobileMsg/>,
                        },
                        {
                            name: '敏感短信',
                            tabKey: 'sensitive_msg',
                            content: <SensitiveMsg/>,
                        },
                        {
                            name: '短信敏感词',
                            tabKey: 'sms_sensitive_word',
                            content: <SmsSensitiveWord/>,
                        },
                    ]}
                />
            </div>
        )
    }
}
