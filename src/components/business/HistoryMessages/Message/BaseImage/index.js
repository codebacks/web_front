import React, {PureComponent} from 'react'
import PropTypes from "prop-types"
import _ from 'lodash'
import config from 'common/config'
import helper from 'utils/helper'
import ErrorImage from '../ErrorImage'

const {DefaultImage} = config

export default class BaseImage extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    static propTypes = {
        record: PropTypes.object.isRequired,
        imageSize: PropTypes.object,
        onLoad: PropTypes.func,
        onError: PropTypes.func,
        onClick: PropTypes.func,
        cls: PropTypes.string,
    }

    static defaultProps = {
        imageSize: {width: 120, height: 120},
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

    render() {
        const {record, imageSize,
            onLoad, onClick,
            cls,
            tip
        } = this.props

        let image = ''

        const thumbUrl = _.get(record, 'body.thumb_url')
        const mediaUrl = _.get(record, 'body.media_url') || _.get(record, 'body.cdnurl')
        const url =  mediaUrl || thumbUrl
        const uuid = helper.getUniqueMessageId(record)

        if (url) {
            image = <img src={thumbUrl || mediaUrl}
                onLoad={onLoad}
                onError={this.onError}
                onClick={() => {onClick(url, uuid)}}
                style={imageSize}
                className={cls}
                rel="noreferrer"
                alt=""/>
        } else {
            image = <ErrorImage imageSize={imageSize} tip={tip}/>
        }

        return image
    }
}
