import { Alert, Button, Collapse, Icon, Input, Modal, Popover, Radio, Tabs, Popconfirm, Switch, Tooltip, Row, Col } from "antd";
import React from "react";
import * as URI from '../../../core/constants/RESTURI';
import CodeMirror from 'react-codemirror';
import ApiNodeLinkerConfig from "./components/ApiNodeLinkerConfig";
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import BasicAttributes from './components/BasicAttributes'
import TimeoutSetting from './components/TimeoutSetting'
import OutputVariable from './components/OutputVariable'
import Assert from './components/Assert'

const CONFIG_LIST_URL = URI.CONNECTOR_CONFIG.list;
const CONFIG_SAVE_URL = URI.CONNECTOR_CONFIG.save;
const CONFIG_GET_URL = URI.CONNECTOR_CONFIG.getById;
const CONFIG_DELETE_URL =URI.CONNECTOR_CONFIG.delete;
const CONFIG_FORM_URL = URI.CORE_GATEWAY_SECURITY.list;

// 保存ESB节点
const PropsUrl=URI.ETL.PROCESSNODE.props;
const SubmitUrl=URI.ETL.PROCESSNODE.save; //存盘地址


class AppFlowNode extends React.Component {
    constructor(props) {
        super(props);
        this.nodeObj = this.props.nodeObj,
        this.templateId = this.nodeObj.templateId,
        this.processId = this.props.processId,
            this.appId = this.props.appId,
            this.title = '',
            this.state = {
                postData: {},
                opts: this.props.opts,
                appType: this.props.appType,
                appName: this.props.appName,
                isActive: false,
                visible: false,
                createVisible: false,
                viewVisible: false,
                haveConfigItemFlag: false,
                title: '',
                selectedId: '',
                configList: [],
                configFormList: [],
                configName: '',
                currentConfigName: '',
                configId: '',
                editorMode: false,
                requestBody: "{}",
                errorTips: false,
            };
    }

    componentDidMount() {
        this.loadNodePropsData();
    }

    loadNodePropsData = () => {
        let templateId = this.templateId ? this.templateId : '';
        if (this.props.nodeObj.key) {
            let url = PropsUrl + "?processId=" + this.processId + "&nodeId=" + this.nodeObj.key + "&templateId=" + templateId;
            this.setState({ mask: true });
            AjaxUtils.get(url, (data) => {
                this.setState({ mask: false });
                if (JSON.stringify(data) !== '{}') {
                    this.editHandle(data);
                    this.listConfigItem(data.appType);
                }
            });
        } else {
            this.listConfigItem(this.state.appType);
        }

    }

    /**
     * 编辑时获取数据
     * @param {*} data 
     */
    editHandle = (data) => {
        const { configId, appType, currentConfigName, inParams, connectTimeout, apiUrl, apiId, configName, methodType, requestBodyFlag, customParamFlag, requestBody } = data;
        let opts = {
            configName: configName,
            methodType: methodType,
            mapUrl: apiUrl, id: apiId,
            backendConnectTimeout: connectTimeout,
            requestBodyFlag: requestBodyFlag
        };
        if (inParams) {
            opts.paramsDocs = JSON.parse(inParams);
        }
        let requestBodyStr='';
        if(requestBody === undefined){
            requestBodyStr = "{}"
            
        }else{
            requestBodyStr = AjaxUtils.formatJson(requestBody).trim();
        }
        this.setState({
            configId: configId,
            appType: appType,
            currentConfigName: currentConfigName,
            opts: opts,
            requestBody:requestBodyStr
        })
        if (customParamFlag !== "undefined") {
            if (customParamFlag === 'false') {
                this.setState({ editorMode: false })
            } else {
                this.setState({ editorMode: true })
            }

        }
    }

    /**
     * 根据连接器类型获取配置项列表
     */
    listConfigItem = (appType) => {
        let url = CONFIG_LIST_URL + "?configType=" + appType;
        AjaxUtils.get(url, data => {
            if (data && data.length > 0) {
                this.setState({
                    haveConfigItemFlag: true,
                    configList: data
                });
            } else {
                this.setState({
                    haveConfigItemFlag: false,
                    configList: data,
                    currentConfigName: ''
                });
            }
        });
    }

