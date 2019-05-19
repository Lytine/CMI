window.onload = function () {
    initSwiper();
};

function initSwiper() {
    new Swiper('.swiper-container', {
        loop: true, // 循环模式选项
        autoplay: {
            delay: 2000,
            stopOnLastSlide: false,
            disableOnInteraction: true,
        },
        pagination: { // 如果需要分页器
            el: '.swiper-pagination',
            type: 'custom',
            clickable: true,
            renderCustom: function (swiper, current, total) {
                let customPaginationHtml = "";
                for (let i = 0; i < total; i++) {
                    //判断哪个分页器此刻应该被激活
                    if (i === (current - 1)) {
                        customPaginationHtml += '<img src="img/pagination-red.png" class="swiper-pagination-customs" />';
                    } else {
                        customPaginationHtml += '<img src="img/pagination-white.png" class="swiper-pagination-customs" />';
                    }
                }
                return customPaginationHtml;
            }
        }
    });

}
