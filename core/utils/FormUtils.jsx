import * as AjaxUtils from './AjaxUtils';
import * as URI from '../constants/RESTURI.js';
import {message} from 'antd';
const SerailNumberUrl=URI.CORE_SERIALNUMBER.getNewSerialNumber;

export function loadForm(url,thisobj) {
    AjaxUtils.get(url,(data)=>{
      if(data.state===false){
        message.error(data.msg);
      }else{
        thisobj.setState({formData:data,mask:false});
        setFormFieldValues(thisobj.props.form,data);
      }
    });
}

export function submitForm(thisobj,postData,url,callback) {
    AjaxUtils.post(url,postData,callback);
}

//根据主文档id列出所有附件
export function getFiles(parentDocId,callback){
  let url=URI.CORE_FILE.listFiles.replace("{id}",parentDocId);
  AjaxUtils.get(url,(data)=>{
      if(data.state===false){
        AjaxUtils.showError("附件读取失败,请检查服务接口处于可用状态!");
      }else{
        let fileList = data.map((file) => {
          file.uid=file.id;
          file.url = URI.baseResUrl+file.filePath;
          file.name=file.fileName;
          return file;
        });
        callback(fileList);
      }
  });
}

//获取一个新的流水号
export function getSerialNumber(form,fieldName,appId,type){
  let url=SerailNumberUrl+"?appId="+appId+"&type="+type;
  AjaxUtils.get(url,(data)=>{
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        let fdData={};
        fdData[fieldName]=data.serialNumber;
        form.setFieldsValue(fdData);
      }
  });
}

//指定要设置的字段值
export function setFormFieldItemValues(form,data){
  form.setFieldsValue(data);
}

//排除不存在的字段进行批量设置
export function setFormFieldValues(form,data){
  let allFormFieldsValue=form.getFieldsValue();
  for(var itemName in allFormFieldsValue){
    if(data[itemName]!=undefined){
      allFormFieldsValue[itemName]=data[itemName];
    }
  }
  // console.log(allFormFieldsValue);
  form.setFieldsValue(allFormFieldsValue);
}
