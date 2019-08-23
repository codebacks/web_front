/**
 **@Description:
 **@author: leo
 */

module.exports = {
    'post /api_platform/tableList': function(req, res, next) {
        setTimeout(() => {
            const data = [{
                key: '1',
                time: '2018-10-10 13:10:50',
                name: 'John Brown',
                age: 32,
                money: '100',
                nickname: '小乌龟11',
                status: '0',
                remark: '大坏蛋',
                platformId: '322000',
                orderID: '12312312312',
                platformName: '漕河泾店',
                address: 'New York No. 1 Lake Park',
            }, {
                key: '2',
                name: 'Jim Green',
                time: '2018-10-10 13:10:50',
                age: 42,
                status: '3',
                orderID: '555555',
                platformId: '322000',
                money: '100',
                remark: '大坏蛋11',
                platformName: '漕河泾店',
                nickname: '小乌龟22',
                address: 'London No. 1 Lake Park',
            }, {
                key: '3',
                time: '2018-10-10 13:10:50',
                name: 'Joe Black',
                orderID: '6666666',
                age: 32,
                status: '2',
                platformId: '322000',
                remark: '大坏蛋22',
                platformName: '漕河泾店',
                nickname: '小乌龟33',
                money: '100',
                address: 'Sidney No. 1 Lake Park',
            }]
            res.json({
                data: data,
            })
        }, 500)
    },
}