    changeLinker = () => { };

    handleVisibleChange = visible => {
        this.setState({ visible });
    };

    submit = () => {
        this.saveNode();
    }

    /**
     * 节点保存
     */
    saveNode = () => {
        let postData = {};
        const { configName, methodType, mapUrl, id, backendConnectTimeout, requestBodyFlag, paramsDocs } = this.state.opts;
        const {currentConfigName,configId,appName,requestBody,editorMode } = this.state;
        postData.pNodeType = this.nodeObj.nodeType;
        postData.inParams = JSON.stringify(paramsDocs);
        if (this.refs.nodeLinkerConfig) {
            const paramsData = this.refs.nodeLinkerConfig.getData();
            paramsData.forEach(item => {
                item.paramsId = item.fieldId,
                    item.paramsValue = item.defaultValue,
                    item.paramsType = item.fieldType,
                    item.paramsRule = item.fieldRule
            });
            postData.inParams = JSON.stringify(paramsData);
        }
        let pNodeName = appName + " | " + configName;
        let pNodeType = this.nodeObj.nodeType;
        let pNodeId = this.nodeObj.key;
        if (pNodeId === undefined) {
            const { refObj, linkerOpts } = this.props;
            pNodeId = refObj.refs.iframe.contentWindow.createNewNode(linkerOpts.type, linkerOpts.position);
            pNodeType = 'dataConnectorNode';
        }
        postData.pNodeName = pNodeName;
        postData.pNodeType = pNodeType;
        postData.pNodeId = pNodeId;
        postData.currentConfigName = currentConfigName;
        postData.appId = this.appId;
        postData.processId = this.processId;
        postData.configId = configId;
        postData.configName = configName
        postData.methodType = methodType
        postData.apiUrl = mapUrl;
        postData.apiId = id;
        postData.requestBodyFlag = requestBodyFlag;
        postData.appType = this.state.appType;
        postData.connectTimeout = backendConnectTimeout;
        if(requestBody === "" || !editorMode){
            this.state.requestBody="{}"
        }
        postData.requestBody = requestBody;
        postData.customParamFlag = editorMode
        // 断言失败时 默认终止流程
        postData.assertAction = 1
        postData.dataFormat = 'JSON'

        // const basicValue = this.refs.basic.getFieldsValue(); // 基本属性表单值
        
        // const timeoutValue = this.refs.basic.getFieldsValue(); // 超时设置表单值

        // const outputValue = this.refs.output.getData(); // 输出变量值

        // const assertValue = this.assertForm.getData(); // 断言值

        this.setState({ mask: true });
        AjaxUtils.post(SubmitUrl, postData, (data) => {
            if (data.state === false) {
                AjaxUtils.showError(data.msg);
            } else {
                this.setState({ mask: false });
                AjaxUtils.showInfo("保存成功！");
                this.props.close()
            }
        });
    }

    /**
     * 连接器连接配置查看
     * @param {*} id 连接配置ID
     */
    getConfigItem = (id, configFormList) => {
        let url = CONFIG_GET_URL + "?id=" + id;
        AjaxUtils.get(url, (data) => {
            let configObj = JSON.parse(data.configBody)
            configFormList.forEach((item) => {
                if (configObj[item.fieldId]) {
                    item.fieldValue = configObj[item.fieldId];
                }
            })
            this.setState({
                configFormList: configFormList,
                configName: data.configName
            })
        });
    }

    editConfigItem = (id) => {
        this.setState({ createVisible: true, title: "修改连接配置", selectedId: id })
        this.getConfigForm(id);
        this.setState({ visible: false })
    }


