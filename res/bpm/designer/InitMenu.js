var goalTreeData=[];
layui.use('element', function(){
  var token=getCookie("identitytoken");
  var url=parent.host+"/bpm/process/node/template/list/select";
  $.ajax({
    beforeSend: function(request) {
      request.setRequestHeader("identitytoken", token); //在http头中增加token头
    },
    url:url,
    type: "get",
    success: function (data) {
      goalTreeData=data;
      createNode(data);
    }
  });
});

//搜索节点
function searchProcessNode(value){
  if(value==''){createNode(goalTreeData);return;}
  let resultData=[];
  for(var i=0;i<goalTreeData.length;i++){
    var subNode=goalTreeData[i].children;
    var searchedNodeItems=[];
    for(var x=0;x<subNode.length;x++){
      var nodeName=subNode[x].nodeName;
      if(nodeName.indexOf(value)!=-1){
        searchedNodeItems.push(subNode[x]);
      }
    }
    if(searchedNodeItems.length>0){
      let searchedRootNodeItem={parentNodeId: "root", key: goalTreeData[i].key, nodeName: goalTreeData[i].nodeName,children:searchedNodeItems};
      resultData.push(searchedRootNodeItem);
    }
  }
  createNode(resultData); //重新创建节点
}

//创建左则节点菜单
function createNode(data){
  $("#processNodeList").html("");
  for(var i=0;i<data.length;i++){
    var rootNode=data[i];
    var showContent=i==0?"layui-show":"";
    var rootNodeName=rootNode.nodeName;
    var rootKey=rootNode.key;
    var subNode=rootNode.children;
    var rootHtml='<div class="layui-colla-item" ><h2 class="layui-colla-title">'+rootNodeName+'<span class="layui-badge-rim" style="float:right;margin-top:12px">'+subNode.length+'</span></h2><div class="layui-colla-content '+showContent+'" id="'+rootKey+'" >';
    var subNodeHtml="";
    for(var x=0;x<subNode.length;x++){
      var nodeType=subNode[x].nodeType;
      var nodeName=subNode[x].nodeName;
      var templateId=subNode[x].templateId;
      var className=subNode[x].class;
      let nodeIcon="node.png";
      if(nodeType=='start'){nodeIcon='start.png';}
      if(nodeType=='end'){nodeIcon='end.png';}
      subNodeHtml+='<div class="controler" onmousedown="startNode(\''+nodeType+'\',\''+templateId+'\',\''+nodeName+'\',\''+className+'\')"><img src="../images/'+nodeIcon+'" height="20px" > '+nodeName+'</div>';
    }
    rootHtml+=subNodeHtml+"</div></div>";
    $("#processNodeList").append(rootHtml);
  }
  var element = layui.element;
  element.render();
  canDrag();
}

function getCookie(name){
  let arr;
  let reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
  if(arr=document.cookie.match(reg)){
  return unescape(arr[2]);
  }else{
  return "";
  }
}

function startNode(nodeType,templateId,nodeName,className){
  window.GoalNewNodeType=nodeType;
  window.GoalNodeTemplateId=templateId;
  window.GoalNodeName=nodeName;
}

function canDrag(){
  //设置为可拖动
  $(".controler").draggable({
    opacity: 50,
    helper: 'clone',
    scope: 'node',
    revert: 'invalid',
  });
}
