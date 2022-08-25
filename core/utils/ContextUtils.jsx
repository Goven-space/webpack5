import * as AjaxUtils from './AjaxUtils';
import * as URI from '../constants/RESTURI.js';
import {message} from 'antd';

//获得用户的信息
export function getContext(callback) {
  let url=URI.CONTEXT.contextUrl;
  AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            message.error(data.msg);
          }else{
            callback(data);
          }
  });
}

//获得系统的权限信息
export function getSystemPermissions(callback) {
  let url=URI.CORE_APPSETTING.getSystemPermissions;
  AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            //message.error(data.msg);
          }else{
            callback(data);
          }
  });
}
