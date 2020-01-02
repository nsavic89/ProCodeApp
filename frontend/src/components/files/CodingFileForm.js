import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { UserDataContext } from '../../contexts/UserDataContext';
import {
    Form, Select, Modal, Radio, Alert, Icon, Tooltip, message
} from 'antd';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import { LoadingPage } from '../Loading';

const styling = {
    radio: {
        marginBottom: 25
    }
}

const formItemLayout = {
    labelCol: {
        md: {span: 7}
    },
    wrapperCol: {
        md: {span: 16}
    }
}

// coding/transcoding (based on radio selection) of entire files
// needed to select scheme and variable for coding
function CodingFileForm(props) {
    const { getFieldDecorator } = props.form;
    const { getFieldValue } = props.form;
    const { t } = useTranslation();
    const context = useContext(UserDataContext);
    const [state, setState] = useState({
        radio: "c"
    })

    if (!context.loaded || !props.file) {
        return (
            <div />
        )
    }

    const file = context.files.find(o => o.id === props.file);
    const variables = JSON.parse(file.variables);

    // get levels for selected scheme
    const getLevels = () => {
        let schemeID = getFieldValue('scheme');
        let scheme = context.schemes.find(o => o.id === schemeID);
        let levels = JSON.parse(scheme.levels);
        return levels;
    }

    // handle submit -> request coding/transcoding
    const handleSubmit = e => {
        e.preventDefault();
        setState({...state, loadingPage: true});
        
        if (state.radio === 'c') {
            props.form.validateFieldsAndScroll((err, values) => {
                if (!err) { 
                    axios.post(
                        `${process.env.REACT_APP_API_URL}/my-coding/`,
                        {...values, "my_file": props.file}
                    ).then(
                        () => {
                            props.onCancel();
                            context.refreshData();
                            setState({...state, loadingPage: false});
                            props.history.push('/coding-results/file='+props.file);
                        }
                    ).catch(
                        () => message.error( t('messages.request-failed') )
                    )
                }
            })
        } else {
            props.form.validateFieldsAndScroll((err, values) => {
                console.log(values)
                if (!err) { 
                    axios.post(
                        `${process.env.REACT_APP_API_URL}/my-transcoding/`,
                        {...values, "my_file": props.file}
                    ).then(
                        () => {
                            props.onCancel();
                            context.refreshData();
                            setState({...state, loadingPage: false});
                            props.history.push('/transcoding-results/file='+props.file);
                        }
                    ).catch(
                        () => message.error( t('messages.request-failed') )
                    )
                }
            })
        }
    }

    // while coding -> spinner
    if (state.loadingPage) {
        return(
            <div>
                {LoadingPage}
            </div>
        )
    }

    // form coding
    // when state.radio is "c"
    let formCoding = <div />;
    if (state.radio === 'c') {
        formCoding = (
            <Form>
                <Form.Item
                    label={ t('coding.search.scheme') }
                    labelAlign="left"
                    {...formItemLayout}
                >
                    { getFieldDecorator('scheme', {
                        rules: [
                            {
                                required: true,
                                message: t('messages.field-obligatory')
                            }
                        ]
                    })(
                        <Select>
                            {
                                context.schemes.map(
                                    item => (
                                        <Select.Option key={item.id} value={item.id}>
                                            { item.name }
                                        </Select.Option> 
                                    )
                                )
                            }
                        </Select>
                    ) }
                </Form.Item>
    
                <Form.Item
                    label={ 
                        <span>{
                            t('coding.file.variables')} <Tooltip
                                title={t('coding.file.variable-help')}>
                                    <Icon type="question-circle" />
                                </Tooltip>
                        </span> }
                    labelAlign="left"
                    {...formItemLayout}
                >
                    { getFieldDecorator('variable', {
                        rules: [
                            {
                                required: true,
                                message: t('messages.field-obligatory')
                            }
                        ]
                    })(
                        <Radio.Group>
                            {
                                variables.map(
                                    (item, inx) => (
                                        <Radio key={inx} value={"var" + (inx + 1)}>
                                            { item }
                                        </Radio> 
                                    )
                                )
                            }
                        </Radio.Group>
                    ) }
                </Form.Item>
    
                {
                    getFieldValue('scheme') ?
                        <Form.Item
                            label={ t('coding.search.level') }
                            labelAlign="left"
                            {...formItemLayout}
                        >
                            { getFieldDecorator('level', {
                                rules: [
                                    {
                                        required: true,
                                        message: t('messages.field-obligatory')
                                    }
                                ]
                            })(
                                <Radio.Group>
                                    {
                                        getLevels().map(
                                            item => (
                                                <Radio key={item} value={item}>
                                                    { item }
                                                </Radio> 
                                            )
                                        )
                                    }
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
    
    
    // form transcoding
    // when state.radio is "t"
    let formTranscoding = <div />;
    if (state.radio === 't') {
        formTranscoding = (
            <Form>
                <Form.Item
                    label={t('transcoding.starting-scheme')}
                    {...formItemLayout}
                    labelAlign="left"
                >
                    {getFieldDecorator('scheme', {
                        rules: [
                            {
                                required: true,
                                message: t('messages.field-obligatory')
                            }
                        ]
                    })(
                        <Select style={styling.select}>
                            {
                                context.schemes.map(
                                    item => (
                                        <Select.Option key={item.id} value={item.id}>
                                            { item.name }
                                        </Select.Option>
                                    )
                                )
                            }
                        </Select>
                    )}
                </Form.Item>
    
                <Form.Item
                    label={ 
                        <span>{
                            t('coding.file.variables')} <Tooltip
                                title={t('coding.file.variable-help')}>
                                    <Icon type="question-circle" />
                                </Tooltip>
                        </span> }
                    labelAlign="left"
                    {...formItemLayout}
                >
                    { getFieldDecorator('variable', {
                        rules: [
                            {
                                required: true,
                                message: t('messages.field-obligatory')
                            }
                        ]
                    })(
                        <Radio.Group>
                            {
                                variables.map(
                                    (item, inx) => (
                                        <Radio key={inx} value={"var" + (inx + 1)}>
                                            { item }
                                        </Radio> 
                                    )
                                )
                            }
                        </Radio.Group>
                    ) }
                </Form.Item>
    
                <Form.Item
                    label={t('transcoding.end-scheme')}
                    {...formItemLayout}
                    labelAlign="left"
                >
                    {getFieldDecorator('end_scheme', {
                        rules: [
                            {
                                required: true,
                                message: t('messages.field-obligatory')
                            }
                        ]
                    })(
                        <Select style={styling.select}>
                            {
                                context.schemes.map(
                                    item => (
                                        <Select.Option key={item.id} value={item.id}>
                                            { item.name }
                                        </Select.Option>
                                    )
                                )
                            }
                        </Select>
                    )}
                </Form.Item>
    
            </Form>
        )
    }

    return(
        <Modal
            title={ `${t('coding.file.modal-title')}: ${file.name}` }
            visible={ props.file !== false }
            onCancel={ props.onCancel }
            okText={ t('coding.file.modal-ok-text') }
            onOk={handleSubmit}
        >
            <Radio.Group
                style={styling.radio}
                value={state.radio}
                onChange={e => setState({ radio: e.target.value })}
            >
                <Radio value="c">
                    { t('coding.file.coding') }
                </Radio>
                <Radio value="t">
                    { t('coding.file.transcoding') }
                </Radio>
            </Radio.Group>


            { state.radio === "c" ? formCoding : formTranscoding }
        </Modal>
    )
}
export default Form.create()( withRouter(CodingFileForm ));