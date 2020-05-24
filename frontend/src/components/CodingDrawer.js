import React, { useContext, useState } from 'react';
import { 
    Drawer,
    Select,
    Form,
    Spin,
    Radio,
    Alert,
    Button
} from 'antd';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../contexts/UserContext';
import axios from 'axios';


// used for MyFiles for an action button (footer of file)
// and within FileTable to open a drawer and set parameters
export default function CodingDrawer(props) {
    
    const { t } = useTranslation();
    const context = useContext(UserContext);
    const [ state, setState ] = useState({})

    const headers = {
        Pragma: "no-cache",
        Authorization: 'JWT ' + localStorage.getItem('token')
    }

    // styling
    let styling = {...context.styling};
    styling.formItemLayout.wrapperCol.lg = {span: 16};
    styling.tailItemLayout.wrapperCol.lg = {span: 16, offset: 6};


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

    // when classification select changes
    // loads codes in context data 
    // sets levels needed to populate the corresponding 
    // field in the drawer in return method
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
                console.log("Codes of this cls found in context")
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


    // handle submit button in form
    // runs coding
    const handleSumit = values => {
        // loading spin while waiting to resolve/reject promise
        setState({ ...state, coding: true });
        values['my_file'] = props.myfile;
        
        // post request
        axios.post( 
            `${context.API}/app/coding/`,
            values,
            { headers: headers })
        .then(
            res => {
                // update state and context
                let dataList = {...context.data.myFileData};
                dataList[props.myfile] = res.data;
                context.fun.updateData('myFileData', dataList);
                
                // close drawer
                props.onCodingFinish();
                setState({
                    ...state,
                    coding: false
                });
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
    console.log(context.data.myfiles)
    if (props.visible) {
        variables = JSON.parse(context.data.myfiles
                    .find(o => o.id === props.myfile)
                    .variables);
    }

    // coding form
    const CodingForm = (<div>
        <Alert
            type="info"
            message={t('coding-drawer.info')}
            showIcon
            style={{ marginBottom: 25 }}
        />
        <Form {...styling.formItemLayout}
            onValuesChange={handleValueChange}
            onFinish={handleSumit}
        >
            <Form.Item
                name="classification"
                label={t('coding-view.classification')}
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
                name="level"
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
            <Form.Item {...styling.tailItemLayout}>
                <Button type="primary" danger htmlType="submit">
                    {t('coding-view.button')}
                </Button>
            </Form.Item>
        </Form>
    </div>)

    return(
        <Drawer
            title={t('coding-drawer.title')}
            placement="right"
            visible={props.visible}
            onClose={props.onClose}
            width={550}
        >
            { state.coding ? 
                <div style={{ marginTop: 100, textAlign: "center" }}>
                    <Spin tip={t('coding-view.predicting-spin')} />
                </div>
                : CodingForm 
            }
        </Drawer>
    )
}