/*
* 接口文档
* http://www.choicelink.cn:8888/help
* */

const PUBLIC_ID =  '1114';
//发送验证码
const SEND_CODE_Url = 'http://www.choicelink.cn:8888/UserApi/Account/GetVerifyCode?publicId=1114';
//提交表单
const ADD_USER_Check_Url = 'http://www.choicelink.cn:8888/UserApi/Account/AddUserCheck?verifycode=';
//阿里云签名
//const GET_SIGN_Url = 'http://www.choicelink.cn:8888/AliOSS/GetSign?dir=1114/';
const GET_SIGN_Url = 'http://newapi.chinapsp.cn/AliOSS/GetSign?dir=1114/';
//阿里云上传host
const HOST = 'http://chinapsp.oss-cn-shenzhen.aliyuncs.com';
//将用户与上传的文件对应绑定
const ADD_USER_File_Url = 'http://www.choicelink.cn:8888/UserApi/Account/AddUserFile';
//平台资质设置
const HONOR_TYPE_URL = 'http://www.choicelink.cn:8888/AgentApi/EProject/PageEHonorType';
