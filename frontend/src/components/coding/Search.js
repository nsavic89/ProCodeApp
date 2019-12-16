import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Form,
    Input,
    Select,
    Radio,
    message,
    Alert
} from 'antd';
import axios from 'axios';

// css styling
const styling = {
    select: {
        width: 200,
        fontSize: 16
    },
    input: {
        fontSize: 16
    },
    radio: {
        minWidth: 75
    }
}

const formItemLayout = {
    wrapperCol:
        {md: {span: 12}},
    labelCol:
        {md: {span: 2}}
}

// Coding of occupations using CNB
// select classification scheme
// enter raw data and run predictions
// will call my-coding url on api rest
function Search(props) {

    const { t, i18n } = useTranslation();
    const { getFieldDecorator } = props.form;
    const [state, setState] = useState({});

    const lng = i18n.language;

    // Submit entered data and get codes
    const handleSubmit = e => {
        e.preventDefault();
        props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                axios.post(
                    `${process.env.REACT_APP_API_URL}/my-coding/`,
                    values
                ).then(
                    res => {
                        // format data and send back to parent (coding)
                        let data = [];
                        for (let i in res.data) {
                            // title label (field of model) based on current language
                            let titleLabel = values.lng === 'en' ? 'title' : `title_${values.lng}`;

                            let title = state.scheme.classification.find(
                                o => o.code === res.data[i]
                            )[titleLabel]
                            data.push({ code: res.data[i], title: title });
                        }
                        props.getResults(data);
                    }
                ).catch(
                    () => message.error(t('messages.request-failed'))
                )
            };
        });
    };


    // Select menu with classification schemes
    const SchemeSelect = getFieldDecorator('scheme', {
        rules: [
            {
                required: true,
                message: t('messages.field-obligatory')
            }
        ]
    })(
        <Select 
            style={ styling.select }
            onChange={val => setState({
                ...state, 
                scheme: props.schemes.find(o => o.id === val) 
            })}
        >
            { props.schemes.map(
                item => (
                    <Select.Option value={item.id} key={item.id}>
                        { item.name }
                    </Select.Option>)
            ) }
        </Select>
    );

    return(
        <Form
            onSubmit={handleSubmit}
            style={styling.form}
        >
            <Form.Item>
                { getFieldDecorator("text", {
                    rules: [
                        {
                            required: true,
                            message: t('messages.field-obligatory')
                        }
                    ]
                })(
                    <Input.Search
                        placeholder={t('coding.search.input-placeholder')} 
                        enterButton
                        addonBefore={ SchemeSelect }
                        size="large"
                        style={styling.input}
                    />
                ) }
            </Form.Item>

            <Form.Item
                label={ t('general.language' )}
                {...formItemLayout}
                labelAlign="left"
            >
                { getFieldDecorator("lng", {
                    rules: [
                        {
                            required: true,
                            message: t('messages.field-obligatory')
                        }
                    ],
                    initialValue: lng === 'en-US' ? 'en' : lng
                })(
                    <Radio.Group buttonStyle="solid">
                    {[
                        {
                            label: t('langs.en'),
                            value: 'en'
                        }, {
                            label: t('langs.ge'),
                            value: 'ge'
                        }, {
                            label: t('langs.fr'),
                            value: 'fr'
                        }, {
                            label: t('langs.it'),
                            value: 'it'
                        }
                    ].map(
                        item => (
                            <Radio.Button 
                                key={item.value}
                                value={item.value}
                                style={styling.radio}
                            >
                                { item.label }
                            </Radio.Button>
                        )
                    )}
                    </Radio.Group>
                ) }
            </Form.Item>

            {   // only when a scheme is selected -> levels are shown
                state.scheme ? 
                    <Form.Item
                        label={ t('coding.search.level') }
                        {...formItemLayout}
                        labelAlign="left"
                    >
                        { getFieldDecorator('level', {
                            rules: [
                                {
                                    required: true,
                                    message: t('messages.field-obligatory')
                                }
                            ],
                            initialValue: 2
                        })(
                            <Radio.Group  buttonStyle="solid">
                                { state.scheme.levels.map(
                                    item => 
                                        <Radio.Button value={item} key={item} style={styling.radio}>
                                            { item }
                                        </Radio.Button>
                                ) }
                            </Radio.Group>
                        ) }
                    </Form.Item>
                    : <Alert
                        type="info"
                        message={ t('coding.search.alert-select-scheme') }
                    />
            }
        </Form>
    )
}
export default Form.create()( Search );