import React from 'react'
import DocumentTitle from 'react-document-title'
import Page from 'components/business/Page'
import { Form } from 'antd'
import { connect } from 'dva'
import FormView from './components/formView'

@connect(({platform_blueprint}) => ({
    platform_blueprint
}))
@Form.create()
export default class Create extends React.PureComponent {
    
    componentDidMount() {
        this.props.dispatch({
            type: 'platform_blueprint/setProperty',
            payload: {
                activitiesDetailData: ''
            }
        })
    }

    render() {
        return (
            <DocumentTitle title="创建活动">
                <Page>
                    <Page.ContentHeader title="创建活动" />
                    <FormView match={this.props.match} form={this.props.form} isInitData = {true} />
                </Page>
            </DocumentTitle>
        )
    }
}