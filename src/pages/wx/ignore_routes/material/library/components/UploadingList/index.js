import React, {PureComponent} from 'react'
import {Icon} from 'antd'
import helper from 'wx/utils/helper'
import utils from '../../utils'
import config from 'wx/common/config'
import styles from './index.scss'

const {materialType} = config

export default class UploadingList extends PureComponent {

    getCover = (type, url) => {
        if(url) {
            switch(type) {
                case materialType.image.type: return helper.getThumbLimit(url, 512)
                case materialType.video.type: return helper.getVideoCover(url)
                default: return url
            }
        }
    }

    render() {
        const {type, fileList, createLoading} = this.props

        return fileList.map((item)=>{
            const {status} = item
            if (status) {
                if (status === 'uploading') {
                    return <div className={styles.box} key={item.uid}>
                        <div className={styles.mask}>
                            <div className={styles.uploadingWrap}>
                                <Icon type="loading" className={styles.uploading} />
                                <p>上传中...</p>
                            </div>
                        </div>
                    </div>
                } else if (status === 'done') {
                    return <div className={styles.box} key={item.uid}>
                        {
                            !helper.isUploadComplete(fileList) || createLoading ? <div className={styles.mask}>
                                <div className={styles.uploadingWrap}>
                                    <Icon type="loading" className={styles.uploading} />
                                    <p>上传中...</p>
                                </div>
                            </div> : null
                        }
                        {utils.isVideo(type) ? <div className={styles.play}/> : null}
                        <div className={styles.coverWrap}>
                            <img className={styles.cover}
                                src={this.getCover(item.response && item.response.url)}
                                alt=""
                            />
                        </div>
                    </div>
                }
            }
        })
    }
}
