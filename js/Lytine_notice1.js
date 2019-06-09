const MILLIS_OF_8_HOURS = 8 * 60 * 60 * 1000;

//加载公告接口
function loadNoticeData() {
  let _this = this;
  _this.bidsPage = {
    rows: [],
    total: 0
  };
  let params = {
    row: _this.queryParams.row,
    page: _this.queryParams.page,
    order: JSON.stringify([
      ['NoticeDate', 'DESC']
    ]),
  };
  let newPlatformWhere = {
    $and: [
      {
        $not: [
          {
            PublicId: [197]
          }
        ]
      }
    ]
  };

  if (_this.queryParams.type !== -1) {//搜索类型，-1为类型不限
    newPlatformWhere.NoticeType = [_this.queryParams.type];
  } else {
    newPlatformWhere.NoticeType = [0, 1, 5, 6, 7];
  }

  if (_this.queryParams.Project_Name) {//搜索项目名称
    newPlatformWhere.Project_Name = {
      $like: `%${_this.queryParams.Project_Name}%`
    };
  }

  if (_this.queryParams.periodStart || _this.queryParams.periodEnd) {//搜索时间段
    newPlatformWhere.NoticeDate = {};
    if (_this.queryParams.periodEnd) {
      newPlatformWhere.NoticeDate.$lt = moment(_this.queryParams.periodEnd).add(8, 'h').add(1, 'd').toDate();
    }
    if (_this.queryParams.periodStart) {
      newPlatformWhere.NoticeDate.$gt = moment(_this.queryParams.periodStart).add(8, 'h').toDate();
    }
  }

  newPlatformWhere.NoticeType = _this.queryParams.type;

  params.where = JSON.stringify(newPlatformWhere);

  _this.loading = true;
  axios({
    url: NOTICE_LIST_URL,
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
    let resp = err.response;
    if (resp && resp.status === 500) {
      _this.loadStatus = 2;
    } else {
      _this.loadStatus = 3;
    }
    _this.loading = false;
  });
}

/* vue*/
new Vue({
  el: '#notice-app',
  data: () => {
    return {
      loading: true,
      loadStatus: 0,
      queryParams: {
        row: 12,// 每一页的数据条数
        page: 1,// 当前页
        //type: [0, 1, 5, 6, 7],// 公告类型
        type: 0,
        Project_Name: '',//项目名称
      },
      bidsPage: {
        rows: [],
        total: 0
      },
      activeTab: 'second',//tab标签替换
      changeType: function (type) {
        this.queryParams.page = 1;
        this.queryParams.type = type;
        this.loadNoticeData();
      },
      periodStart: null,//开始时间
      periodEnd: null,//结束时间
    }
  },
  methods: {
    loadNoticeData,
    goPage: function (page) {
      window.location.href = "#bids";
      this.queryParams.page = page;
      this.loadNoticeData();
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
    },
    open: (PublicId, Id) => {
      window.open(NOTICE_CONTENTS_PAGE_URL + Id);
    },
    search: function () {
      this.queryParams.page = 1;
      this.loadNoticeData();
    },
  },
  filters: {
    formatTime: function (t) {
      return moment(t).add(-8, 'hours').format("YYYY-MM-DD HH:mm:ss");
    },
    removeString: function (t) { //去除字符串左右两边的单双引号
      return t.replace(/^[\'\"]+|[\'\"]+$/g, "");
    }
  },
  created() {
    this.loadNoticeData();
  }
});
