import React from "react";
import { Form, InputNumber } from "antd";

class TimeoutSetting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <Form>
                <Form.Item
                    label="网络链接超时"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 16 }}
                    help="网络链接的超时时间(默认10秒)单位毫秒"
                >
                    {getFieldDecorator("netConnectTimeout", { rules: [{ required: true }], initialValue: "10000" })(
                        <InputNumber min={0} />
                    )}
                </Form.Item>
                <Form.Item
                    label="请求超时时间"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 16 }}
                    help="执行超时时间(默认3秒)单位毫秒"
                >
                    {getFieldDecorator("connectTimeout", { rules: [{ required: true }], initialValue: "30000" })(
                        <InputNumber min={0} />
                    )}
                </Form.Item>
                <Form.Item
                    label="重试次数"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 16 }}
                    help="调用后端服务失败后是否进行重试(默认0表示不重试)"
                >
                    {getFieldDecorator("retryNum", { rules: [{ required: true }], initialValue: "0" })(
                        <InputNumber min={0} />
                    )}
                </Form.Item>
                <Form.Item
                    label="重试间隔"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 16 }}
                    help="每次重试时的间隔时间0表示立即重试(单位:毫秒)"
                >
                    {getFieldDecorator("retrySleep", { rules: [{ required: true }], initialValue: "0" })(
                        <InputNumber min={0} />
                    )}
                </Form.Item>
            </Form>
        );
    }
}

const TimeoutSettingForm = Form.create()(TimeoutSetting);

export default TimeoutSettingForm;