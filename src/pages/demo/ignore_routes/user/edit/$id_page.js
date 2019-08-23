import React from 'react'
import {Form} from 'antd'
import FormView from '../components/formView'
import Page from 'components/business/Page'
import {connect} from 'dva'
import _ from 'lodash'
import { objToAntdForm } from '../../../utils/form'

@connect(({demo_user_index}) => ({
    demo_user_index
}))
@Form.create({
    mapPropsToFields(props) {
        return objToAntdForm(
            _.get(props, 'demo_user_index.editModel', {}), 
            ['name','account', 'phoneNumber', 'gender', { name: 'status', convert(value){ return value === 2 }}])
    }
})
export default class Edit extends React.PureComponent {

    componentDidMount(){        
        var id = this.props.match.params.id
        this.props.dispatch({
            type: 'demo_user_index/getEditModel',
            payload: {
                id
            },
            callback: () => {
                
            }
        })

    }

    render() {
        return (
            <Page>
                <Page.ContentHeader title="修改用户" />

                <FormView {...this.props} />
            </Page>
        )
    }
}