/**
 * Created by laicuiting.
 */
LPTemplate = `
<div class="lytine-progress-wrapper">
  <div ref="bubble" class="bubble" style="display: none">
    <div ref="txt" class="bubble-txt" :style="bubbleStyle">{{txt}}</div>
    <div class="bubble-arrow" :style="{'left': percent * 100 + '%'}"></div>
  </div>
  <div ref="p" class="lytine-progress" :style="{'background-color': percent<0.5 ? bgColor : color, 'height': height + 'px'}">
      <div class="fill-left" :style="{'width': percent<0.5 ? percent*100+'%' : '50%', 'background-color': color}"></div>
      <div class="fill-right" :style="{'width': percent<0.5 ? 0 : (1-percent)*100+'%', 'background-color': bgColor}"></div>
  </div>
</div>
`;

Vue.component('lytine-progress', {
  props: {
    timeStart: {
      type: Number,
      required: true
    },
    timeNow: {
      type: Number,
      default: new Date().getTime()
    },
    timeEnd: {
      type: Number,
      required: true
    },
    progress: {
      type: Number,
      default: 0
    },
    color: {
      type: String,
      default: '#e8e8e8'
    },
    bgColor: {
      type: String,
      default: '#2967cf'
    },
    height: {
      type: Number,
      default: 10
    },
    interval: {
      type: Number,
      default: 1000
    }
  },
  template: LPTemplate,
  data() {
    return {
      percent: 0,
      txt: '',
      now: ''
    }
  },
  computed: {
    bubbleStyle() {
      let style = {};
      let percent = this.percent;
      let dom = this.$refs.txt;
      let offset = 16; // 偏移量
      if (dom) {
        this.$refs.bubble.style.display = 'block';
        let w = dom.offsetWidth;
        let pw = this.$refs.p.offsetWidth;
        if (percent * pw < w / 2 - offset) { // 在左边
          style.left = -offset + 'px';
          style.right = 'auto';
        } else if (pw - percent * pw < w / 2 - offset) {
          style.left = 'auto';
          style.right = -offset + 'px';
        } else {
          style.left = pw * percent - w / 2 + 'px';
          style.right = 'auto';
        }
      }
      return style
    }
  },
  methods: {
    getTimeText() {
      const SMS = 1000;
      const MMS = 60 * SMS;
      const HMS = 60 * MMS;
      const DMS = 24 * HMS;

      let leftTime = this.timeEnd - this.now;
      let days = Math.floor(leftTime / DMS);
      let hours =  Math.floor((leftTime - days * DMS) / HMS);
      let min = Math.floor((leftTime - days * DMS - hours * HMS) / MMS);
      let sec = Math.floor((leftTime - days * DMS - hours * HMS - min * MMS) / SMS);

      return `${days > 0 ? days + '天' : ''}${hours > 0 ? hours + '时' : ''}${min > 0 ? min + '分' : ''}${sec + '秒'}`;
    },
    getPercent() {
      this.now += this.interval;
      if (this.now >= this.timeEnd) {
        return 1;
      }
      return (this.now - this.timeStart) / (this.timeEnd - this.timeStart);
    }
  },
  created() {

  },
  mounted() {
    this.percent = +this.progress;
    this.now = this.timeNow;
    this.txt = this.getTimeText();
    this.percent = this.getPercent();
    const it = setInterval(()=>{
      this.txt = this.getTimeText();
      this.percent = this.getPercent();
      if (this.percent === 1) {
        clearInterval(it);
      }

    }, this.interval)
  }
});
