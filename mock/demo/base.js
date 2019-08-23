/**
 **@Description:
 **@author: leo
 */

module.exports = {
    'get /api_demo/menus': function (req, res, next) {
        setTimeout(() => {
            const menuData = [
                {
                    name: '列表',
                    icon: 'desktop',
                    path: 'demo/table',
                },
                {
                    name: '表单',
                    icon: 'bar-chart',
                    path: 'demo/form/create',
                },
                {
                    name: '弹窗',
                    icon: 'hdd',
                    path: 'demo/modal',
                },
                {
                    name: '分组1',
                    path: 'demo',
                    key: 'group1',
                    children: [
                        {
                            name: '子菜单1',
                            icon: 'skin',
                            path: 'sub',
                        },
                        {
                            name: '子菜单2',
                            icon: 'heart-o',
                            path: 'sub1',
                        },
                        {
                            name: '子菜单3',
                            icon: 'team',
                            path: 'sub2',
                        },

                    ],
                },
                {
                    name: '分组2',
                    path: 'demo',
                    key: 'group2',
                    children: [
                        {
                            name: '子菜单4',
                            icon: 'appstore-o',
                            path: 'sub3',
                        },
                        {
                            name: '子菜单5',
                            icon: 'inbox',
                            path: 'sub4',
                        },
                        {
                            name: '子菜单6',
                            icon: 'exception',
                            path: 'sub5',
                        },
                    ]
                },
            ]
            res.json({
                data: menuData,
            })
        }, 500)
    },
}