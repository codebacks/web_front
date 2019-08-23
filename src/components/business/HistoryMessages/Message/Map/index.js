import React, {PureComponent} from 'react'
import styles from './index.less'
import helper from 'utils/helper'

export default class Map extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            defaultSize: 150,
        }
    }

    componentDidMount() {}

    getMapUrl = (item) => {
        return helper.format('http://apis.map.qq.com/uri/v1/geocoder?coord={lat},{lng}&name={label}', {
            lat: item.lat,
            lng: item.lng,
            label: item.label
        })
    }
    render() {
        const {record} = this.props

        return <div className={`${styles.box} ${styles.map}`}>
            <a href={this.getMapUrl(record.body)}
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
            >
                <div className={styles.title}>
                    {record.text}
                    {record.body.label}
                </div>
                {record.body.thumb_url ? <div className={`${styles.extWrap} ${styles.extWrap}`}>
                    <img src={record.body.thumb_url} alt="" />
                </div> : null}
            </a>
        </div>
    }
}