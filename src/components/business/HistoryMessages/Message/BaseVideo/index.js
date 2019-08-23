import React, {PureComponent} from 'react'
import PropTypes from "prop-types"
import _ from 'lodash'
import styles from './index.less'

import config from 'common/config'

const {DefaultImage} = config

export default class BaseVideo extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }


    static propTypes = {
        record: PropTypes.object.isRequired,
        videoSize: PropTypes.object,
        onLoad: PropTypes.func,
        onError: PropTypes.func,
        onClick: PropTypes.func,
        cls: PropTypes.string,
        mask: PropTypes.node,
    }

    static defaultProps = {
        videoSize: {width: 240, height: 240},
        onLoad: () => {},
        onError: () =>{},
        onClick: () => {},
        cls: '',
    }


    componentDidMount() {

    }

    onError = (e) => {
        e.target.src = DefaultImage
        this.props.onError()
    }

    onClick = (url) => {
        if(url) {
            this.props.onClick(url)
        }
    }

    render() {
        const {record, videoSize,
            onLoad,
            cls, mask,
        } = this.props

        const cover = _.get(record, 'body.thumb_url') || _.get(record, 'body.media_cover_url') || ''
        const mediaUrl = _.get(record, 'body.media_url')

        return <div className={styles.baseVideo}>
            <img src={cover}
                onLoad={onLoad}
                onError={this.onError}
                style={videoSize}
                className={cls}
                rel="noreferrer"
                alt=""
            />
            <div onClick={mediaUrl ? () => this.onClick(mediaUrl) : null}
                className={styles.mask}>
                {mask ? mask : <div className={styles.icon} />}
            </div>
        </div>
    }
}
