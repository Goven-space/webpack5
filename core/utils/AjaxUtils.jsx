import reqwest from 'reqwest';
import React from 'react';
import {notification,Modal,Icon} from 'antd';
import { browserHistory } from 'react-router'
import * as URI from '../constants/RESTURI';

const confirm = Modal.confirm;
const LISTINFOURL=URI.LIST_APP.sysInfo; //必须有core权限才能读取
const BASELISTINFOURL=URI.CORE_APPBASEDATACATEGORY.sysInfo; //无权限可读取
let environmentTip="";

export function getSystemInfo(callback){
  let self=this;
  self.callback=callback;
  get(LISTINFOURL,(data)=>{
    if(data.state===false){
      showError("没有获取到系统模块信息,请联系我们!");
    }else{
      self.callback(data);
    }
  });
}

export function getEnvironmentInfo() {
  if(environmentTip===''){
    //获取环境名称,这个没有权限的也可以读取
    get(BASELISTINFOURL,(data)=>{
      environmentTip=data.environment;
    });
  }else{
    return environmentTip;
  }
}

export function get(url,callback) {
  ajax(url,'','get','json',null,callback);
}

export function getjson(url,data,callback) {
  ajax(url,data,'get','json',null,callback);
}

export function post(url,data,callback) {
  ajax(url,data,'post','json',null,callback);
}

export function del(url,callback){
  ajax(url,'','delete','json',null,callback);
}

export function put(url,callback) {
  ajax(url,'','put','json',null,callback);
}

export function ajax(url,data,method,type,header,callback) {
  if (typeof callback !== "function"){
      console.log(callback+' not a function!');
      return;
  }
  let identitytoken=getCookie("identitytoken");
  if(header===undefined || header===null || header===''){
    header={};
  }
  header.identitytoken=identitytoken;
  reqwest({
        url: url,
        crossOrigin:true,
        withCredentials: false,
        headers: header,
        method: method,
        type: type,
        timeout: 360000,
        data: data
    }).then((data) => {
      callback(data);
    }).fail(function (err, msg) {
      if(err.status===401){
        console.log("提示:请求服务"+url+"时出现401服务未认证,转向登录界面!");
        browserHistory.push(URI.loginUrl); //用户没有登录,转向登录界面
      }else{
        let data={"state":false,"msg":msg};
        callback(data);
      }
    });
}

export function postBody(url,body,callback) {
  if (typeof callback !== "function"){
      console.log(callback+' not a function!');
      return;
  }
  let identitytoken=getCookie("identitytoken");
  let header={};
  header.identitytoken=identitytoken;
  reqwest({
        url: url,
        crossOrigin:true,
        withCredentials: false,
        headers: header,
        method: 'post',
        contentType: 'application/json;charset=UTF-8',
        type: 'json',
        timeout: 360000,
        data: body
    }).then((data) => {
      callback(data);
    }).fail(function (err, msg) {
      if(err.status===401){
        console.log("提示:请求服务"+url+"时出现401服务未认证,转向登录界面!");
        browserHistory.push(URI.loginUrl); //用户没有登录,转向登录界面
      }else{
        let data={"state":false,"msg":msg};
        callback(data);
      }
    });
}

export function showError(msg){
      let errorMsg=msg||"服务请求失败,请检查服务接口处于可用状态!";
      notification.error({
          message: '操作提示',
          duration: 4,
          description: errorMsg,
      });
}

export function showInfo(msg){
      notification.info({
          message: '操作提示',
          duration: 4,
          description: msg
      });
}

export function showMsg(data){
  if(data.state==false){
    showError(data.msg);
  }else{
    showInfo(data.msg);
  }
}


export function showConfirm(title,content,callback){
  confirm({
    title: title,
    content: content,
    onOk() {
      if(callback){
        callback();
      }
    },
    onCancel() {},
  });
}

export function showHelp(body,title="帮助"){
  notification.open({
    message: title,
    description: body,
  });
};


export function  setCookie(c_name,value,expiredays){
    let exdate=new Date()
    exdate.setDate(exdate.getDate()+expiredays)
    let expires=(expiredays===undefined) ? "" : ";expires="+exdate.toGMTString();
    document.cookie=c_name+ "=" +escape(value)+expires+";path=/";
}

export function getCookie(name){
  let arr;
  let reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
  if(arr=document.cookie.match(reg)){
    return unescape(arr[2]);
  }else{
    return "";
  }
}
export function delCookie(name)
{
  let date=new Date();
  date.setTime(date.getTime()-10000);
  document.cookie=name+"=; expire="+date.toGMTString()+"; path=/";
}

export function logout() {
  let strCookie=document.cookie;
  let arrCookie=strCookie.split("; ");
  for(let i=0;i <arrCookie.length;i++)
  {
    let arr=arrCookie[i].split("=");
    if(arr.length>0){
      if(arr[0]!=='loginUserId'){
        delCookie(arr[0]);
      }
    }
  }

  //如果有logouturl则调用一次用业取消session
  let logoutAPIURL='';
  try{logoutAPIURL=LogouAPIURL;}catch(e){}
  if(logoutAPIURL!==''){
    this.get(logoutAPIURL,(data)=>{
      console.log(data);
    });
  }

  //如果有redirectUrl则直接跳转到这个地址
  let redirectUrl='';
  try{redirectUrl=LogoutRedirectUrl;}catch(e){}
  if(redirectUrl!==''){
    window.location.href=redirectUrl;
  }else{
    browserHistory.push(URI.loginUrl);
  }

}
export function randomString(e) {
  e = e || 32;
  var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
  a = t.length,
  n = "";
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n
}


