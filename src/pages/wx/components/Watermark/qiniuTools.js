/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/11/8
 */

import * as qiniu from 'qiniu-js'
import constant from "./constant"
import {urlSafeBase64Encode} from "qiniu-js/src/base64"
import {captureException, warpExtra} from "utils/raven"

function getImageUrl(key, domain) {
    key = encodeURIComponent(key);
    if (domain.slice(domain.length - 1) !== "/") {
        domain = domain + "/";
    }
    return domain + key;
}

export function imageView2(op, key, domain) {
    if (!/^\d$/.test(op.mode)) {
        throw "mode should be number in imageView2";
    }
    let mode = op.mode,
        w = op.w,
        h = op.h,
        q = op.q,
        format = op.format;

    if (!w && !h) {
        throw "param w and h is empty in imageView2";
    }

    let imageUrl = "imageView2/" + encodeURIComponent(mode);
    imageUrl += w ? "/w/" + encodeURIComponent(w) : "";
    imageUrl += h ? "/h/" + encodeURIComponent(h) : "";
    imageUrl += q ? "/q/" + encodeURIComponent(q) : "";
    imageUrl += format ? "/format/" + encodeURIComponent(format) : "";
    if (key) {
        imageUrl = getImageUrl(key, domain) + "?" + imageUrl;
    }
    return imageUrl;
}

export function createXHR() {
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    }
    return new window.ActiveXObject("Microsoft.XMLHTTP");
}


function request(url, options) {
    return new Promise((resolve, reject) => {
        let xhr = createXHR();
        xhr.open(options.method, url);

        if (options.onCreate) {
            options.onCreate(xhr);
        }
        if (options.headers) {
            Object.keys(options.headers).forEach(k =>
                xhr.setRequestHeader(k, options.headers[k])
            );
        }

        xhr.upload.addEventListener("progress", evt => {
            if (evt.lengthComputable && options.onProgress) {
                options.onProgress({loaded: evt.loaded, total: evt.total});
            }
        });

        xhr.onreadystatechange = () => {
            let responseText = xhr.responseText;
            if (xhr.readyState !== 4) {
                return;
            }
            let reqId = xhr.getResponseHeader("x-reqId") || "";
            if (xhr.status !== 200) {
                let message = `xhr request failed, code: ${xhr.status};`;
                if (responseText) {
                    message = message + ` response: ${responseText}`;
                }
                reject({code: xhr.status, message: message, reqId: reqId, isRequestError: true});
                return;
            }
            try {
                resolve({data: JSON.parse(responseText), reqId: reqId});
            } catch (err) {
                reject(err);
            }
        };

        xhr.send(options.body);
    });
}

export function imageInfo(url) {
    return request(formatUrl(url, 'imageInfo'), {method: "GET"})
}

export function calculateSize({width, height}, norm) {
    let size
    if(width < height) {
        size = width
    }else {
        size = height
    }

    size = Math.round((size * norm) / constant.previewWidth)

    return size
}

export async function calculateAllWatermarkUrlInfo({previewArr, textWatermarkValue, qrCodeChecked}) {
    try {
        const watermarks = []
        previewArr.forEach((item) => {
            watermarks.push(calculateWatermarkUrlInfo({
                previewUrl: item.url,
                textWatermarkValue,
                qrCodeChecked,
                waterMarksData: item.waterMarksData,
            }))
        })

        return await Promise.all(watermarks)
    }catch(e) {
        console.log(e)
        captureException('水印批量参数生成出错', {extra: warpExtra(e)})
        throw e
    }
}

export async function calculateWatermarkUrlInfo({previewUrl, textWatermarkValue, qrCodeChecked, waterMarksData = {}}) {
    const {data} = await imageInfo(previewUrl)
    const size = calculateSize(data, constant.qrCodeWidth)
    const qrUrl = getQrUrl(size)

    const watermarkUrlInfo = getWatermarkUrlInfo(previewUrl, {
        text: textWatermarkValue,
        fontsize: calculateSize(data, constant.textWatermark.fontsize),
        dx: calculateSize(data, constant.textWatermark.dx),
        dy: calculateSize(data, constant.textWatermark.dy),
    }, {
        checked: qrCodeChecked,
        image: qrUrl,
        dx: calculateSize(data, constant.imageWatermark.dx),
        dy: calculateSize(data, constant.imageWatermark.dy),
    })

    return Object.assign({}, waterMarksData, watermarkUrlInfo, {
        imageInfo: data,
    })
}

export function getQrUrl(size) {
    const url = constant.qrCodeUrl
    const policy = imageView2({
        mode: 2,
        w: size,
        h: size,
        // q: 100,
        // format: 'png'
    })

    return formatUrl(url, policy)
}

export function getQniuWatermarkOption(watermarkOption, defaultWatermarkOption) {
    const option = {
        fop: 'watermark',
    }

    Object.assign(option, defaultWatermarkOption, watermarkOption)

    return option
}

export function formatUrl(url, policy) {
    return url.includes('?') ? `${url}|${policy}` : `${url}?${policy}`
}

export function getWatermarkUrlInfo(previewUrl, textWatermarkOption, imageWatermarkOption) {
    const pipelineOp = []
    const textWatermark = getQniuWatermarkOption(textWatermarkOption, constant.textWatermark)
    const imageWatermark = getQniuWatermarkOption(imageWatermarkOption, constant.imageWatermark)
    let text_base64 = ''
    let image_base64 = ''

    textWatermark.text = textWatermark.text.trim()

    if(textWatermark.checked && textWatermark.text.length !== 0) {
        text_base64 = urlSafeBase64Encode(textWatermark.text)
        pipelineOp.push(textWatermark)
    }
    if(imageWatermark.checked && imageWatermark.image) {
        pipelineOp.push(imageWatermark)
        image_base64 = urlSafeBase64Encode(imageWatermark.image)
    }

    const policy = qiniu.pipeline(pipelineOp)
    let url = formatUrl(previewUrl, policy)
    const length = url.length
    if(url.slice(length - 1) === "|") {
        url = url.slice(0, length - 1)
    }

    return {
        url: url,
        info: {
            policy,
            fopArr: pipelineOp,
            text_base64,
            image_base64,
        },
    }
}
