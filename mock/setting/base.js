/**
 **@Description:
 **@author: leo
 */

module.exports = {
    'get /api_setting/querySiderMenu': function(req, res, next) {
        setTimeout(() => {
            const menuData = [
                {
                    name: '个人信息',
                    icon: 'profile',
                    path: 'setting/personal_information',
                },
                {
                    name: '团队管理',
                    icon: 'team',
                    path: 'setting/team_management',
                },
                {
                    name: '角色权限',
                    icon: 'team',
                    path: 'setting/role_permission'
                },
            ]
            res.json({
                data: menuData,
            })
        }, 500)
    },
    'get /api_setting/api/shops': function(req, res, next) {
        setTimeout(() => {
            const menuData = [{
                id: '1',
                name: '店铺名A',
                type: 1,
                department_ids:  [
                    {id: 1, name: '产品部'},
                ],
                created_at: '2016-10-20 13:12:11',
                updated_at: '2017-10-20 13:12:11',
                auth_status: 0,
            },{
                id: '2',
                name: '店铺名B',
                type: 2,
                department_ids: [
                    {id: 1, name: '产品部'},
                    {id: 2, name: '产品部B'},
                    {id: 3, name: '产品部C'},
                    {id: 4, name: '产品部D'},
                ],
                created_at: '2016-10-20 13:12:11',
                updated_at: '2017-10-20 13:12:11',
                auth_status: 1,
            },{
                id: '3',
                name: '店铺名C',
                type: 3,
                department_ids: [
                    {id: 1, name: '产品部'},
                    {id: 3, name: '产品部C'},
                ],
                created_at: '2016-10-20 13:12:11',
                updated_at: '2017-10-20 13:12:11',
                auth_status: 2,
            },{
                id: '4',
                name: '店铺名C',
                type: 4,
                department_ids: '',
                created_at: '2016-10-20 13:12:11',
                updated_at: '2017-10-20 13:12:11',
                auth_status: 1,
            }]
            res.json({
                data: menuData,
                pagination: {
                    limit: 20,
                    offset: 0,
                    rows_found: 29,
                }
            })
        }, 500)
    },
}