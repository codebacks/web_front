import React, { Fragment } from 'react'
import { Progress, Button, Icon, Modal } from 'antd'
import helper from '../../utils/helper'
import Upload from './CosUpload'
import styles from './SingleUpload.less'

class SinglePhoto extends React.PureComponent {
	constructor (props) {
		super(props)
		this.state = {
			lastRange: {index: 0},
			uploadProcess: 10,
			showProcess: false,
			base64: '',
			url: props.src || '',
			previewVisible: false,
			hasUpload: !!props.src,
			previewImage: ''
		}
	}

	handleUploaded = (url) => {
		this.setState({showProcess: false, uploadProcess: 10, error: '', url})
		this.props.onUploaded(url)
	}

	handleReady = (taskId, file) => {
		helper.getBase64(file, (res) => {
			this.setState({base64: res})
		})
		this.setState({showProcess: true, hasUpload: true, error: ''})
	}

	handleProgress = (per) => {
		this.setState({uploadProcess: per.percent * 100})
	}

	handleUploadError = () => {
		this.setState({showProcess: false, hasUpload: false, error: '上传失败', url: ''})
	}

	handleRemoveImage = () => {
		this.setState({showProcess: false, hasUpload: false, url: ''})
		this.props.onRemove()
	}
	handleShowPreview = (url) => {
		this.setState({
			previewImage: url,
			previewVisible: true,
		})
	}
	handleCancelPreview = () => {
		this.setState({previewVisible: false})
	}

	render () {
		const {showProcess, uploadProcess, base64, hasUpload, previewVisible, previewImage, error, url} = this.state
		return (
			<Fragment>
				<div className={styles.singlePhoto}>
					<Upload
						dispatch={this.props.dispatch}
						onUploaded={this.handleUploaded}
						onReady={this.handleReady}
						onProgress={this.handleProgress}
						disabled={false}
						limit={2 * 1024 * 1024}
						onError={this.handleUploadError}
					>
						<Button><Icon type="upload" />{this.props.tip || '选择图片'}</Button>
					</Upload>
					{hasUpload
						? <div className={styles.progressWrap}>
							<div className={styles.imgWrap}>
								{base64 || url
									? <img src={base64 || url} alt="" />
									: ''}
								{url ? <div className={styles.action}>
										<Icon type="eye-o"
										      className={styles.icon}
										      onClick={() => {this.handleShowPreview(url)}}
										/>
										<Icon type="delete"
										      className={styles.icon}
										      onClick={() => {this.handleRemoveImage()}}
										/>
									</div>
									: ''}
							</div>
							{showProcess
								? <div className={styles.mask}>
									<Progress type="circle" width={80} percent={uploadProcess} />
								</div>
								: ''}
						</div>
						: ''}
					{error
						? <p className={styles.error}>{error}</p>
						: ''}
				</div>
				<Modal visible={previewVisible}
				       footer={null}
				       zIndex={1002}
				       onCancel={this.handleCancelPreview}
				       getContainer={() => document.getElementById('reply')}
				>
					<img alt="" style={{width: '100%'}} src={previewImage} />
				</Modal>
			</Fragment>
		)
	}
}

export default SinglePhoto
