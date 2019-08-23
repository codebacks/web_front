import React from 'react'
import DocumentTitle from 'react-document-title'
import Page from 'components/business/Page'
import { Form} from 'antd'
import { connect } from 'dva'
import FormView from './components/formView'


@connect()
@Form.create()
export default class Create extends React.PureComponent {

    render(){
        return (
            <DocumentTitle title="添加用户">
                <Page>
                    <Page.ContentHeader title="添加用户" />

                    <FormView {...this.props} />
                </Page>
            </DocumentTitle>
        )
    }
}