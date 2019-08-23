module.exports = {
    'get /api_mock/getReportList': function(req, res, next) {
        setTimeout(() => {
            const exportList = [
                {
                    id: 1,
                    status: 1,
                    created_at: '2019-5-20 14:18:29',
                    complete_at: '2019-5-20 14:18:29',
                    report_at: '2019-12周',
                    download_url: 'https://document.51zan.com/red_packet/payment/20190520151815-payment.xls',
                },
                {
                    id: 2,
                    status: 2,
                    created_at: '2019-5-20 14:18:29',
                    complete_at: '2019-5-20 14:18:29',
                    report_at: '2019-12周',
                    download_url: 'https://document.51zan.com/red_packet/payment/20190520151815-payment.xls',
                },
                {
                    id: 3,
                    status: 3,
                    created_at: '2019-5-20 14:18:29',
                    complete_at: '2019-5-20 14:18:29',
                    report_at: '2019-12周',
                    download_url: 'https://document.51zan.com/red_packet/payment/20190520151815-payment.xls',
                }
            ]
            res.json({
                data: exportList,
                pagination: {
                    rows_found: 3,
                    offset: 0,
                    limit: 10
                }
            })
        }, 500)
    },
}
