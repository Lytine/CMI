const cmiApp = new Vue({
    el: '#nav-app',
    data: {
        menus: [
            {id:"1",title: '通知公告', lnk: '/', icon: 'img/notice.png', iconActive: 'img/notice-hover.png', active: false},
            {id:"2",title: '政策法规', lnk: '/', icon: 'img/policy.png', iconActive: 'img/policy-hover.png', active: false},
            {id:"3",title: '帮助中心', lnk: '/', icon: 'img/help-center.png', iconActive: 'img/help-center-hover.png', active: false},
            {id:"4",title: '关于我们', lnk: '/', icon: 'img/about-us.png', iconActive: 'img/about-us-hover.png', active: false}
        ]
    },
    methods: {
    }
})