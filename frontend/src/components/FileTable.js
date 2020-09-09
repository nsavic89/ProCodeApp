import React, { useContext, useState, useEffect } from 'react';
import {
    Button,
    Spin,
    Table,
    message,
    Drawer,
    Form,
    Input,
    Tag,
    Result,
    Row,
    Col,
    Switch,
    Popconfirm,
    Modal,
    Radio,
    Alert
} from 'antd';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeftOutlined,
    PlusCircleOutlined,
    DeleteTwoTone,
    DownloadOutlined,
    FireOutlined,
    RetweetOutlined
} from '@ant-design/icons';
import CodesSelect from './CodesSelect';
import { UserContext } from '../contexts/UserContext';
import axios from 'axios';
import CodingDrawer from './CodingDrawer';
import RecodingDrawer from './RecodingDrawer';

/*
    based on my file id loads
    data and shows in a table
    allows addition of new data
    and removing existing
*/

export default function FileTable(props) {
    const [state, setState] = useState({data: [], update:0});
    const [searched, setSearched] = useState("");
    const { t, i18n } = useTranslation();
    const context = useContext(UserContext);
    const headers = {
        Pragma: "no-cache",
        Authorization: 'JWT ' + localStorage.getItem('token')
    };

    const title = (
        ['en', 'en-US'].indexOf(i18n.language) === -1 ?
        `title_${i18n.language}` : 'title'
    )


    // try to find data corresponding to props.file id
    // if not found -> axios request get data
    useEffect(() => {
        // this will collect all promises that we need to resolve
        // first we must load data for file (if not already loaded)
        // later classification codes for each classification for which
        // the data was coded -> because we must know their titles
        const headers = {
            headers: {
                Pragma: "no-cache",
                Authorization: 'JWT ' + localStorage.getItem('token')
            }};

        let fileDataLoaded = false;
        let promises = [];

        if (props.myfile in context.data.myFileData) {
            let data = context.data.myFileData[props.myfile];
            fileDataLoaded = true;
            setState({ ...state, data: data });
        } else {
            // if file data not loaded
            let url = `${context.API}/app/file-data/pk=${props.myfile}/`;
            promises.push(axios.get(url, headers));
        }

        // now check if classification codes are loaded
        let clsf = [];
        try {
            let myfile = context.data.myfiles.find(o => o.id === props.myfile);
            clsf = JSON.parse(myfile.classifications);
        }
        catch(e) {console.log(e)}

        // add promises for classifications against which file was coded
        for (let c in clsf) {
            let url = `${context.API}/app/codes/ref=${clsf[c]}/`;
            promises.push(axios.get(url, headers));
        }

        if (promises.length > 0) {
            Promise.all(promises)
                .then(
                    res => {
                        // if any of the res data has status not equal to 200
                        // this means something not found
                        // result in the error
                        let status = res.map(item => item.status);
                        let statusNot200 = status.map(item => item !== 200);

                        if (statusNot200.indexOf(true) > -1) {
                            let error = status[statusNot200.indexOf(true)];
                            setState({ error: error, loading: false });
                            return;
                        }

                        // the following code only if all res[i].status === 200
                        let newState = { loading: false };
                        let inx = 0;

                        // file data
                        if (!fileDataLoaded) {
                            let data = {...context.data.myFileData};
                            data[props.myfile] = res[0].data;
                            context.fun.updateData('myFileData', data);
                            newState.data = res[0].data;
                            inx = 1;
                        } else {
                            newState.data = context.data.myFileData[props.myfile];
                        }

                        let codes = {...context.data.codes};
                        let clsf_inx = 0; // because it must cover all clsf of file from beginning

                        for (let i = inx; i < promises.length; i++) {
                            codes[clsf[clsf_inx]] = res[i].data;
                            clsf_inx++;
                        }
                        
                        context.fun.updateData('codes', codes);
                        setState(newState);
                    })
                .catch(
                    e => {
                        console.log(e);
                        if (e.response) {
                            setState({
                                loading: false,
                                error: e.response.status
                            })
                        }
                    }
                )
        }
    }, [state.update])

    // if loading then spin
    if (state.loading) {
        return(
            <div style={{ marginTop: 150, textAlign: "center" }}>
                <Spin tip={t('messages.loading')} />
            </div>
        )
    } else if (state.error) {
        return(
            <div>
                <Result
                    status="500"
                    title={state.error}
                    subTitle={t('messages.sth-went-wrong')}
                />
            </div>
        )
    }

    // delete a row in table
    const handleDelete = pk => {

        axios.delete(
            `${context.API}/app/my-file-data/${pk}/`,
            {headers: {
                Pragma: "no-cache",
                Authorization: 'JWT ' + localStorage.getItem('token')
            }}
        ).then(
            () => {
                // updata state
                let data = [...state.data];
                data = data.filter(o => o.id !== pk);

                // updata context
                let myFileData = {...context.data.myFileData};
                myFileData[props.myfile] = data;
                context.fun.updateData('myFileData', myFileData);

                // show message
                message.warning(t('messages.data-deleted-message'));
                setState({...state, data: data});
            }
        ).catch(
            e => {
                console.log(e);
                if (e.response) {
                    setState({...state, error: e.response.status});
                }
            }
        )

        // update state
        let data = [...state.data];
        data = data.filter(o => o.id !== pk);
        setState({...state, data: data});
    }

    // if loaded then we create columns
    let columns = [{
        title: ".",
        dataIndex: "action",
        key: "action"
    }];
    let dataSource = [];

    let variables = [];
    if ( !state.error && !state.loading ) {
        const myFile = context.data.myfiles.find(o=>o.id===props.myfile);
        variables = JSON.parse(myFile.variables);

        // populate columns
        for (let i in variables) {
            let column = {
                title: variables[i],
                dataIndex: variables[i],
                key: variables[i],
            };
            columns.push(column);
        }

        // if coded against classifications
        let clsf = {};

        try {clsf = JSON.parse(myFile.classifications)}
        catch(e) {console.log("cannot parse JSON in line 91")}

        for (let i in clsf) {

            let shortName = "";
            try {
                shortName = context.data.classifications
                            .find(o => o.reference === clsf[i])
                            .short
            }catch(e){console.log(e)}

            let column = {
                title: shortName,
                dataIndex: clsf[i],
                key: clsf[i],
            };
            columns.push(column);
        }

        // populate data source
        // dataList is file data...every row
        let dataList = state.data ? [...state.data] : [];
        for (let i in dataList) {
            // one row = data
            let data = dataList[i];
            // codes of the row as json {"clsf_ref": [code1, code2], "clsf_ref2"...}
            let codes = JSON.parse(data.codes);
            // other columns
            data = JSON.parse(data.data);

            // if search field is not empty
            // we filter the dataList
            if (searched) {
                let text = "";
                for (let key in data) {
                    text = text + " " + data[key];
                }
                text = text.toLowerCase();
                if (!text.includes(searched.toLowerCase())) {
                    continue;
                }
            }


            data.key = i;
            // classification codes for each clsf in json
            // appends clsf: codes to data (see above)
            // so one object contains all data needed as dataSource
            // for antd Table component later (see below)
            for (let clsf in codes) {
                data[clsf] = codes[clsf].map(
                    (item, inx) => (
                          item === 'None' ?
                          <div />
                          :<div 
                              key={item}
                          >
                              <Tag color={inx===0 ? 'geekblue': 'orange'}>
                                  {item}
                              </Tag> <span>{
                                  context.data.codes[clsf].find(
                                      o => o.code === item
                                  )[title]
                              }</span>
                          </div>
                        )
                    );
                data[clsf].push(
                    <div key={clsf}>
                        <Button
                            size="small" type="primary"
                            danger ghost style={{ marginTop: 5 }}
                            onClick={
                                () => setState({
                                        ...state,
                                        modify: [i, clsf]}
                                    )}
                        >
                            {t('modify')}
                        </Button>
                    </div>)
            }

            data.action = (
                <Popconfirm
                    title={t('messages.are-you-sure')}
                    onConfirm={() => handleDelete(dataList[i].id)}
                    okText={t('yes')}
                    cancelText={t('no')}
                >
                    <Button
                        style={{ border: "none" }}
                        size="small"
                    >
                        <DeleteTwoTone twoToneColor="#f5222d" />
                    </Button>
                </Popconfirm>
            )
            dataSource.push(data);
        }
    }

    // add new (or submit) function for form in drawer
    const handleAddNewFinish = values => {
        // myFileData instance includes
        // data as textfield (json)
        // classifications with coded cls codes (json)
        const obj = {
            parent: props.myfile,
            data: JSON.stringify(values),
            classifications: "{}"
        }

        axios.post(
            `${context.API}/app/my-file-data/`,
            obj,
            {headers: headers}
        ).then(
            res => {
                // update state and context
                let dataList = [...state.data];
                dataList.unshift(res.data);

                // context ->
                let myFileData = {...context.data.myFileData};
                myFileData[props.myfile] = dataList;
                context.fun.updateData('myFileData', myFileData)

                setState({
                    ...state,
                    data: dataList,
                    addNewDrawer: false
                });
                message.success(t('messages.data-added-message'));
            }
        ).catch(
            e => {
                console.log(e);
                if (e.response) {
                    setState({
                        ...state,
                        error: e.response.status,
                        addNewDrawer: false
                    });
                }
            }
        )
    }

    // Modify predicted codes
    // in case that a code does not correspond to the coded text
    // end-user may modify it and provide a feedback
    function getCodesForModal(row, clsf) {
        /*
            this function will by using row and clsf
            extract codes for the given classification
            from the data in state

            * required for the modal below to list codes
        */
        let data = {...state.data[row]};
        data.codes = JSON.parse(data.codes);
        let codes = data.codes[clsf];
        return codes;
    }

    function getTitleByCode(clsf, code) {
        let codes = context.data.codes[clsf];
        code = codes.find(o => o.code === code);

        // BUG FIX: CANNOT READ PROPERTY 'title_fr' OF UNDEFINED
        // PATCH
        if (!code) {return ""}

        let titleLng = code[title];
        if (titleLng.length > 100) {
            titleLng = titleLng.substr(0,97) + '...';
        }
        return titleLng;
    }

    const radioStyle = {
        display: 'block',
        height: '30px',
        lineHeight: '30px'
      };
    const handleFeedback = () => {
        /*
            this function is executed on OK button in the
            modify model below

            * it uses feedback value in state
            and sends it through post request to be merged with
            the training dataset of this user for a given classification

            * it also updates the data of this fil
            replaces the given code(s) with the selected one
        */
        // spin while this action take place
        // state will set waitResponse to true
        // after it finishes it goes back to state with waitResponse === false
        setState({...state, waitResponse: true});
        const codeForFeedback = state.feedback; // code for feedback - selected in modal
        let modify = [...state.modify];         // modify 0 - row in table | modify 1 - clsf
        const row = modify[0];
        const clsf = modify[1];
        const data = [...state.data];           // all data of the considered file
        let dataFile = data[row];

        // update code regarding the provided feedback
        dataFile.codes = JSON.parse(dataFile.codes);
        dataFile.codes[clsf] = [codeForFeedback];
        dataFile.codes = JSON.stringify(dataFile.codes);

        let promises = [];

        // promise sent to update row (data-file) in table (file)
        promises.push(axios.put(
            `${context.API}/app/my-file-data/${dataFile.id}/`,
            dataFile,
            {headers: headers}
        ))

        // feedback
        const myfile = context.data.myfiles.find(o => o.id === props.myfile);
        const codedVar = JSON.parse(myfile['coded_variables'])[clsf];

        // if this variable has been coded
        // if recoded it has no text that was coded
        // and thus a feedback cannot be sent
        if (codedVar) {
            const text = JSON.parse(data[row].data)[codedVar];
            const level = context
                            .data
                            .codes[clsf]
                            .find(o => o.code === codeForFeedback)
                            .level;

            const feedback = {
                user: context.data.user.username,
                text: text,
                classification: clsf,
                code: codeForFeedback,
                language: myfile.language,
                level: level
            }
            promises.push(axios.post(
                `${context.API}/app/feedback/`,
                feedback,
                {headers: headers}
            ))
        }

        // resolve promises
        Promise
            .all(promises)
            .then(
                res => {
                    // update state and context
                    const update = res[0].data;
                    let data = [...state.data];
                    data[row] = update;
                    let myFileData = {...context.data.myFileData};
                    myFileData[props.myfile] = data;
                    context.fun.updateData('myFileData', myFileData);
                    setState({...state, data: data, modify: false, waitResponse: false});
                })
            .catch(
                e => console.log(e)
            )
    }

    const ModifyCodeModal = (
        <Modal
            title={t('modify-modal.title')}
            visible={state.modify && state.modify !== false}
            onCancel={() => setState({ ...state, modify: false })}
            cancelText={t('cancel')}
            okText={t('submit')}
            width={800}
            onOk={handleFeedback}
            style={{ top: '25px' }}
        >
            {
                state.waitResponse ?
                <div style={{ textAlign: "center" }}>
                    <Spin tip={t('please-wait')} />
                </div>
                :<div>{
                    state.modify && state.modify !== false ?
                    <div>
                        <Alert
                            type="info"
                            description={t('modify-modal.info')}
                            showIcon
                            style={{ marginBottom: 25 }}
                        />
                        <Radio.Group
                            value={state.radioChecked}
                            onChange={e => setState({
                                ...state,
                                feedback: e.target.value,
                                radioChecked: e.target.value,
                                codesSelect: ""
                            })}
                        >{ getCodesForModal(
                            state.modify[0], state.modify[1]).map(
                                (item, inx) => (
                                    item === "None" ?
                                    <div />
                                    :<Radio
                                        style={radioStyle} value={item} key={item}
                                    >
                                        <Tag color={inx===0 ? 'geekblue':'orange'}>
                                            { item }
                                        </Tag> <span>
                                            { getTitleByCode(state.modify[1], item) }
                                        </span>
                                    </Radio>
                                )
                        )}</Radio.Group>
    
                        <div style={{
                            marginTop: 15,
                            marginBottom: 15,
                            textAlign: "center"
                        }}>
                            {t('modify-modal.or')}
                        </div>
    
                        <div>
                            <Form.Item
                                label={t('modify-modal.codes-select')}
                                labelAlign="left"
                                labelCol={{span: 24}}
                            >
                               <CodesSelect
                                    title={title}
                                    reference={state.modify[1]}
                                    additionalProps={{value: state.codesSelect}}
                                    handleChange={
                                        value => {
                                            setState({
                                                ...state,
                                                feedback: value,
                                                radioChecked: "",
                                                codesSelect: value
                                            })
                                        }}
                               />
                           </Form.Item>
                        </div>
                    </div>
                    : <div />
                }</div>
            }
        </Modal>)



    
    // handle search entry
    // filter those records that contain entered criteria
    const handleSearch = e => {
        let input = e.target.value;
        setSearched(input);
    }







    return(
        <div>
            { ModifyCodeModal }
            <Row gutter={4}>
                <Col md={{ span: 4 }}>
                    <Button onClick={props.onClose}>
                        <ArrowLeftOutlined /> { t('back') }
                    </Button>
                </Col>


                <Col md={{ span: 20 }}>
                    <div style={{ textAlign: "right" }}>
                        <Switch
                            checkedChildren={t('scroll-off')}
                            unCheckedChildren={t('scroll-on')}
                            style={{ marginLeft: 5 }}
                            defaultChecked={state.scroll}
                            onChange={() => setState({ ...state, scroll: !state.scroll })}
                        />

                        <Button
                            style={{ marginLeft: 5 }}
                            onClick={() => setState({...state, coding: props.myfile})}
                            type="primary"
                            danger
                            shape="round"
                        >
                            <FireOutlined />
                        </Button>

                        <Button
                            style={{ marginLeft: 5 }}
                            onClick={() => setState({...state, recoding: props.myfile})}
                            type="primary"
                            danger
                            shape="round"
                        >
                            <RetweetOutlined />
                        </Button>

                        <Button
                            style={{ marginLeft: 5 }}
                            onClick={() => window.open(`${context.API}/app/download/pk=${props.myfile}/`)}
                            type="primary"
                            shape="round"
                        >
                            <DownloadOutlined />
                        </Button>

                        <Button
                            type="dashed"
                            style={{ marginLeft: 5 }}
                            onClick={() => setState({...state, addNewDrawer: true})}
                            shape="round"
                        >
                            <PlusCircleOutlined /> {t('my-files-view.add-new')}
                        </Button>
                    </div>
                </Col>
            </Row>
            <Row style={{ marginTop: 25 }}>
                <Col xs={{ span: 24 }} xl={{ span: 12 }}>
                    <Input.Search onChange={handleSearch} placeholder={t('search')} />
                </Col>
            </Row>
            <div style={{ marginTop: 2 }}>
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    scroll={ state.scroll ? { x: "100vw" }: false }
                    pagination={{ position: ["topRight"], size: "small" }}
                />
            </div>

            {/* add new row drawer using variables of myfile as input fields */}
            <Drawer
                title={t('my-files-view.add-new')}
                placement="right"
                visible={state.addNewDrawer}
                onClose={() => setState({...state, addNewDrawer: false})}
                width={400}
            >
                <Form onFinish={handleAddNewFinish}>
                    {
                        variables.map(
                            item => (
                                <Form.Item
                                    key={item}
                                    name={item}
                                    label={item}
                                    labelCol={{span:24}}
                                    labelAlign="left"
                                >
                                    <Input />
                                </Form.Item>
                            )
                        )
                    }
                    <Form.Item>
                        <Button htmlType="submit" type="primary">
                            {t('submit')}
                        </Button>
                    </Form.Item>
                </Form>
            </Drawer>

            {/* coding drawer */}
            <CodingDrawer
                visible={state.coding && state.coding !== false}
                onClose={() => setState({...state, coding: false})}
                myfile={props.myfile}
                onCodingFinish={() => {setState({ ...state, coding: false, update:state.update+1 })}}
            />

            {/* transcodign drawer */}
            <RecodingDrawer
                visible={state.recoding && state.recoding !== false}
                onClose={() => setState({...state, recoding: false})}
                myfile={props.myfile}
                onCodingFinish={() => {setState({ ...state, recoding: false, update:state.update+1 })}}
            />
        </div>
    )
}
