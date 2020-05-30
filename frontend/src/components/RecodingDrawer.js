import React, { useContext, useState } from 'react';
import {
    Drawer,
    Form,
    Select,
    Button,
    Radio,
    Spin
} from 'antd';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../contexts/UserContext';
import axios from 'axios';


// recoding files drawer
// same as for coding used coding drawer
export default function RecodingDrawer(props) {
    const [ state, setState ] = useState({});
    const { t } = useTranslation();
    const context = useContext(UserContext);


    const headers = {
        Pragma: "no-cache",
        Authorization: 'JWT ' + localStorage.getItem('token')
    }

    // handle submit button in form
    // runs recoding
    const handleSumit = values => {
        // loading spin while waiting to resolve/reject promise
        setState({ ...state, coding: true });
        values['my_file'] = props.myfile;
        
        // post request
        axios.post( 
            `${context.API}/app/transcoding/`,
            values,
            { headers: headers })
        .then(
            res => {
                // update state and context
                let dataList = {...context.data.myFileData};
                dataList[props.myfile] = res.data;
                context.fun.updateData('myFileData', dataList);

                // upadate file
                // if not updated -> classifications will not be shown
                // in the table that opens immediatelly after the coding is done
                let myfiles = [...context.data.myfiles];
                let myfile = myfiles.find(o => o.id === props.myfile);
                myfiles = myfiles.filter(o => o.id !== props.myfile);
                myfile.classifications = JSON.parse(myfile.classifications);

                if ( myfile.classifications.indexOf(values['to_cls']) === -1 ){
                    myfile.classifications.push(values['to_cls'])
                }

                myfile.classifications = JSON.stringify(myfile.classifications);
                myfiles.unshift(myfile);
                context.fun.updateData('myfiles', myfiles);
                
                
                // close drawer
                props.onCodingFinish();
            })
        .catch(
            e => {
                console.log(e);
                if (e.response) {
                    setState({
                        ...state,
                        error: e.response.status,
                        coding: false
                    });
                }
            }
        )
    }


    // variables of the file for form below
    let variables = [];
    if (props.visible) {
        variables = JSON.parse(context.data.myfiles
                    .find(o => o.id === props.myfile)
                    .variables);
        
        // if classifications -> coded already against classification
        let variables2 = JSON.parse(context.data.myfiles
                        .find(o => o.id === props.myfile)
                        .classifications);
        
        variables = variables.concat(variables2);
    }

    const RecodingForm = (
        <Form
            onFinish={handleSumit}
            {...context.styling.formItemLayout}
        >
            <Form.Item
                name="from_cls"
                label={t('recoding-drawer.from-cls')}
                rules={[
                    {
                        required: true,
                        message: t('messages.form.required')
                    }
                ]}
            >
                <Select>{
                    context.data.classifications.map(
                        item => (
                            <Select.Option key={item.id} value={item.reference}>
                                { item.short } ({item.name})
                            </Select.Option>
                        )
                    )
                }</Select>
            </Form.Item>

            <Form.Item
                name="to_cls"
                label={t('recoding-drawer.to-cls')}
                rules={[
                    {
                        required: true,
                        message: t('messages.form.required')
                    }
                ]}
            >
                <Select>{
                    context.data.classifications.map(
                        item => (
                            <Select.Option key={item.id} value={item.reference}>
                                { item.short } ({item.name})
                            </Select.Option>
                        )
                    )
                }</Select>
            </Form.Item>

            <Form.Item
                name="variable"
                label={t('coding-drawer.variable')}
                rules={[
                    {
                        required: true,
                        message: t('messages.form.required')
                    }
                ]}
            >
                <Radio.Group>{
                    variables.map(item => (
                        <Radio.Button key={item} value={item}>
                            {item}
                        </Radio.Button>
                    ))
                }</Radio.Group>
            </Form.Item>
            <Form.Item {...context.styling.tailItemLayout}>
                <Button type="primary" danger htmlType="submit">
                    {t('recoding-view.button')}
                </Button>
            </Form.Item>
        </Form>
    );

    return(
        <Drawer
            title={t('recoding-drawer.title')}
            visible={props.visible}
            onClose={props.onClose}
            placement="right"
            width={550}
        >
            { state.coding ? 
                <div style={{ marginTop: 100, textAlign: "center" }}>
                    <Spin tip={t('coding-view.predicting-spin')} />
                </div>
                : RecodingForm 
            }
        </Drawer>
    )
}