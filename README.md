# umi pro

> A react project

## Build Setup

``` bash
node -v （版本8.7.0以上）

npm install yarn -g

yarn config set sass-binary-site http://npm.taobao.org/mirrors/node-sass

yarn install

//开发
npm run start

//打包
npm run build

//打包(mock)
npm run build:mock
```

## 项目规范
- 1.public为不经过编译的静态资源文件夹，子项目的静态文件放在public/{subProjectName}下，base为全局文件。（public/demo/images/log.png -> <img src='/demo/images/log.png'）
- 2.全局文件不能擅自改动，有需求找相关维护人员。
- 3.src/pages 下一级文件都是子项目，具体可以参考例子（src/pages/demo）
- 4.css 全部用css-modules 防止命名冲突 [文档](https://github.com/css-modules/css-modules)
- 5.dva models必须加命名空间（以子项目为名, demo ->  namespace: 'demo_base'） 如何创建 [文档](https://umijs.org/guide/with-dva.html)
- 6.在react组件中创建的定时器，事件等，必须在componentWillUnmount中销毁
- 7.不要轻易创建全局变量
- 8.mock数据在/mock文件夹下，以子项目作为命名空间
- 9.每个子项目请求路径在dev环境下加上命名空间和服务段商量防止冲突（config->development.js->apiHost）
- 10.componentWillMount, componentWillUpdate, componentWillReceiveProps 这个3个生命周期最好少用 react 后续版本会删除 [文档](https://reactjs.org/docs/react-component.html)
- 11.谁开发的业务要在文件头注释作者，更好沟通
- 12.url用下划线连接
- 13.代理设置在每个子目录的project_config.js中的proxy,修改target字段
- 14.${url}/login?redirect_url=${redirectUrl}&access_token=1  会重定向到redirectUrl?access_token=${token}


## 路由约定

- 1.必须在./src/pages下
- 2.文件名后缀_page才会生出路由
- 3.文件夹名为ignore_routes的生成path时，/ignore_routes会被删除。

假设 `pages` 目录结构如下：


```
+ pages/
  + demo
    + assets         // 图标等资源目录
    + common         // 通用配置：API接口地址、面包屑等
    + components     // 组件目录
    + config         // 依赖运行环境的配置在这里
    + ignore_routes  // 路由约定页面
    + models         // 数据模型目录
    + services       // 数据接口请求
    + style          // 当前模块公用样式
    + utils          // 辅助
    + _layout.js     // 布局
    + project_config // 工程配置、代理等



  + users/
    + ignore_routes/
      - other.js
      - list_page.js
      - list_page.js
      - $id_page$.js
      + $post/
        - list_page.js
        - comments_page.js
    - utils.js
  - list_page.js
```

会自动生成路由配置如下：

```js
[
  { path: '/': exact: true, component: './pages/list_page.js' },
  { path: '/users/': exact: true, component: './pages/users/ignore_routes/list_page.js' },
  { path: '/users/list': exact: true, component: './pages/users/ignore_routes/list_page.js' },
  { path: '/users/:id?': exact: true, component: './pages/users/ignore_routes/$id_page$.js' },
    { path: '/users/:post/', exact: true, component: './pages/user/ignore_routes/$post/list_page.js' },
    { path: '/users/:post/comments', exact: true, component: './pages/user/ignore_routes/$post/comments_page.js' },
]
```
[page文档](https://umijs.org/guide/router.html)



##每个项目下的project_config为子项目配置，可配置routes, alias, proxy。配置别名需要加上自己的命名空间可参考demo


## 参考文档

- react: [文档](https://reactjs.org/)
- redux: [文档](https://redux.js.org/)
- antDesign: [文档](https://ant.design/index-cn)
- lodash: [文档](https://lodash.com/)
- umi: [文档](https://umijs.org/)
- dva: [文档](https://dvajs.com/)
- es6: [文档](http://es6.ruanyifeng.com/#docs/generator-async)
- eslint: [文档](https://eslint.org/)
- qrcode: [文档](https://github.com/zpao/qrcode.react)
- react-copy-to-clipboard: [文档](https://github.com/nkbt/react-copy-to-clipboard)


## git分支：

master: 正式环境 51zan.com

develop: 内部开发联调 dev.51zan.com

test: 测试环境 test.51zan.com

根据gitflow工作流： [gitflow](https://www.cnblogs.com/lcngu/p/5770288.html)

feature/目录下放开发分支，例：feature/v1.0.0；   
开发完成后统合到develop分支，提交测试 -> test分支；   
若只测试某个功能则直接由feature/下的分支合并到release/下的同名分支；   
测试完成由测试人员提交到master分支上线；   
上线完成把此release/下的分支合并到develop；   
若线上存在bug继续修改，则创建在hotfix/下，例：hotfix/v1.0.1_bug，并在此分支测试，测试完成分别合并到master和develop。   


## 开发步骤

1、独立模块拷贝一份DEMO，正常按顶部导航划分应用模块。

2、common/api 配置业务对应的接口地址，同步修改config下对应地址

3、services/*  创建接口请求

4、models/*  创建对应数据模型

5、ignore_routes/* 创建对应路由页面，如有面包屑需要修改 common/crumbs.js

6、components/*  根据业务抽离对应组件





## 开发环境

### 菜单配置

1. 登录[管理后台](http://dev-manager.51zan.com/)
2. 系统设置->菜单管理（商家端）
3. 菜单图标配置，[点击查看详细文档](./docs/菜单图标.md)



### 通用组件

部门选择组件、员工选择组件、微信单选/多选组件

文件目录：src/components/business

用法见DEMO子项目组件菜单： /demo/components




