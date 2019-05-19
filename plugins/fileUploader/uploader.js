function FileUploader(option) {
    let _this = this;

    // 参数初始化设置 start
    _this.id = Math.random().toString(36).substr(6);
    _this.server = option.server; // 文件接收服务端。
    _this.el = option.el; // 文件接收服务端。
    _this.resize = true; // 不压缩, 默认如果是jpeg，文件上传前会压缩再上传
    _this.acceptExtensions = option.acceptExtensions || '';
    _this.accept = { // 只允许选择文件。
        title: 'doc',
        extensions: _this.acceptExtensions.join(','),
        mimeTypes: '*/*'
    };
    _this.uploadBeforeSend = option.uploadBeforeSend;
    _this.data = option.data; //暴露了data属性，用于添加额外的请求参数
    _this.tips = option.tips || '';
    _this.fileSizeLimit = option.fileSizeLimit || 0;
    _this.fileNumLimit = option.fileNumLimit || 0;
    _this.duplicateHandler = option.duplicateHandler;
    _this.exceedSizeHandler = option.exceedSizeHandler;
    _this.exceedNumHandler = option.exceedNumHandler;
    _this.typeDeniedHandler = option.typeDeniedHandler;
    _this.defaultErrorHandler = option.defaultErrorHandler;
    _this.responses = [];
    _this.showUploadBtn = option.showUploadBtn !== false;
    _this.totalCount = 0;
    _this.successCount = 0;
    _this.failureCount = 0;
    _this.onSuccess = option.onSuccess;
    _this.onComplete = option.onComplete;
    _this.onRemove = option.onRemove;
    // 参数初始化设置 end

    _this.state = 'pedding'; // 可能有pedding, ready, uploading, confirm, done.

    // webUploader配置参数
    let _option = {
        swf: 'webUploader/webuploader-0.1.5/Uploader.swf',
        server: _this.server,
        resize: _this.resize,
        accept: _this.accept,
        fileSizeLimit: _this.fileSizeLimit,
        fileNumLimit: _this.fileNumLimit
    };

    // 检查必须配置项
    if (!_this.el) {
        console.error('请设置el属性,通常为元素id选择器');
        return;
    }
    if (!_this.server) {
        console.error('请设置server属性(文件上传请求URL)');
        return
    }

    // 实例id作为元素id后缀
    let pickId = 'picker-' + _this.id;
    _option.pick = '#' + pickId;
    _this.pick = _option.pick;
    let fileListId = 'file-list-' + _this.id;
    _option.fileList = '#' + fileListId;
    _this.fileList = _option.fileList;
    let uploadBtnId = 'upload-btn-' + _this.id;

    // DOM渲染
    let uploaderTemplate =
        `<div class="file-uploader-wrapper">
        
        <div><span class="file-upload-tips">${_this.tips}</span></div>
        <div id="${fileListId}" class="file-uploader-list">
        <div id="${pickId}" class="file-file-picker">
              <div></div>
        </div> 
        <div style="display: ${_this.showUploadBtn ? 'block':'none'}">
          <button type="button" id="${uploadBtnId}" class="file-upload-btn">上传</button>
        </div> 
          
        </div>
      </div>`;
    $(option.el).html(uploaderTemplate);

    // 创建实例
    let uploader = WebUploader.create(_option);
    _this.uploader = uploader;

    // 优化retina, 在retina下这个值是2
    let ratio = window.devicePixelRatio || 1;
    // 缩略图大小
    let thumbnailWidth = 100 * ratio;
    let thumbnailHeight = 100 * ratio;

    // 当有文件添加进来的时候
    uploader.on('fileQueued', function (file) {
        //'<div class="info">' + file.name + '</div>' +
        let $li = $(
            `<div id="${file.id}" class="file-file-item">
            <span>${file.name}</span>
            <div id="rm-btn-${file.id}" class="file-rm-btn-wrapper"></div>
            <div id="retry-btn-${file.id}" class="file-retry-btn-wrapper"></div>
            <div class="file-progress-wrapper">
            </div>
        </div>`
        );
        // let $img = $li.find('img');
        // $list为容器jQuery实例
        let $list = $(_option.fileList);
        $list.prepend($li);
        $('#rm-btn-' + file.id).on('click', function () {
            removeFile(file);
        });
        $('#retry-btn-' + file.id).on('click', function () {
            let $percent = $li.find('.file-progress-wrapper');
            $percent.find('.file-progress').css('width', 0);
            $percent.find('.file-progress').css('background-color', '#4a90e2');
            $li.find('.file-retry-btn-wrapper').css('display', 'none');
            uploader.retry(file);
        });
        _this.totalCount += 1;
        _this.state = 'ready';
    });

    uploader.on('uploadBeforeSend', function (obj, data, headers) {
        data = $.extend(data, _this.data);//暴露了data属性，用于添加额外的请求参数
        if (_this.uploadBeforeSend) {
            _this.uploadBeforeSend(obj, data, headers)
        }
    });

    // 移除文件
    function removeFile(file) {
        let $li = $('#' + file.id);
        _this.totalCount -= 1;
        if (file.getStatus() === 'error') {
            _this.failureCount -= 1;
        }
        if (_this.onRemove) {
            _this.onRemove();
        }
        uploader.removeFile(file);
        $li.remove(); // 从视图移除
    }

    // 文件上传过程中创建进度条实时显示。
    uploader.on('uploadProgress', function (file, percentage) {
        let $li = $('#' + file.id);
        let $percent = $li.find('.file-progress-wrapper');
        if (!$percent.children().length) {
            $percent.append($(`
            <div class="file-progress file-progress-uploading"></div> 
          `));
        }
        $percent.find('.file-progress').css('width', percentage * 100 + '%');

    })

    // 监听上传成功事件
    uploader.on('uploadSuccess', function (file, response) {
        // console.log(file.id + " OK");
        _this.successCount += 1;
        _this.responses.push(response);
        let $li = $('#' + file.id);
        let $percent = $li.find('.file-progress-wrapper');
        $percent.css('background-color', '#0000');
        $percent.find('.file-progress').css('width', 0);
        $li.find(`#rm-btn-${file.id}`).css('position', 'relative');
        $li.find(`#rm-btn-${file.id}`).css('top', '1px');
        if(_this.onSuccess && _this.successCount === _this.totalCount) {
            _this.onSuccess();
        }
    });

    uploader.on('uploadError', function (file, reason) {
        console.log(file.id + " Error");
        let $li = $('#' + file.id);
        $li.find('.file-retry-btn').on('click', () => {
            $li.find('.file-thumb-mask-retry').css('display', 'none');
            _this.failureCount -= 1;
            uploader.retry(file);
        });
        _this.failureCount += 1;
        $li.find('.file-retry-btn-wrapper').css('display', 'inline-block');
        let $percent = $li.find('.file-progress-wrapper');
        $percent.find('.file-progress').css('background-color', '#ff5500');
    });

    uploader.on('uploadComplete', function (file) {
        if (_this.onComplete && _this.failureCount + _this.successCount === _this.totalCount) {
            _this.onComplete();
        }
    });

    //错误提示
    uploader.onError = function (code) {
        if (code === "F_DUPLICATE") {
            if (_this.duplicateHandler) {
                _this.duplicateHandler();
            } else {
                alert("请勿重复选择文件");
            }
        } else if (code === "Q_EXCEED_SIZE_LIMIT") {
            if (_this.exceedSizeHandler) {
                _this.exceedSizeHandler();
            } else {
                alert("所选附件总大小不可超过" + _this.fileSizeLimit / 1024 / 1024 + "M");
            }
        } else if (code === "Q_EXCEED_NUM_LIMIT") {
            if (_this.exceedNumHandler) {
                _this.exceedNumHandler();
            } else {
                alert("最多同时上传" + _this.fileNumLimit + "张图片");
            }
        } else if (code === "Q_TYPE_DENIED") {
            if (_this.typeDeniedHandler) {
                _this.typeDeniedHandler();
            } else {
                alert("不支持的文件格式");
            }
        } else {
            if (_this.defaultErrorHandler) {
                _this.defaultErrorHandler();
            } else {
                alert('Error: ' + code);
            }
        }
    };

    // 点击按钮上传文件
    function doUpload() {
        if (_this.state === 'ready') {
            uploader.upload();
        } else if (_this.state === 'paused') {
            uploader.upload();
        } else if (_this.state === 'uploading') {
            uploader.stop();
        }
    }
    _this.upload = doUpload;
    let $upload = $('#' + uploadBtnId);
    $upload.unbind("click");
    $upload.on('click', function () {
        if ($(this).hasClass('disabled')) {
            return false;
        }
        doUpload();
    });
}

