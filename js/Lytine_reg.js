function initSearchBox() {
    let _this = this;
    $(document).bind("click", function (e) {// 鼠标点击空白处，隐藏搜索input　　　
        let target = $(e.target);
        if (target.closest(".toggle-search").length === 0) {
            _this.searchFlag = false;
        }
    });
}

function handleSearch() {
    // 如果输入框未展开则展开输入框
    if (!this.searchFlag) {
        this.searchFlag = true;
        // 因为searchFlag改变会触发DOM渲染，focus必须在DOM渲染完在执行，这里可以用延时执行解决
        // setTimeout("$('#searchInput').focus()", 500);
        //但建议用vue 的 nextTick，即下一帧（渲染结束）再执行
        this.$nextTick(() => {
            $('#searchInput').focus()
        });
    } else {
        // 异步请求
    }
}

//正则验证
function initValid() {
    this.valid = $("#reg_form").validate({
        rules: {
            truename: {
                required: true,
            },
            username: {
                required: true,
            },
            pwd: {
                required: true,
            },
            pwd_again: {
                required: true,
                equalTo: "#pwd"
            },
            company: {
                required: true,
            },
            companyOrCertCode: {
                required: true,
            },
            phone: {
                required: true,
                minlength: 11,
                isMobile: true
            },
            email: {
                required: true,
                isEmail: true
            },
            work_phone: {
                required: true,
            },

        },
        messages: {
            truename: {
                required: "请输入真实姓名",
            },
            username: {
                required: "请输入用户名",
            },
            pwd: {
                required: "请输入密码",
            },
            pwd_again: {
                required: "请再次输入密码",
                equalTo: "两次密码输入不一致"
            },
            company: {
                required: "请输入单位名称",
            },
            companyOrCertCode: {
                required: "请输入代码",
            },
            phone: {
                required: "请输入手机号",
                minlength: "手机不能小于11个字符",
                isMobile: "请正确填写手机号码",
            },
            email: {
                required: "请输入邮箱",
            },
            work_phone: {
                required: "请输入办公电话",
            },
        },
        errorPlacement: function (error, element) {
            error.appendTo(element.next());
        }
    })
    $.validator.addMethod("isMobile", function (value, element) {
        value = $.trim(value);//去掉两端的空格
        let length = value.length;
        let mobile = /^(13[0-9]{9})|(18[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(15[0-9]{9})$/;
        return this.optional(element) || (length === 11 && mobile.test(value));
    }, "请正确填写您的手机号码");
    $.validator.addMethod("isEmail", function (value, element) {
        return this.optional(element) || /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(value);
    }, "请输入一个正确的邮箱");
}

//文件随机后缀名
function random_string(len) {
    len = len || 32;
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

//获取文件后缀名
function get_suffix(filename) {
    pos = filename.lastIndexOf('.');
    suffix = '';
    if (pos != -1) {
        suffix = filename.substring(pos)
    }
    return suffix;
}

//上传
function uploadBeforeSend(obj, data, headers) {
    //传入 表单参数
    $.ajax({
        type: "get",
        url: GET_SIGN_Url,
        //timeout: 10000,
        success: function (resp) {
            console.log('打印签名')
            console.log(resp)
            if (resp) {
                let s = {
                    key: resp.dir + "/" + random_string(10) + get_suffix(data.name),
                    OSSAccessKeyId: resp.accessid,
                    policy: resp.policy,
                    signature: resp.signature,
                    success_action_status: '200',
                    callback: resp.callback,
                    'x:fileType': "7",
                    'x:displayname': data.name,
                    'x:objectIdType': PUBLIC_ID,
                    'x:objectId': 'false',
                };
                data = $.extend(data, s);
                data.type = '*/*';
            } else {
                alert("结果为空");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("您的文件上传失败，请联系管理员解决");
        },
        complete: function (XMLHttpRequest, status) { //请求完成后最终执行参数
            if (status === 'timeout') {
                alert('请求超时，请稍后再试！');
            }
        },
        async: false
    });
}

// TODO
// 加载资质
function loadHonorTypes() {
    let _this = this;
    axios({
        url: `${HONOR_TYPE_URL}?page=1&rows=100&Usage=2&PublicId=${PUBLIC_ID}`
    }).then(resp => {
        _this.honorTypes = resp.data.rows || [];
        _this.$nextTick(_ => {
            _this.createUploaders();
        });
    })
}

// TODO
function createUploaders() {
    let _this = this;
    _this.honorTypes.forEach((h, i) => {
        _this.uploaders.push(new FileUploader({
            el: `#uploader-${i}`,
            server: HOST,
            fileSizeLimit: 1024 * 1024 * 100,
            fileNumLimit: 100,
            tips: '支持文件类型：jpg, jpeg, png, tiff, bmp, doc, docx, pdf, zip, 7z',
            acceptExtensions: ['jpg', 'jpeg', 'bmp', 'png', 'tiff', 'doc', 'docx', 'pdf', 'rar', 'zip', '7z'],
            uploadBeforeSend: uploadBeforeSend,
            showUploadBtn: true,
            duplicateHandler: function (code) {
                console.error("请勿重复选择文件");
            },
            exceedSizeHandler: function (code) {
                console.error("所选附件总大小不可超过" + this.fileSizeLimit / 1024 + "Kb");
            },
            exceedNumHandler: function (code) {
                console.error("最多允许上传" + this.fileNumLimit + "张图片");
            },
            typeDeniedHandler: function (code) {
                console.error("不支持的文件格式");
            },
            defaultErrorHandler: function (code) {
                console.error("Something Wrong");
            }
        }));
    })
}


//获取手机验证码
function sendVCode() {
    let _this = this;
    if (!$("#reg_form").validate().element($('input[name = phone]'))) {
        return;
    }
    if (!_this.vCode.disabled) {
        _this.vCode.disabled = true;
        let leftTime = 60;
        let iId = setInterval(() => {
            if (leftTime === 0) {
                clearInterval(iId);
                _this.vCode.disabled = false;
                _this.vCode.btnTips = '发送验证码';
                return;
            }
            leftTime--;
            _this.vCode.btnTips = `${leftTime}秒后重发`;
        }, 1000);
        axios({
            url: SEND_CODE_Url + `&mobileCode=` + _this.formData.mobile,
            method: 'post',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        }).then(function (resp) {
            if (resp.status !== 200) {
                clearInterval(iId);
                _this.vCode.btnTips = '发送验证码';
                _this.vCode.disabled = false;
            }
        }).catch((err) => {
            console.log(err);
        });
    }
}

// TODO addUserFile
function addUserFile() {
    let _this = this;
    let files = [];
    _this.uploaders.forEach((u, i) => {
        u.responses.forEach((item) => {
            files.push({
                UserCheckId: app.userId,
                FileName: item.oss.DisplayName,
                FileId: item.id,
                PublicId: PUBLIC_ID,
                TypeId: _this.honorTypes[i].Id,
            });
        })
    });
    _this.disabled = true; //防止用户重复提交表单信息
    axios({
        url: ADD_USER_File_Url,
        method: 'post',
        headers: {
            'content-type': 'application/json'
        },
        data: files,
    }).then((resp) => {
        alert("您已注册成功，请耐心等待管理员审核");
        window.location.reload();
    })
}

//立即注册-表单提交
function regUser() {
    let _this = this;
    if (!_this.valid.form()) {
        return;
    }
    //供应商注册前必须上传文件，采购人不用
    if (_this.roleType === '3034e1e3-f2af-423c-8a8b-7a19e77f9e45') {
        for (let i = 0; i < _this.uploaders.length; i++) {
            let u = _this.uploaders[i];
            if (u.successCount !== u.totalCount || u.totalCount === 0) {
                alert("请完成文件上传，确认是否已点击上传按钮");
                return;
            }
        }
    }
    axios({
        // url: "http://www.choicelink.cn:8888/UserApi/Account/AddUserCheck?verifycode=" + _this.formData.verifycode,
        url: ADD_USER_Check_Url + _this.formData.verifycode,
        method: 'post',
        headers: {
            'content-type': 'application/json; charset=utf-8'
        },
        data: {
            role: _this.roleType,
            certificate: _this.certType,//证件类型：0为统一信用代码，1为组织结构代码
            truename: _this.formData.truename,
            username: _this.formData.username,
            password: _this.formData.password,
            company: _this.formData.company,
            companyCode: _this.formData.companyOrCertCode,
            mobile: $.trim(_this.formData.mobile),//去掉左右两边的空格
            email: _this.formData.email,
            work_phone: _this.formData.work_phone,
            publicId: PUBLIC_ID,
        },
    }).then((resp) => {
        let state = resp.data.state;
        _this.userId = resp.data.userId;
        if (state == 0) {
            _this.addUserFile();
        } else if (state * 1 == 105) {
            alert("该公司名已注册尚未审核，请勿重新注册");
        } else if (state * 1 == 104) {
            alert("该公司名已通过注册，请勿重新注册");
        } else if (state == 103) {
            alert("该用户已经被注册\n请重新注册");
        } else if (state == 102) {
            alert("验证码有误\n请重新填写");
            _this.formData.certificate = '';
        } else if (state == 101) {
            alert("验证码失效\n请重新获取");
            _this.formData.certificate = '';
        }
    }).catch((err) => {
        console.log(err)
    });
}

function created() {
    this.initSearchBox();
    this.$nextTick(initValid);
    this.loadHonorTypes(); // TODO
}

function mounted() {
    // this.initUploader();
}

const app = new Vue({
    el: "#reg-app",
    data: {
        failureUploadCount: 0,
        searchFlag: false,
        headSearchTxt: '',
        valid: {},
        certType: 1,
        roleType: '3034e1e3-f2af-423c-8a8b-7a19e77f9e45', // 0: 采购人 1: 供应商
        userId: '',
        businessLicensesId: [],//
        vCode: {
            btnTips: "发送验证码",
            disabled: false
        },
        formData: {
            truename: '',//联系人姓名
            username: '',//用户名
            password: '',//密码
            password_again: '',

            company: '',//单位名称
            companyOrCertCode: '',//组织机构代码
            mobile: '',//手机
            verifycode: '',
            email: '',
            work_phone: ''//办公电话
        },
        uploaders: [], // TODO
        honorTypes: [], // TODO
        disabled: false,//提交按钮禁用初始化
    },
    methods: {
        handleSearch,
        initSearchBox,
        regUser,
        uploadBeforeSend,
        sendVCode,
        initValid,
        loadHonorTypes, // TODO
        createUploaders, // TODO
        addUserFile // TODO
    },
    mounted: mounted,
    created: created
});
