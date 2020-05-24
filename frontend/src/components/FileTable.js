import React, { useContext, useState, useEffect } from 'react';
import { Button, Spin, Table, message, Drawer, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { ArrowLeftOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { UserContext } from '../contexts/UserContext';
import axios from 'axios';

/*
    based on my file id loads
    data and shows in a table
    allows addition of new data
    and removing existing
*/

export default function FileTable(props) {
    const [state, setState] = useState({data: []});
    const { t } = useTranslation();
    const context = useContext(UserContext);


    // try to find data corresponding to props.file id
    // if not found -> axios request get data
    useEffect(() => {
        if (props.myfile in context.data.myFileData) {
            console.log("Data found in context");
            let data = context.data.myFileData[props.myfile];
            setState({ ...state, data: data })
            return;

        } else {
            setState({ loading: true });
    
            axios.get(
                `${context.API}/app/file-data/pk=${props.myfile}/`,
                {headers: {
                    Pragma: "no-cache",
                    Authorization: 'JWT ' + localStorage.getItem('token')
                }}
            ).then(
                res => {
                    if (res.status === 200) {
                        // update context
                        let data = {...context.data.myFileData};
                        data[props.myfile] = res.data;
                        context.fun.updateData('myFileData', data);

                        setState({
                            data: res.data,
                            loading: false
                        })
                    }
                }
            ).catch(
                e => {
                    console.log(e);
                    if (e.response) {
                        setState({ error: e.response.status, loading: false })
                    }
                }
            )
        }
    }, [])

    // if loading then spin
    if (state.loading) {
        return(
            <div style={{ marginTop: 150, textAlign: "center" }}>
                <Spin tip={t('messages.loading')} />
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

            let shortName = context.data.classifications
                            .find(o => o.reference === clsf[i])
                            .short

            let column = {
                title: shortName,
                dataIndex: clsf[i],
                key: clsf[i],
            };
            columns.push(column);
        }

        // populate data source
        let dataList = [...state.data];
        for (let i in dataList) {
            let data = dataList[i];
            let codes = JSON.parse(data.codes);

            data = JSON.parse(data.data);
            data.key = i;
            
            // classification codes
            for (let clsf in codes) {
                data[clsf] = codes[clsf].map(
                    item => <span style={{ marginRight: 5 }}>{item}</span>);
            }

            data.action = (
                <Button 
                    ghost danger size="small"
                    onClick={() => handleDelete(dataList[i].id)}
                >
                    {t('delete')}
                </Button>
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
            {headers: {
                Pragma: "no-cache",
                Authorization: 'JWT ' + localStorage.getItem('token')
            }}
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


    return(
        <div>
            <div>
                <Button type="primary" onClick={props.onClose}>
                    <ArrowLeftOutlined /> { t('back') }
                </Button>

                <Button 
                    type="primary" 
                    ghost 
                    onClick={() => setState({...state, addNewDrawer: true})}
                    style={{ marginLeft: 2, float: "right" }}
                >
                    <PlusCircleOutlined /> {t('my-files-view.add-new')}
                </Button>
            </div>

            <div style={{ marginTop: 15 }}>
                <Table 
                    columns={columns}
                    dataSource={dataSource}
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
        </div>
    )
}