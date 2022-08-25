import * as AjaxUtils from './AjaxUtils';
import * as AxiosUtils from './AxiosUtils';

function showError(msg){
      AjaxUtils.showError(msg);
}
function showInfo(msg){
      AjaxUtils.showInfo(msg);
}
export function loadData(thisobj,url,pagination, filters, sorter,searchFilters={},callback){
    //在中直接指定参数也可以过滤数据,url?filters={"appId":"test2"}
    let self=thisobj;

    //计算获取过虑条件,因为filters的value是一个数组所以要进行json字符串的转换
    let filtersFields={};
    let filtersStr="";
    Object.keys(filters).forEach(
              function(key){
                if(filters[key]!==undefined){
                  filtersFields[key]=filters[key].join(",");
                }
              }
    );
    //console.log(filtersFields);
    filtersStr=JSON.stringify(filtersFields);
    if(filtersStr==="{}"){filtersStr="";}

    //计算搜索条件
    let searchFiltersStr=JSON.stringify(searchFilters);
    if(searchFiltersStr==='{}'){searchFiltersStr="";}

    //组合排序条件
    let order=sorter.order;
    if(order==="ascend"){order="ASC";}
    else if(order==="descend"){order="DESC";}

    //发送ajax请求
    self.setState({loading:true});
    let queryData={
        pageSize: pagination.pageSize,
        pageNo: pagination.current,
        sort: sorter.field,
        order: order,
        filters:filtersStr,
        searchFilters:searchFiltersStr,
      }
    AjaxUtils.ajax(url,queryData,'get','json','',(data)=>{
      self.setState({loading:false});
      if(data.state===false){
        if(data.msg!==undefined && data.msg!==''){
          showError(data.msg);
        }else{
          showError();
        }
      }else{
        if (typeof callback === "function"){
            callback(data);
        }else{
          pagination.total=data.total; //总数
					self.setState({rowsData:data.rows,pagination:pagination,selectedRows:[],selectedRowKeys:[]});
        }
      }
    });

}

//通过ajax载入可编辑数据的json data
export function loadEditGridData(thisobj,url,callback){
    let self=thisobj;
    self.setState({loading:true});
    AjaxUtils.get(url,(data)=>{
      self.setState({loading:false});
      if(data.state===false){
        if(data.msg!==undefined && data.msg!==''){
          showError(data.msg);
        }else{
          showError();
        }
      }else{
        if (typeof callback === "function"){
            callback(data);
        }else{
            self.setState({data:data});
        }
      }
    });
}

export  function deleteData(thisobj,url,argIds){
  let self=thisobj;
  let ids=argIds;
  const {selectedRowKeys, pagination} = self.state
  if(ids===undefined || ids===""){
    if((selectedRowKeys.length === pagination.total%pagination.pageSize)&&pagination.current) {
      pagination.current = pagination.current-1
     }
     ids = selectedRowKeys.join(",");
  }
  //调用ajax在后端删除数据，前端自动重载一次即可
  self.setState({loading:true});
  let postData={"ids":ids};
  // console.log(postData);
  AjaxUtils.post(url,postData,(data)=>{
    self.setState({loading:false});
    if(data.state===false){
      showError(data.msg);
    }else{
      let num=data.number;
      if(num===undefined){num=data.msg};
      showInfo("成功删除("+num+")条数据!");
      self.state.pagination.current = 1;
      self.loadData();
    }
  });
}

//通过Ajax在后端拷贝数据然后重新载入数据
export  function copyData(thisobj,url,argIds){
    let self=thisobj;
    let ids=argIds;
    if(ids===undefined || ids===""){ids=self.state.selectedRowKeys.join(",");}
    if(ids===""){showError("您没有选中任何行噢?选中后再来点击我吧!");return;}
    //调用ajax在后端copy数据，前端自动重载一次即可
    self.setState({loading:true});
    let postData={"ids":ids};
    AjaxUtils.post(url,postData,(data)=>{
      if(data.state==='false'){
        showError();
        self.setState({loading:false});
      }else{
        showInfo("成功拷贝("+data.number+")条数据!");
        self.loadData();
      }
    });
}

//通过Ajax在后端保存可编辑Grid数据然后重新载入数据
export  function saveEditGridData(thisobj,url,NewAndEditData,DeleteIds=[],appId){
    let self=thisobj;
    let deleteIdsStr=DeleteIds.join(",");
    let postStr={GridData:JSON.stringify(NewAndEditData),DeleteIds:deleteIdsStr,appId:appId};
    self.setState({loading:true});
    // console.log(postStr);
    AjaxUtils.post(url,postStr,(data)=>{
      if(data.state===false){
        if(data.msg!==undefined && data.msg!==''){
          showError(data.msg);
        }else{
          showError();
        }
      }else if(data.state===true){
        showInfo("保存成功");
      }
      self.setState({loading:false});
      self.loadData();
    });
}

export const downloadBlob = (thisobj, url, params, method) => {
  thisobj.setState({ loading: true })
  let download  = method === 'get' ? AxiosUtils.get : AxiosUtils.post
  download(url, params,{responseType:'blob'}).then(() => {
    thisobj.setState({ loading: false })
  })
}