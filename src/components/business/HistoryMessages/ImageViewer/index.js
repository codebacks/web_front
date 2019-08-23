import React, {PureComponent} from 'react'
import PropTypes from "prop-types"
import Viewer from 'react-viewer'
import 'react-viewer/dist/index.css'

export default class ImageViewer extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            activeIndex: 0,
            visible: false,
            images: [],
        }
    }

    static propTypes = {
        images: PropTypes.array,
    }

    static defaultProps = {
        images: [],
    }

    componentDidMount() {
    }

    showGallery = (url, uuid) => {
        const images = this.getValidImages(this.props.images)

        if(images.length) {
            let activeIndex = images.findIndex((v) => {
                return v.uuid === uuid
            })
            if(activeIndex === -1) {
                activeIndex = 0
            }
            this.setState({
                visible: true,
                activeIndex: activeIndex
            })
        }
    }

    hideGallery = () => {
        this.setState({visible: false})
    }

    getValidImages = (images) => {
        const validImages = images.filter((img) => {
            return !!img.src
        })
        this.setState({
            images: validImages
        })
        return validImages
    }

    render() {
        const {visible, activeIndex, images} = this.state

        return <Viewer
            visible={visible}
            images={images}
            activeIndex={activeIndex}
            onClose={this.hideGallery}
        />
    }
}
