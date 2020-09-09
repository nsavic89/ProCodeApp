import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Form,
    Input,
    Radio,
    Select,
    Button,
    Alert,
    Result,
    Spin,
    Tag
} from 'antd';
import { UserContext } from '../contexts/UserContext';
import {
    LoadingOutlined,
    CheckCircleFilled,
    CloseCircleOutlined,
    PlayCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import CodesSelect from './CodesSelect';


/*
    Collects data related to the following coding
    of entered data

    Form items:
        1. Languages
        2. Classification
        3. Level
        4. Occupation/economic activity entry
*/

export default function Coding() {
    const { t, i18n } = useTranslation();
    const [ state, setState ] = useState({
        predicting: false,
        loadingLevels: false,
        levels: false,
        predictions: [],
        inputs: { language: '' }
    });
    const context = useContext(UserContext);

    const headers = {
        Pragma: "no-cache",
        Authorization: 'JWT ' + localStorage.getItem('token')
    }


    // get unique values from a list
    const setUnique = myList => {
        let mySet = [];
        for ( let i in myList ) {
            if (mySet.indexOf(myList[i]) === -1) {
                mySet.push(myList[i]);
            }
        }
        mySet.sort();
        return mySet;
    }

    const handleValueChange = obj => {
        if ("classification" in obj) {
            /*
                when classification is updated
                we check if in the context are codes
                already loaded (i.e. context.data.codes)

                if not we run function of context to
                load all codes corresponding to the classification
            */
            const reference = obj.classification
            setState({ ...state, loadingLevels: true });

            if (reference in context.data.codes) {
                const codes = context.data.codes[reference];
                const levelsList = codes.map(item => item.level);
                const levels = setUnique(levelsList);
                setState({ ...state, loadingLevels: false, levels: levels });
                return
            }

            // otherwise
            axios.get(
                `${context.API}/app/codes/ref=${reference}/`,
                { headers: headers })
            .then(
                res => {
                    if (res.status === 200) {
                        let codes = {...context.data.codes};
                        codes[reference] = res.data;
                        context.fun.updateData('codes', codes);

                        // update levels
                        let levelsList = res.data.map(item => item.level);
                        const levels = setUnique(levelsList);
                        setState({ ...state, loadingLevels: false, levels: levels });
                    } else {
                        console.log(res.status, "no codes retrieved");
                        setState({ ...state, loadingLevels: false, levels: false });
                    }
                })
            .catch(
                e => {
                    console.log(e);
                    setState({ ...state, error: 404 });
                }
            )
        }
    }



    // if error while axios request
    const Error = (
        <div>
            <Result
                status="500"
                title={state.error}
                subTitle={t('messages.sth-went-wrong')}
                extra={<Button
                            type="primary"
                            onClick={ () => setState({...state, error: false}) }
                        >{ t('back') }
                        </Button>}
            />
        </div>
    )



    // form submit
    const handleFinish = values => {
        // set loading spinner
        setState({ ...state, predicting: true });

        axios.post(
            `${context.API}/app/coding/`,
            values,
            {headers: headers})
        .then(res => {
            setState({
                ...state,
                predictions: res.data[0],
                predicting: false,
                inputs: values
            })
        } )
        .catch(
            e => {
                if (e.response) {
                    setState({
                        ...state,
                        error: e.response.status,
                        predicting: false
                    });
                    return;
                }
                setState({ ...state, error: "40x" })
            }
        )
    }


    // coding form
    const CodingForm = (<div>
            <Alert
                type="info"
                showIcon
                closable
                message={t('coding-view.alert-message')}
                description={t('coding-view.alert-description')}
                style={{ marginBottom: 5 }}
            />

            {
                state.selectedLanguage === 'ge' ?
                    <Alert
                        type="warning"
                        closable
                        message={t('coding-view.german-compound-words-msg')}
                        description={t('coding-view.german-compound-words-dscr')}
                        showIcon
                    />
                    : <div />
            }

            <Form
                style={{ marginTop: 30 }}
                onFinish={handleFinish}
                initialValues={{
                    language: i18n.language === "en-US" ? "en" : i18n.language
                }}
                onValuesChange={handleValueChange}
            >

                <Form.Item
                    name="language"
                    {...context.styling.formItemLayout}
                    label={t('language')}
                    rules={[
                        {
                            required: true,
                            message: t('messages.form.required')
                        }
                    ]}
                >
                    <Radio.Group onChange={
                        e => setState({
                            ...state,
                            selectedLanguage: e.target.value
                        })}
                    >
                        <Radio.Button value="ge">
                            {t('languages.german')}
                        </Radio.Button>
                        <Radio.Button value="fr">
                            {t('languages.french')}
                        </Radio.Button>
                        <Radio.Button value="it">
                            {t('languages.italian')}
                        </Radio.Button>
                        <Radio.Button value="en">
                            {t('languages.english')}
                        </Radio.Button>
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    name="classification"
                    {...context.styling.formItemLayout}
                    label={t('coding-view.classification')}
                    rules={[
                        {
                            required: true,
                            message: t('messages.form.required')
                        }
                    ]}
                >
                    {
                        context.state.classifications ?
                        <Select>
                            { context.data.classifications.map(
                                item => (
                                    <Select.Option key={item.id} value={item.reference}>
                                        { item.short } ({ item.name })
                                    </Select.Option>
                                )
                            )}
                        </Select>
                        : <span>
                            <LoadingOutlined
                                style={{ color: "#1890ff" }}
                            /> {t('please-wait')}
                        </span>
                    }
                </Form.Item>

                <Form.Item
                    name="level"
                    {...context.styling.formItemLayout}
                    label={t('coding-view.level')}
                    rules={[
                        {
                            required: true,
                            message: t('messages.form.required')
                        }
                    ]}
                >
                    {
                        state.loadingLevels ?
                        <span>
                            <Spin />
                        </span>
                        :<span>{
                            state.levels ?
                            <Radio.Group>
                                {
                                    state.levels.map(
                                        item => (
                                            <Radio.Button key={item} value={item}>
                                                { item }
                                            </Radio.Button>
                                        )
                                    )
                                }
                            </Radio.Group>
                            : <Alert
                                type="warning"
                                message={t('coding-view.level-info')}
                                banner={true}
                            />
                        }</span>
                    }
                </Form.Item>

                <Form.Item
                    name="my_input"
                    {...context.styling.formItemLayout}
                    label={t('coding-view.input')}
                    rules={[
                        {
                            required: true,
                            message: t('messages.form.required')
                        }
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item {...context.styling.tailItemLayout}>
                    <Button type="primary" danger htmlType="submit">
                        <PlayCircleOutlined /> {t('coding-view.button')}
                    </Button>
                </Form.Item>
            </Form>
        </div>)

    // resutls of coding
    // first div is green check icon and message
    // the next one contains results
    // final component is feedback
    const title = (
        ['en', 'en-US'].indexOf(state.inputs.language) === -1 ?
        `title_${state.inputs.language}` : 'title'
    )

    // submit user feedback
    const submitFeedback = code => {
        // spin while waiting request to send respose
        setState({ ...state, feedbackSending: true });

        let data = {...state.inputs};
        data.text = data['my_input'];
        data.code = code;
        data.user = context.data.user.username; // later must be replaced

        axios.post(
            `${context.API}/app/feedback/`,
            data,
            {headers: headers})
        .then( () => setState({...state, feedbackSubmitted: true}) )
        .catch( e => {
            if (e.response) {
                setState({
                    ...state,
                    error: e.response.status,
                    feedbackSubmitted: false,
                    selectedFeedbackCode: false,
                    codeNotCorrect: false,
                    feedbackSending: false
                });
            } else {
                setState({
                    ...state,
                    error: "40x",
                    feedbackSubmitted: false,
                    selectedFeedbackCode: false,
                    codeNotCorrect: false,
                    feedbackSending: false
                });
            }
        } )
    }


    // handle codes select change
    // when the predicted code not matching criteria
    const handleCodesSelectChange = value => {
        setState({...state, selectedFeedbackCode: value});
    }


    const predictingFailed = (
        state.predictions ?
        state.predictions.length === 1 && state.predictions[0] === 'None'
        : true
    )


    const Feedback = (
        <div>
            {
                predictingFailed ?
                <div />
                : <div style={{ marginTop: 25 }}>
                    <Alert
                        showIcon
                        message={ t('coding-view.feedback-alert-message') }
                        description={ t('coding-view.feedback-alert-description') }
                    />
                </div>
            }

            {
                state.codeNotCorrect || predictingFailed ?
                <div style={{ marginTop: 25 }}>
                    <Form.Item
                        label={t('coding-view.codes-select')}
                        labelAlign="left"
                        labelCol={{lg: {span: 24}}}
                        wrapperCol={{lg: {span: 12}, md: {span: 24}}}
                    >
                        <CodesSelect
                            reference={state.inputs.classification}
                            title={title}
                            levels={state.levels}
                            handleChange={handleCodesSelectChange}
                        />
                    </Form.Item>
                    <Button
                        type="primary"
                        onClick={() => submitFeedback(state.selectedFeedbackCode)}
                    >
                        {t('submit')}
                    </Button>
                </div>
                : <div style={{ marginTop: 15 }}>
                    <span>
                        { t('coding-view.feedback-question') }
                    </span>
                    <Button
                        type="primary"
                        style={{ marginLeft: 10 }}
                        size="small"
                        onClick={() => submitFeedback(state.predictions[0])}
                    >
                        {t('yes')}
                    </Button>
                    <Button
                        type="primary"
                        danger
                        style={{ marginLeft: 2 }}
                        size="small"
                        onClick={() => setState({...state, codeNotCorrect: true})}
                    >
                        {t('no')}
                    </Button>
                </div>
            }
        </div>
    )

    
    // results contain received predictions
    const results = (
        state.predictions ? 
        state.predictions : ["None"]
    )
    const Predictions = (<div>
        <div style={{
            textAlign: "center",
        }}>
            {
                predictingFailed ?
                    <div>
                        <div style={{ fontSize: 55, color: "#f5222d" }}>
                            <CloseCircleOutlined />
                        </div>
                        <div>
                            {t('messages.coding-failed')}
                        </div>
                    </div>
                    : <div>
                        <div style={{ fontSize: 55, color: "#52c41a" }}>
                            <CheckCircleFilled />
                        </div>
                        <div>
                            {t('coding-view.prediction-successful')}
                        </div>
                    </div>
            }

            <div>
                {
                    state.feedbackSubmitted ?
                    t('coding-view.feedback-submitted-message')
                    : ""
                }
            </div>

            <div style={{ marginTop: 15 }}>
                <Button
                    type="default"
                    onClick={
                        () => setState({
                            ...state,
                            predictions: [],
                            feedbackSubmitted: false,
                            codeNotCorrect: false,
                            selectedFeedbackCode: false
                        })
                    }
                >
                    { t('coding-view.new-prediction-button') }
                </Button>
            </div>
        </div>

        <div style={{ marginTop: 25 }}>{
            results.map(
                (item,inx) => (
                    item === 'None' ?
                    <div />
                    :<div
                        key={item}
                        style={{ fontSize: 16 }}
                    >
                        <Tag color={inx===0 ? 'geekblue' : 'orange'}>
                            { item }
                        </Tag>

                        <span style={{ paddingLeft: 10 }}>
                            { context.data
                                .codes[state.inputs.classification]
                                .find(o => o.code === item)[title]
                            }
                        </span>
                    </div>
                )
            )
        }</div>

        <div>
            {
                state.feedbackSubmitted || state.feedbackSending ?
                <div /> : Feedback
            }
        </div>

        <div style={{ textAlign: "center", marginTop: 50 }}>
        {
            state.feedbackSending ?
            <Spin tip={t('please-wait')} />
            : <div />
        }
        </div>
    </div>);


    // predicting spin on the center of window
    const PredictingSpin = (
        <div style={{ textAlign: "center", marginTop: 100 }}>
            <Spin tip={t('coding-view.predicting-spin')} />
        </div>)

    // RETURN --------------------
    if (state.error) {
        return(Error)
    } else if (state.predicting) {
        return(PredictingSpin)
    } else if (results.length > 0) {
        return(Predictions)
    } else {
        return(CodingForm);
    }
}
