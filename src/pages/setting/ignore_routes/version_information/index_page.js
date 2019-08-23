

import React,{Fragment} from 'react'
import {connect} from 'dva'
import {isNewRetail} from '../../../../utils/resource'
import Newretail from './newretail'
import PrivateSteward from './privateSteward'
import documentTitleDecorator from 'hoc/documentTitle'


@connect(({base,setting_version_information}) => ({
    base,setting_version_information
}))
@documentTitleDecorator({
    title:'版本信息'
})
export default class versionInformation   extends React.Component{
    constructor(){
        super()
        this.state ={
        }
    }
    componentDidMount () {
    }
    render(){

        return (
            <Fragment>
                {
                    isNewRetail()?<PrivateSteward/>:<Newretail/>
                    // isNewRetail()?<Newretail/>:<PrivateSteward/>
                }
            </Fragment> 
        )   
    }

}