export function guid() {
    return Number(Math.random().toString().substr(3, 3) + Date.now()).toString(36);
}

export function getUserId(){
  return getCookie("userId");
}

export function addServerHost(serverHost){
  //追加服务器
  let serverList=localStorage.getItem("serverHost") || "";
  if(serverList.indexOf(serverHost)!=-1){return;} //说明已存在直接退出
  let serverListArray=serverList.split(",");
  if(serverListArray.length>10){
    serverListArray.shift();
  }
  serverListArray.push(serverHost);
  localStorage.setItem("serverHost",serverListArray.join(","));
}

export function setCurrentServerHost(serverHost){
  //设置当前服务器
  localStorage.setItem("currentServerHost",serverHost);
}

//检测Id是否有重复值
export function checkExist(rule, value,id,url,callback){
      const fieldName=rule.field;
      if(value===undefined || value===""){
        callback([new Error('不能为空!')]); //显示为验证错误
      }else{
          let postData={id:id,fieldValue:value,fieldName:fieldName};
          post(url,postData,(data)=>{
            if(data.state===true){
               callback([new Error('记录已经存在,请更换其他值!')]);
            }else if(data.state===false){
              callback();//显示为验证成功
            }else{
              callback([new Error('验证服务异常')]);
            }
          });
      }
}

export function formatJsonToHtml(jsonStr){
  jsonStr=this.formatJson(jsonStr);
  return jsonStr.replace(/\n/gi,'<br>').replace(/(    )/gi,'&nbsp;&nbsp;&nbsp;&nbsp;');
}

export function formatJson(txt,compress,bigInt){
        if(txt===undefined){return '';}
        if(txt.length>2){
          let startText=txt.substring(0,1);
          if(startText!=='{' && startText!=='['){return txt;}
        }
        var indentChar = '    ';
        if(/^\s*$/.test(txt)){
            return txt;
        }
        try{
          if(bigInt){
            txt = txt.replace(/":\s*([-+Ee0-9.]{14,})/g, '": "$1"');
          }
          var data=eval('('+txt+')');
        }catch(e){
            return txt;  //可能不是json字符串直接返回
        };
        var draw=[],last=false,This=this,line=compress?'':'\n',nodeCount=0,maxDepth=0;
        var notify=function(name,value,isLast,indent/*缩进*/,formObj){
            nodeCount++;/*节点计数*/
            for (var i=0,tab='';i<indent;i++ )tab+=indentChar;/* 缩进HTML */
            tab=compress?'':tab;/*压缩模式忽略缩进*/
            maxDepth=++indent;/*缩进递增并记录*/
            if(value&&value.constructor===Array){/*处理数组*/
                draw.push(tab+(formObj?('"'+name+'":'):'')+'['+line);/*缩进'[' 然后换行*/
                for (var i=0;i<value.length;i++)
                    notify(i,value[i],i===value.length-1,indent,false);
                draw.push(tab+']'+(isLast?line:(','+line)));/*缩进']'换行,若非尾元素则添加逗号*/
            }else   if(value&&typeof value==='object'){/*处理对象*/
                    draw.push(tab+(formObj?('"'+name+'":'):'')+'{'+line);/*缩进'{' 然后换行*/
                    var len=0,i=0;
                    for(var key in value)len++;
                    for(var key in value)notify(key,value[key],++i===len,indent,true);
                    draw.push(tab+'}'+(isLast?line:(','+line)));/*缩进'}'换行,若非尾元素则添加逗号*/
                }else{
                        if(typeof value==='string')value='"'+value+'"';
                        draw.push(tab+(formObj?('"'+name+'":'):'')+value+(isLast?'':',')+line);
                };
        };
        var isLast=true,indent=0;
        notify('',data,isLast,indent,false);
        return draw.join('');
}

export function getId(length){
    return Number(Math.random().toString().substr(3,length) + Date.now()).toString(36);
}

export function formatXml(xml) {
	var formatted = '';
	var reg = /(>)(<)(\/*)/g;
	xml = xml.replace(reg, '$1\r\n$2$3');
	var pad = 0;
  let xmlArray=xml.split('\r\n');
  xmlArray.forEach((node, index) => {
    var indent = 0;
		if (node.match( /.+<\/\w[^>]*>$/ )) {
			indent = 0;
		} else if (node.match( /^<\/\w/ )) {
			if (pad != 0) {
				pad -= 1;
			}
		} else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
			indent = 1;
		} else {
			indent = 0;
		}
		var padding = '';
		for (var i = 0; i < pad; i++) {
			padding += '  ';
		}
		formatted += padding + node + '\r\n';
		pad += indent;
  });
	return formatted;
}
