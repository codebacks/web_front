import React from 'react'
import {connect} from "dva/index"
import ContentHeader from 'components/business/ContentHeader'
import documentTitleDecorator from 'hoc/documentTitle'
import SentMoments from './components/SentMoments/index'
import router from 'umi/router'

@connect(({base, wx_moments}) => ({
    base,
    wx_moments,
}))
@documentTitleDecorator({
    title: '新建朋友圈',
})
export default class SentMomentPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
    }

    handleCancel = () => {
        router.push('/wx/automatic/moments')
    }

    render() {
        return (
            <div>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                />
                <SentMoments
                    handleCancel={this.handleCancel}
                >
                </SentMoments>
            </div>
        )
    }
}
