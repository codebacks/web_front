import React, {Fragment} from 'react'
import {Form, Input, Button} from 'antd'
import {connect} from 'dva'
import router from 'umi/router'
import commonStyles from '../../common.scss'
import styles from './index.scss'
import Friends from "crm/components/MassMsg/Friends"

const FormItem = Form.Item

@connect(({loading}) => ({
    filterLoading: loading.effects['crm_mass_msg_group/filter']
}))
export default class Result extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            submit: false,
            errMsg: '',
        }
    }

    componentDidMount() {

    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'crm_mass_msg_group/resetCreateParams',
        })
        this.goBack()
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value.replace(/\s/g, '')
        }else {
            val = e
        }
        if(key === 'name'){
            this.checkName(val)
        }
        let params = {...this.props.crm_mass_msg_group.createParams}
        params[key] = val

        this.props.dispatch({
            type: 'crm_mass_msg_group/setProperty',
            payload: {
                createParams: params
            },
        })
    }

    handleSave = () => {
        if (!this.state.submit) {
            this.setState({
                submit: true
            })
        }

        if (this.checkName()) {
            this.props.dispatch({
                type: 'crm_mass_msg_group/create',
                callback: () =>{
                    router.push('/crm/mass_msg?type=1')
                }
            })
        }
    }

    checkName = (val) => {
        if(typeof val === 'undefined'){
            val = this.props.crm_mass_msg_group.createParams.name
        }
        let {errMsg} = this.state
        if (!val) {
            this.setState({
                errMsg: '组名不能为空'
            })
            return false
        } else {
            if (errMsg) {
                this.setState({
                    errMsg: ''
                })
            }
            return true
        }
    }

    goBack = () => {
        this.props.dispatch({
            type: 'crm_mass_msg_group/setProperty',
            payload: {
                step: 1
            },
        })
    }

    handleCancel = () => {
        router.push('/crm/mass_msg?type=1')
    }

    render() {

        const formItemLayout = {
            labelCol: {
                span: 2,
                style: {
                    width: '85px'
                }
            },
            wrapperCol: {span: 7},
        }

        const {createParams: params, friendsTotal} = this.props.crm_mass_msg_group
        const {submit, errMsg} = this.state

        return (
            <Fragment>
                <Form className={styles.formWrap}>
                    <FormItem {...formItemLayout} label="组名：" required colon={false}>
                        <Input placeholder="为以下客户组取一个组名吧，20字以内"
                            maxLength={20}
                            value={params.name}
                            onChange={(e)=>{this.handleChange('name', e)}}
                        />
                        {submit && errMsg ? <p className={commonStyles.errMsg}>{errMsg}</p> : '' }
                    </FormItem>
                </Form>
                <p className={styles.count}>符合条件客户数：<span>{friendsTotal}</span></p>
                <Friends {...this.props}/>
                <div className={styles.btnWrap}>
                    <Button type="primary" onClick={this.handleSave} disabled={!friendsTotal}>保存</Button>
                    <Button onClick={this.goBack}>上一步</Button>
                    <Button className={styles.cancel} onClick={this.handleCancel}>取消</Button>
                </div>
            </Fragment>
        )
    }
}
