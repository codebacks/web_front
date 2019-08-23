import React from 'react'
import Guidance from '@/components/Guidance'


export default class extends React.Component{
    back = () => {
        const {url} = this.props.location.query
        // window.location.href = url
        window.location.replace(url)
    }
    render(){
        const {url} = this.props.location.query
        return <div style={{height:'100%'}}>
            {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
            <iframe src={url} height='100%' width='100%' frameBorder='0' />
            <Guidance {...this.props} back={this.back} />
        </div>
    }
        
}
