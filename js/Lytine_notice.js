const MILLIS_OF_8_HOURS = 8 * 60 * 60 * 1000;

//加载公告接口
function loadData() {
    let _this = this;
    let params = {
        row: _this.queryParams.row,
        page: _this.queryParams.page,
        order: JSON.stringify([
            ['NoticeDate', 'DESC']
        ])
    };
    let where = {
        $and: [
            {
                $or: [
                    {
                        PublicId: [313,2009]
                    },
                ]
            }
        ]
    };

    if (_this.queryParams.type !== -1) {// 搜索类型，-1为类型不限
        where.NoticeType = [_this.queryParams.type];
    } else {
        where.NoticeType = [0,1,5,6,7];
    }

    if (_this.queryParams.periodStart || _this.queryParams.periodEnd) {//搜索时间段
        where.NoticeDate = {};
        if (_this.queryParams.periodEnd) {
            where.NoticeDate.$lt = moment(_this.queryParams.periodEnd).add(8, 'h').add(1, 'd').toDate();
        }
        if (_this.queryParams.periodStart) {
            where.NoticeDate.$gt = moment(_this.queryParams.periodStart).add(8, 'h').toDate();
        }
    }

    if (_this.queryParams.Project_Name) {//搜索项目名称
        where.Project_Name = {
            $like: `%${_this.queryParams.Project_Name}%`
        };
    }
    params.where = JSON.stringify(where);
    _this.loading = true;
    axios({
        url: 'mock.json',// url: 'https://wx.chinapsp.cn/weapp/NoticeView',
        method: 'get',
        params,
    }).then(resp => {
        _this.bidsPage.rows = resp.data.rows;
        _this.bidsPage.total = resp.data.count;
        _this.loading = false;
        if (resp.data.count === 0) {
            _this.loadStatus = 1;
        } else {
            _this.loadStatus = 0;
        }
    }).catch(err => {
        _this.loading = false;
        let status = err.response.status;
        if (status === 500) {
            _this.loadStatus = 2;
        } else {
            _this.loadStatus = 3;
        }
    });
}

const CMIAPP = new Vue({
    el: '#cmi-app',
    data: () => {
        return {
            loading: true,
            loadStatus: 0,
            queryParams: {
                period: null,
                periodStart: null,//开始时间
                periodEnd: null,//结束时间
                Project_Name: '',
                row: 12,// 每一页的数据条数
                page: 1,// 当前页
                type: -1,// 公告类型
            },
            bidsPage: {
                rows: [],
                total: 0
            }
        }
    },
    methods: {
        loadData,
        goPage: function (page) {
            window.location.href = "#bids";
            this.queryParams.page = page;
            this.loadData();
        },
        getStatus: function (bid) { //获取竞价公告的各个时间段
            let currentTime = new Date().getTime();
            let applyTimeBegin = new Date(bid.ApplyFromTime).getTime() - MILLIS_OF_8_HOURS;
            let applyTimeEnd = new Date(bid.ApplyToTime).getTime() - MILLIS_OF_8_HOURS;
            let uppriceTimeBegin = new Date(bid.UppriceFromTime).getTime() - MILLIS_OF_8_HOURS;
            let uppriceTimeEnd = new Date(bid.UppriceToTime).getTime() - MILLIS_OF_8_HOURS;
            if (currentTime < applyTimeBegin) {
                return 0;
            } else if (applyTimeBegin < currentTime && currentTime <= applyTimeEnd) {
                return 1;
            } else if (applyTimeEnd < currentTime && currentTime <= uppriceTimeBegin) {
                return 2;
            } else if (uppriceTimeBegin < currentTime && currentTime <= uppriceTimeEnd) {
                return 3;
            } else if (currentTime > uppriceTimeEnd) {
                return 4;
            }
        },
        changeType: function (type) {
            this.queryParams.page = 1;
            this.queryParams.type = type;
            this.loadData();
        },
        search: function () {
            this.queryParams.page = 1;
            this.loadData();
        },
        getPeriod(bid) {
          let result = {
            start: 0,
            end: 0,
          };
          let status = this.getStatus(bid);
          let noticeDate = new Date(bid.NoticeDate).getTime() - MILLIS_OF_8_HOURS;

          if (status === 0) {
            result.start = noticeDate;
            result.end = new Date(bid.ApplyFromTime).getTime() - MILLIS_OF_8_HOURS;
          } else if (status === 1) {
            result.start = new Date(bid.ApplyFromTime).getTime() - MILLIS_OF_8_HOURS;
            result.end = new Date(bid.ApplyToTime).getTime() - MILLIS_OF_8_HOURS;
          } else if (status === 2) {
            result.start = new Date(bid.ApplyToTime).getTime() - MILLIS_OF_8_HOURS;
            result.end = new Date(bid.UppriceFromTime).getTime() - MILLIS_OF_8_HOURS;
          } else if (status === 3) {
            result.start = new Date(bid.UppriceFromTime).getTime() - MILLIS_OF_8_HOURS;
            result.end = new Date(bid.UppriceToTime).getTime() - MILLIS_OF_8_HOURS;
          }
          return result;
        }
    },
    created: created,
    filters: {
        formatTime: function (t) {
            return moment(t).add(-8, 'hours').format("YYYY-MM-DD HH:mm:ss");
        },
        removeString:function (t) { //去除字符串左右两边的单双引号
            return t.replace( /^[\'\"]+|[\'\"]+$/g, "");
        }
    }
});

function created() {
    this.loadData();
}
