import React, { useState, useEffect } from 'react';
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
import { Loading } from '../Loading';

// css styling
const styling = {
    form: {
       
    },
    select: {
        width: 150
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

    // load classification schemes
    useEffect(() => {
        axios.get(
            `${process.env.REACT_APP_API_URL}/scheme/`
        ).then(
            res => {
                let schemes = res.data.results;
                for (let i in schemes) {
                    schemes[i].levels = JSON.parse(schemes[i].levels);
                }

                setState({
                    schemes: schemes,
                    loaded: true
                })
            }
        ).catch(
            () => message.error(t('messages.request-failed'))
        )
    }, [])

    // Submit entered data and get codes
    const handleSubmit = e => {
        e.preventDefault();
        props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                axios.post(
                    `${process.env.REACT_APP_API_URL}/my-coding/`,
                    values
                ).then(
                    res => props.getResults(res.data)
                ).catch(
                    () => message.error(t('messages.request-failed'))
                )
            };
        });
    };

    // prevent going further if schemes not loaded yet
    if (!state.loaded) {
        return (
            <div>
                { Loading }
            </div>
        )
    }

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
                scheme: state.schemes.find(o => o.id === val) 
            })}
        >
            { state.schemes.map(
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
                    initialValue: lng
                })(
                    <Radio.Group size="small" buttonStyle="solid">
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
                            <Radio.Group size="small"  buttonStyle="solid">
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