    /**
     * 获取连接器连接配置的配置项表单
     */
    getConfigForm = (id) => {
        let configFormList = [];
        let url = CONFIG_FORM_URL + "?appId=" + this.state.appType + "&securityType=11";
        AjaxUtils.get(url, data => {
            if (data && data.rows.length > 0) {
                let formListStr = data.rows[0].authProperty;
                configFormList = JSON.parse(formListStr);
                this.setState({
                    configFormList: configFormList,
                });
            }
            if (id) {
                this.getConfigItem(id, configFormList);
            }
        });

    }

    checkConfigItemDetail = (id) => {
        this.getConfigForm(id);
        this.setState({ viewVisible: true })
    }


    addConfigForm = () => {
        this.getConfigForm();
        this.setState({
            createVisible: true,
            visible:false,
            configName: '',
            title: '',
            selectedId: ''
        });
    }


    /**
     * 保存连接器连接配置
     */
    configFormSubmit = (id) => {
        let postBody = {}
        if (id) {
            postBody.id = id;
        }
        const { configName, appType } = this.state;
        postBody.configName = configName;
        postBody.configType = appType;
        let configBody = {}
        let running = true

        this.state.configFormList.forEach((item) => {
            if(!item.fieldValue){
                running = false
            }
            configBody[item.fieldId] = item.fieldValue;
        })
        if(!running || !configName){
            this.setState({errorTips: true});
            return false;
        }
        postBody.configBody = JSON.stringify(configBody);
        this.setState({ loading: true });
        AjaxUtils.post(CONFIG_SAVE_URL, postBody, (data) => {
            this.setState({ loading: false });
            if (data.state === false) {
                AjaxUtils.showError(data.msg);
            } else {
                AjaxUtils.showInfo(data.msg);
                this.setState({
                    createVisible: false,
                    errorTips: false
                });
                this.listConfigItem(appType);
            }
        });
    }

    setConfigFormValue = (value, index) => {
        const data = [...this.state.configFormList]
        data[index].fieldValue = value;
        this.setState({
            configFormList: data
        })
    }

    setCurrentConfigItem = (value) => {
        this.setState({ configId: value })
    }

    saveCurrentConfigItem = () => {
        let configName = '';
        this.state.configList.forEach((item) => {
            if (item.id === this.state.configId) {
                configName = item.configName;
            }
        })
        this.setState({
            currentConfigName: configName,
            visible: false
        })
    }

    /**
     * 删除连接器连接配置项
     * @param {*} id 
     */
    deleteConfigForm = (id) => {
        AjaxUtils.post(CONFIG_DELETE_URL, { id }, (data) => {
            if (data.state === false) {
                AjaxUtils.showError(data.msg);
            } else {
                this.setState({ mask: false });
                this.listConfigItem(this.state.appType);
                AjaxUtils.showInfo(data.msg);
            }
        });
    }

    /**
     * 输入参数文本与表单切换
     * @param {*} checked 
     */
    onCheckedChange = (checked) => {
        this.setState(({ editorMode: checked }))
    }


    /**
     * requestBody保存
     * @param {*} newCode 
     */
    updateRequestBodyCode = (newCode) => {
            this.setState({
            requestBody: newCode
        }) /**/
    }

    /**
     * 格式化code
     * @param {*} value 
     */
    formatRequestBodyJsonStr = (value) => {
        value = AjaxUtils.formatJson(value).trim();
        let codeMirror = this.refs.requestBodyCodeMirror.getCodeMirror();
        codeMirror.setValue(value);
        this.setState({
            requestBody:value
        }) /* */
    }

