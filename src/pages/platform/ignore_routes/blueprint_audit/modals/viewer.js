import React from 'react'
import RcViewer from 'react-viewer'
import 'react-viewer/dist/index.css'

export default class ViewerIndex extends React.PureComponent {

    onCloseHandler = () => {
        const {onClose} = this.props
        onClose && onClose()
    }

    render () {
        const {
            images,
            visible,
            currentIndex
        } = this.props

        return (
            <RcViewer
                visible={visible}
                onClose={this.onCloseHandler}
                images={images}
                activeIndex={currentIndex}
                // container={inline ? this.container : null}
                downloadable
                customToolbar={(toolbars) => {
                    return toolbars.concat([{
                        key: 'test',
                        render: <div>C</div>,
                        onClick: (activeImage) => {
                            // console.log(activeImage)
                        },
                    }])
                }}
            />
        )
    }
}