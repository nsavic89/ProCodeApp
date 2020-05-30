import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext'; 
import { useTranslation } from 'react-i18next';
import {
    Form,
    Select,
    Alert,
    Button,
    Spin,
    Tag
} from 'antd';
import axios from 'axios';
import CodesSelect from './CodesSelect';
import { CheckCircleFilled } from '@ant-design/icons';




/*
    Simple recoding from starting 
    to end classification
*/
export default function Recoding() {
    const context = useContext(UserContext);
    const [state, setState] = useState({
        predictions: []
    });
    const { t, i18n } = useTranslation();


    // load crosswalks
    // in order to know which starting classification has end classifications
    useEffect(() => {
        // only if not loaded
        if (!context.data.crosswaks) {
            axios.get(
                `${context.API}/crosswalk-files/`,
                {headers: {
                    Pragma: "no-cache",
                    Authorization: 'JWT ' + localStorage.getItem('token')
                }}
            ).then(
                res => {
                    let crosswalks = res.data;
                    context.fun.updateData('crosswalks', crosswalks);
                    setState({
                        ...state,
                        loading: false
                    })
                }
            ).catch(
                e => {
                    console.log(e);
                    if (e.response) {
                        setState({ loading: false, error: e.response.status });
                    }
                }
            )
        }
    }, [])





    if (state.loading) {
        return(
            <div style={{ marginTop: 150, textAlign: "center" }}>
                <Spin tip={t('messages.loading')} />
            </div>
        )
    }




    const title = (
        ['en', 'en-US'].indexOf(i18n.language) === -1 ?
        `title_${i18n.language}` : 'title'
    )

    // end classification list depends on what is the starting one
    // defined by crosswalk rules
    const handleClsfChange = obj => {
        if ("to_cls" in obj) {
            setState({...state, classification2: obj['to_cls']});
            
            if (obj['to_cls'] in context.data.codes){
                return;
            }

            axios.get(
                `${context.API}/app/codes/ref=${obj['to_cls']}/`,
                {headers: {
                    Pragma: "no-cache",
                    Authorization: 'JWT ' + localStorage.getItem('token')
                }}
            ).then(
                res => {
                    let codes = {...context.data.codes};
                    codes[obj['to_cls']] = res.data;
                    context.fun.updateData('codes', codes);
                }
            ).catch(
                e => {
                    console.log(e);
                    if (e.response) {
                        setState({ loading: false, error: e.response.status });
                    }
                }
            )
        }
        if ("from_cls" in obj) {
            // needed to know what codes/titles to load in Tree Nodes

            let clsf1 = obj['from_cls'];
            let crswks = context.data
                            .crosswalks
                            .filter(o => o['classification_1'] === clsf1);

            // well if no crosswalks
            if (crswks.length === 0) {
                setState({
                    ...state, 
                    endClsfList: false,
                    classification1: obj['from_cls']
                });
                return;
            }
            
            // populate classsifation 2
            let clsf2 = [];
            for (let i in crswks) {
                let reference = crswks[i]['classification_2'];
                let classification2 = context.data
                                        .classifications
                                        .find(o => o.reference === reference);
                clsf2.push(classification2);
            }
            setState({
                ...state, 
                endClsfList: clsf2,
                classification1: obj['from_cls']});
        }
    }

    // execute recoding
    const handleRecoding = values => {
        setState({...state, recoding: true});
        axios.post(
            `${context.API}/app/transcoding/`,
            values,
            {headers: {
                Pragma: "no-cache",
                Authorization: 'JWT ' + localStorage.getItem('token')
            }}
        ).then(
            res => {
                if (res.status === 200) {
                    setState({
                        ...state,
                        recoding: false,
                        predictions: res.data
                    })
                }
            }
        ).catch(
            e => {
                console.log(e);
                if (e.response) {
                    setState({
                        ...state,
                        recoding: false,
                        error: e.response.status 
                    });
                }
            })
        }

    // show predictions of recoding -----------------------------
    const Predictions = (
            <div>
                <div style={{ 
                    textAlign: "center", 
                }}>
                    <div style={{ fontSize: 55, color: "#52c41a" }}>
                        <CheckCircleFilled />
                    </div>
                    <div>{t('recoding-view.recoding-successful')}</div>

                    <div style={{ marginTop: 15 }}>
                        <Button
                            type="default"
                            onClick={ 
                                () => setState({
                                    ...state,
                                    predictions: []
                                })
                            }
                        >
                            { t('recoding-view.new-recoding-button') }
                        </Button>
                    </div>
                </div>

                <div style={{ marginTop: 50 }}>{
                    state.predictions.map(
                        (item, inx) => (
                            <div key={item}>
                                <Tag color={inx === 0 ? 'geekblue': 'orange'}>
                                    {item}
                                </Tag> <span>
                                    {context.data
                                        .codes[state.classification2]
                                        .find(o => o.code === item)[title]
                                    }
                                </span>
                            </div>
                        )
                    )
                }</div>
            </div>
        )

    const [form] = Form.useForm();

    const RecodingForm = (
        <div>
            <Alert
                type="info"
                message={t('recoding-view.alert-message')}
                description={t('recoding-view.alert-description')}
                showIcon
                closable
                style={{ marginBottom: 25 }}
            />

            <Form 
                form={form}
                {...context.styling.formItemLayout}
                onValuesChange={handleClsfChange}
                onFinish={handleRecoding}
            >
                <Form.Item
                    name="from_cls"
                    label={t('recoding-view.from-classification')}
                    rules={[
                        {
                            required: true,
                            message: t('messages.form.required')
                        }
                    ]}
                >
                    <Select>
                    {
                        context.data.classifications.map(
                            item => (
                                <Select.Option key={item.id} value={item.reference}>
                                    { item.short } ({item.name})
                                </Select.Option>
                            )
                        )
                    }
                    </Select>
                </Form.Item>

                <Form.Item
                    name="from_code"
                    label={t('recoding-view.code-title')}
                    rules={[
                        {
                            required: true,
                            message: t('messages.form.required')
                        }
                    ]}
                >
                    <CodesSelect
                        reference={state.classification1}
                        title={title}
                        handleChange={
                            value => {
                                let values = form.getFieldsValue(
                                    ['from_cls', 'to_cls']
                                );
                                values['from_code'] = value;
                                form.setFieldsValue(values);
                            }
                        }
                    />
                </Form.Item>

                <Form.Item
                    name="to_cls"
                    label={t('recoding-view.end-classification')}
                    rules={[
                        {
                            required: true,
                            message: t('messages.form.required')
                        }
                    ]}
                >
                    {
                        state.endClsfList ?
                        <Select>{
                            state.endClsfList.map(
                                item => (
                                    <Select.Option key={item.id} value={item.reference}>
                                        { item.short } ({item.name})
                                    </Select.Option>
                                )
                            )
                        }</Select>
                        : <Alert
                            type="warning"
                            message={t('recoding-view.classification-2-crosswalk')}
                            showIcon
                            banner={true}
                        />
                    }
                </Form.Item>

                <Form.Item {...context.styling.tailItemLayout}>
                    <Button type="primary" danger htmlType="submit">
                        {t('recoding-view.button')}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )


    return (
        <div>
            { state.predictions.length > 0 ? Predictions : RecodingForm }
        </div>
    )
}