    render() {
        const { opts, appName, configId, createVisible, viewVisible, configFormList, configList, currentConfigName, haveConfigItemFlag, configName, selectedId, title, editorMode, requestBody, errorTips } = this.state;
        const radioStyle = {
            display: 'flex',
            height: '30px',
            lineHeight: '30px',
            alignItems: 'center'
        };
        const content = (
            <div>
                <Radio.Group onChange={(e) => this.setCurrentConfigItem(e.target.value)} value={this.state.configId}>
                    {configList.map((item, index) => (
                        <Radio className="select-radio" style={radioStyle} value={item.id} key={index}>
                            <span title={item.configName}>
                                {item.configName}
                            </span>
                            <span>
                                <Button type="link" onClick={() => this.editConfigItem(item.id)}>编辑</Button>
                                <Popconfirm
                                    title="确认删除吗？"
                                    onConfirm={() => this.deleteConfigForm(item.id)}
                                    okText="确认"
                                    cancelText="取消"
                                    placement="topRight"
                                    overlayStyle={{
                                        width: 200
                                    }}
                                >
                                    <Button type="link">删除</Button>
                                </Popconfirm>

                            </span>
                        </Radio>
                    ))}
                </Radio.Group>
                <div>
                    <Button type="link" onClick={this.addConfigForm}>新建连接器配置</Button>
                </div>
                <div>
                    <Button type="primary" onClick={this.saveCurrentConfigItem}>确定</Button>
                    <Button
                        style={{ marginLeft: 15 }}
                        onClick={() => this.setState({ visible: false })}
                    >取消</Button>
                </div>
            </div>
        );



        return (
            <div className="appflow-wrapper">
                <Modal
                    title={title ? title : "新建连接器配置"}
                    visible={createVisible}
                    onCancel={() => this.setState({ createVisible: false })}
                    onOk={() => this.configFormSubmit(selectedId)}
                    okText="确认"
                    cancelText="取消"
                >
                    <div className="appflow-create-config">
                        <div className="appflow-create-config-row">
                            <label className="appflow-create-config-label" htmlFor="name">配置名称<span style={{ color: '#fc0000' }}>*</span></label>
                            <Input className="appflow-create-config-input" name="name" value={configName} onChange={e => { this.setState({ configName: e.target.value }) }} />
                        </div>
                        <div className="appflow-create-config-table">
                            <div className="appflow-create-config-table-header">
                                <div>配置名称</div>
                                <div>配置值</div>
                            </div>
                            {configFormList.map((item, index) => (
                                <div className="appflow-create-config-table-row" key={item.id}>
                                    <div>{item.fieldText}<span style={{ color: '#fc0000' }}>*</span></div>
                                    <div><Input value={item.fieldValue} onChange={(e) => this.setConfigFormValue(e.target.value, index)} /></div>
                                </div>
                            ))}
                            {
                                errorTips ? <div style={{ color: '#fc0000' }}>请填写必填项!</div> : ""
                            }
                        </div>
                    </div>
                </Modal>
                <Modal
                    title="连接器配置详情"
                    visible={viewVisible}
                    onCancel={() => this.setState({ viewVisible: false })}
                    onOk={() => this.setState({ viewVisible: false })}
                    footer={null}
                    okText="确认"
                    cancelText="取消"
                >
                    <div className="appflow-view-config">
                        <h5>基本信息</h5>
                        <div className="appflow-view-config-row">
                            <label className="appflow-view-config-label">连接器</label>
                            <span className="appflow-view-config-txt">{appName}</span>
                        </div>
                        <div className="appflow-view-config-row">
                            <label className="appflow-view-config-label">连接器配置名称</label>
                            <span className="appflow-view-config-txt">{configName}</span>
                        </div>
                        <h5 style={{ marginTop: 20 }}>配置详情</h5>
                        <div className="appflow-view-config-table">
                            <div className="appflow-view-config-table-header">
                                <div>配置名称</div>
                                <div>配置值</div>
                            </div>
                            {configFormList.map((item, index) => (
                                <div className="appflow-view-config-table-row" key={item.id}>
                                    <div>{item.fieldText}</div>
                                    <div>********</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Modal>
                <Alert
                    className="appflow-alert"
                    message={
                        <div className="appflow-alert-msg">
                            <div>{currentConfigName ? '当前使用的是 ' + currentConfigName + ' 连接配置' : '当前暂未绑定任何配置，请新建连接配置'}</div>
                            {currentConfigName ?
                                <div>
                                    <Button type="link" onClick={() => this.checkConfigItemDetail(configId)}>查看</Button>
                                    <Popover
                                        placement="bottomRight"
                                        title="选择连接器配置"
                                        content={content}
                                        visible={this.state.visible}
                                        onVisibleChange={this.handleVisibleChange}
                                        trigger="click"
                                    >
                                        |
                                        <Button type="link" onClick={this.changeLinker}>
                                            切换
                                        </Button>
                                    </Popover>
                                </div>
                                :
                                <div>
                                    <Button type="link" onClick={() => this.addConfigForm()}>新建</Button>
                                    {haveConfigItemFlag ?
                                        <Popover
                                            placement="bottomRight"
                                            title="选择连接器配置"
                                            content={content}
                                            visible={this.state.visible}
                                            onVisibleChange={this.handleVisibleChange}
                                            trigger="click"
                                        >
                                            |
                                            <Button type="link" onClick={this.changeLinker}>
                                                绑定
                                            </Button>
                                        </Popover>
                                        : <div></div>}

                                </div>

                            }
                        </div>
                    }
                    type="info"
                />
                <Tabs defaultActiveKey="0">
                    <Tabs.TabPane tab="配置" key="0">
                        <Collapse
                            accordion
                            className="appflow-collapse"
                            defaultActiveKey={["1"]}
                            expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
                            expandIconPosition="right"
                        >
                            <Collapse.Panel header="输入参数" key={1}>
                                {opts.paramsDocs && opts.paramsDocs.length ? (
                                    <div>
                                        {!editorMode ? <ApiNodeLinkerConfig
                                            ref="nodeLinkerConfig"
                                            inParams={opts.paramsDocs}
                                            nodeId={this.props.nodeId}
                                            processId={this.props.processId}
                                            applicationId={this.props.applicationId}
                                        /> :
                                            <div>
                                                <div style={{ border: '1px #cccccc solid', minHeight: '280px', margin: '2px', borderRadius: '0px' }}>
                                                    <CodeMirror ref='requestBodyCodeMirror'
                                                        value={this.state.requestBody}
                                                        onChange={this.updateRequestBodyCode}
                                                        options={{ lineNumbers: true, mode: 'javascript', autoMatchParens: true }}
                                                    />
                                                </div>
                                                <a onClick={()=>this.formatRequestBodyJsonStr(requestBody)} >格式化JSON</a>{' '}<Tooltip title="取上一节点结果${$.变量},取指定节点结果:${$.T00001.变量},取HTTP参数:${$.http.变量},取Header值:${$.header.变量},全局变量${$.global.userid},${indoc}表示上一节点的全部结果,使用${$rule.规则Id}可调用规则返回值作为参数">显示取值帮助?</Tooltip>

                                            </div>
                                        }
                                        <div className="editor-mode-row">
                                            <label>参数编辑模式：</label><Switch checkedChildren="文本模式" unCheckedChildren="可视模式" checked={editorMode} onChange={(checked) => this.onCheckedChange(checked)} />
                                        </div>
                                    </div>

                                ) : (
                                    "未配置输入参数"
                                )}

                            </Collapse.Panel>
                        </Collapse>
                    </Tabs.TabPane>
                    {/* <Tabs.TabPane tab="基本属性" key="1" forceRender>
                        <div style={{padding: 15}}>
                            <BasicAttributes ref="basic"  />
                        </div>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="超时设置" key="2" forceRender>
                        <div style={{padding: 15}}>
                            <TimeoutSetting ref="timeout" />
                        </div>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="输出变量" key="3" forceRender>
                        <div style={{padding: 15}}>
                            <OutputVariable ref="output" />
                        </div>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="断言" key="4" forceRender>
                        <div style={{padding: 15}}>
                            <Assert ref="assert" wrappedComponentRef={(form) => this.assertForm = form} />
                        </div>
                    </Tabs.TabPane> */}
                </Tabs>
                <Row style={{ marginTop: 15, padding: "0 16px" }}>
                    <Col span={6}></Col>
                    <Col span={16}>
                        <Button type="primary" size="large" onClick={this.submit}>
                            提交
                        </Button>
                        <Button size="large" style={{ marginLeft: 15 }} onClick={this.props.close}>
                            取消
                        </Button>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default AppFlowNode;
