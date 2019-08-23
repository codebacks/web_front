

import React, { Component, Fragment } from 'react'
import ImgUpload from '../../../../../components/ImgUpload'
import { Button } from 'antd'

export default class Index extends Component { 
    render () { 
        return (
            <Fragment>
                <span>自定义样式</span>
                <ImgUpload
                    defaultStyle={false}
                    maxNum={5}
                    showUploadList={false}
                >
                    <Button>上传图片</Button>
                </ImgUpload>

                
                <span>默认样式</span>
                <ImgUpload
                    maxNum={5}
                    maxSize={1}
                    types={['jpg','jpeg','png','gif']}
                    onChange={this.onChange}
                />

                <span>编辑</span>
                <ImgUpload
                    maxNum={5}
                    imgs={['2018/11/02/FvYGJ0Q9rN-qYOo45lqCOaR9bV1h.jpg', '2018/11/21/Fn5nvKhWT7XBuUzu75ZLRespqP3C.jpg']}
                />
            </Fragment>
        )
    }
}