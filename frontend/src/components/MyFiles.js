import React, { useContext, useEffect, useState } from 'react';
import { 
    Button,
    Spin,
    Drawer,
    Input,
    Form,
    Radio,
    Upload,
    Card,
    Row,
    Col,
    message,
    Popconfirm,
    Result
} from 'antd';
import { useTranslation } from 'react-i18next';
import {
    UploadOutlined,
    DeleteTwoTone,
    RetweetOutlined,
    SearchOutlined,
    FireOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import { UserContext } from '../contexts/UserContext';
import axios from 'axios';
import FileTable from './FileTable';
import CodingDrawer from './CodingDrawer';
import RecodingDrawer from './RecodingDrawer';


export default function MyFiles() {
    const { t } = useTranslation();
    const context = useContext(UserContext);
    const [ state, setState ] = useState({
        fileList: []
    });

    // headers loads jwt token from localStorage
    const headers = {
        Pragma: "no-cache",
        Authorization: 'JWT ' + localStorage.getItem('token')
    }

    // styling
    let styling = {...context.styling};
    styling.formItemLayout.wrapperCol.lg = {span: 16};
    styling.tailItemLayout.wrapperCol.lg = {span: 16, offset: 6};

    useEffect(() => {
        // on load check if my files are loaded in context
        // if not -> we must send axios request to load them
        if (context.state.myfiles) {
            console.log("Files loaded");
            setState({ loaded: true });
            return;
        }

        console.log("Loading files ->");
        setState({loading: true})
        axios.get(
            `${context.API}/app/my-files/`,
            { headers: headers })
        .then(res => {
                context.fun.updateData('myfiles', res.data);
                setState({ loading: false, loaded: true })
            })
        .catch(e => {
            if(e.response) {
                setState({
                        error: e.response.status,
                        loading: false
                    })
                }
            })
    }, [])

    // if loading then spinner
    if (state.loading) {
        return (
            <div style={{ marginTop: 150, textAlign: "center" }}>
                <Spin tip={t('my-files-view.loading-files-spin')} />
            </div>
        )
    }

    // if we are editing already existing file
    // state must include editing === true
    if (state.editing) {
        return (
            <FileTable
                myfile={state.editing}
                onClose={() => setState({...state, editing: false})}
            />
        )
    }

    // submit http request
    const handleSubmit = values => {
        setState({ ...state, uploading: true });

        let formData = new FormData();
        formData.append('excel', values.excel.file, 'excel');
        formData.append('name', values.name);
        formData.append('info', values.info ? values.info : " ");
        formData.append('language', values.language);
        formData.append('user', 1);

        axios.post(
            `${context.API}/app/my-files/`,
            formData,
            { headers: {
                'content-type': 'multipart/form-data',
                Pragma: "no-cache",
                Authorization: 'JWT ' + localStorage.getItem('token')
            }}
        ).then(
            res => {
                let newFile = res.data;
                let allFiles = [...context.data.myfiles];
                allFiles.unshift(newFile);
                context.fun.updateData('myfiles', allFiles);
                message.success(t('messages.file-uploaded'));

                setState({
                    ...state,
                    uploading: false,
                    drawer: false
                });
            }
        ).catch(e => {
            console.log(e);
            if (e.response) {
                setState({ error: true })
            }
        })
    }

    // handle upload button
    const handleFileUpload = file => {
        let fileList = [...file.fileList];
        fileList = fileList.slice(-1);
        setState({...state, fileList: fileList});
    }

    // uploading form
    const UploadForm = (
        <Form onFinish={handleSubmit}>
            <Form.Item
                {...styling.formItemLayout}
                name="name"
                label={t('my-files-view.upload-form.name')}
                rules={[
                    {
                        required: true,
                        message: t('messages.form.required')
                    }
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                {...styling.formItemLayout}
                name="language"
                label={t('language')}
                rules={[
                    {
                        required: true,
                        message: t('messages.form.required')
                    }
                ]}
            >
                <Radio.Group>
                    <Radio.Button value="ge">
                        { t('languages.german') }
                    </Radio.Button>
                    <Radio.Button value="fr">
                        { t('languages.french') }
                    </Radio.Button>
                    <Radio.Button value="it">
                        { t('languages.italian') }
                    </Radio.Button>
                    <Radio.Button value="en">
                        { t('languages.english') }
                    </Radio.Button>
                </Radio.Group>
            </Form.Item>

            <Form.Item
                {...styling.formItemLayout}
                name="info"
                label={t('my-files-view.upload-form.info')}
            >
                <Input.TextArea />
            </Form.Item>

            <Form.Item
                {...styling.formItemLayout}
                name="excel"
                label={t('my-files-view.upload-form.excel')}
                rules={[
                    {
                        required: true,
                        message: t('messages.form.required')
                    }
                ]}
            >
                <Upload 
                    beforeUpload={() => false}
                    fileList={state.fileList}
                    onChange={handleFileUpload}
                >
                    <Button>
                        <UploadOutlined /> {t('my-files-view.upload')}
                    </Button>
                </Upload>
            </Form.Item>

            <Form.Item
                {...styling.tailItemLayout}
            >
                <Button 
                    htmlType="submit" type="primary" 
                    style={{ width: "100%" }}
                >
                    {t('submit')}
                </Button>
            </Form.Item>
        </Form>
    )

    // delete file
    const handleDeleteFile = pk => {
        axios.delete(
            `${context.API}/app/my-files/${pk}/`,
            { headers: {
                'content-type': 'multipart/form-data',
                Pragma: "no-cache",
                Authorization: 'JWT ' + localStorage.getItem('token')
                }}
            ).then(
                () => {
                    message.warning(t('messages.file-deleted-message'));
                    let myfiles = [...context.data.myfiles];
                    myfiles = myfiles.filter(o => o.id !== pk);
                    context.fun.updateData('myfiles', myfiles);
                }
            ).catch(e => console.log(e))
    }

    const cardScaling = {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 8 },
        lg: { span: 6 }
    }
    let FilesList = "";
    if (state.loaded) {
        FilesList = (
            <Row gutter={16}>
                {context.data.myfiles.map(
                    item => (
                        <Col {...cardScaling} style={{ marginTop: 25 }} key={item.id}>
                            <Card
                                style={{
                                    borderRadius: 5,
                                    boxShadow: "3px 3px 6px 3px #d9d9d9"
                                }}
                                cover={<img src={require('../media/cloud.png')} alt="" />}
                                actions={[
                                    <Popconfirm
                                        title={t('messages.are-you-sure')}
                                        onConfirm={() => handleDeleteFile(item.id)}
                                        okText={t('yes')}
                                        cancelText={t('no')}
                                    >
                                        <DeleteTwoTone twoToneColor="#f5222d" key="del" />
                                    </Popconfirm>,
                                    <FireOutlined
                                        key="code"
                                        onClick={() => setState({...state, coding: item.id})} 
                                    />,
                                    <RetweetOutlined
                                        key="recode"
                                        onClick={() => setState({...state, recoding: item.id})}
                                    />,
                                    <SearchOutlined 
                                        key="open"
                                        onClick={() => setState({...state, editing: item.id})} 
                                    />,
                                    <DownloadOutlined key="download"
                                        onClick={() => window.open(`${context.API}/app/download/pk=${item.id}/`)}
                                    />
                                ]}
                            >
                                <h3>{item.name}</h3>
                                <div style={{ height: 50 }}>
                                    <i>{item.info ? item.info.substr(0,85) + "..." : ""}</i>
                                </div>
                            </Card>
                        </Col>
                    )
                )}
            </Row>
        )
    }

    // when no files uploaded
    const NoFilesResult = (
        <div>
            <Result
                status="warning"
                title={t('messages.no-files-uploaded')}
                extra={
                <Button 
                    type="primary" danger key="console"
                    onClick={ () => setState({...state, drawer: true}) }
                >{t('my-files-view.upload')}
                </Button>
                }
            />
        </div>
    )

    let showFiles = false;
    try {showFiles = context.data.myfiles.length > 0}
    catch (e) {console.log(e)}
    
    return (
        <div>

            <div style={{ 
                borderBottom: "1px solid rgb(220,220,220)",
                paddingBottom: 5
            }}>
                <span style={{ fontSize: 24, fontWeight: 500 }}>
                    { t('my-files') }
                </span>

                <Button 
                    type="primary" 
                    danger
                    style={{ float: "right" }}
                    onClick={ () => setState({...state, drawer: true}) }
                >
                    <UploadOutlined /> { t('my-files-view.upload') }
                </Button>
            </div>

            <div>
                { showFiles ? FilesList : NoFilesResult }
            </div>
            
            {/* upload new file */}
            <Drawer
                title={t('my-files-view.drawer-title')}
                placement="right"
                visible={state.drawer}
                onClose={() => setState({...state, drawer: false})}
                width={550}
            >
                { state.uploading ? 
                    <div style={{ marginTop: 150, textAlign: "center" }}>
                        <Spin tip={t('please-wait')} />
                    </div>
                    : UploadForm
                }
            </Drawer>

            {/* coding drawer */}
            <CodingDrawer 
                visible={state.coding && state.coding !== false}
                onClose={() => setState({...state, coding: false})}
                myfile={state.coding}
                onCodingFinish={
                    () => {
                        let myfile = state.coding;
                        setState({
                            ...state,
                            editing: myfile,
                            coding: false
                        })
                    }}
            />

            {/* transcodign drawer */}
            <RecodingDrawer
                visible={state.recoding && state.recoding !== false}
                onClose={() => setState({...state, recoding: false})}
                myfile={state.recoding}
                onCodingFinish={
                    () => {
                        let myfile = state.recoding;
                        setState({
                            ...state,
                            editing: myfile,
                            coding: false
                        })
                    }}
            />
        </div>
    )
}