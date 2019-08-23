'use strict'

/**
 * 文件说明:配置文件
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期: 18/8/1
 */

export default {
    pageSizeOptions: ['10', '20', '50', '100'], // 表格分页选项
    MessageLimit: 30, // 默认读取聊天记录数
    Sex: {'1': '男', '2': '女', '0': '未知'},
    DateFormat: 'YYYY-MM-DD',
    DateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
    DateMonthFormat: 'MM-DD HH:mm:ss',
    ReceiveMessageTypes: {
        text: 'Text',
        video: 'Video',
        attachment: 'Attachment',
        picture: 'Picture',
        recording: 'Recording',
        sharing: 'Sharing',
        map: 'Map',
        friends: 'Friends',
        card: 'Card',
        note: 'Note'
    },
    PriorityType: {
        reply: 'reply'
    },
    DefaultImage: require('@/assets/images/image_error.svg'), // 默认图片
}
