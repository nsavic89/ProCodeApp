import React, { useContext, useState } from 'react';
import { UserDataContext } from '../../contexts/UserDataContext';
import { Loading } from '../Loading';
import { Icon, Table, Button, Popconfirm, message, Modal, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';


const styling = {
    addNewBtn: {
        marginTop: 25
    },
    table: {
        marginTop: 15
    },
    action: {
        margin: 1,
        border: "none",
        boxShadow: "none"
    },
    actionDelete: {
        color: "#f5222d"
    }
}

// shows data contained in a file
function FileDataView(props) {
    const fileID = parseInt(props.match.params.id);
    const context = useContext(UserDataContext);
    const { t } = useTranslation();
    const [state, setState] = useState({
        visible: false
    });
    const { getFieldDecorator } = props.form;

    if (!context.loaded) {
        return (
            <div>{ Loading }</div>
        )
    }

    const myFile = context.files.find(o => o.id === fileID);

    // create columns and datasource
    const variables = JSON.parse(myFile.variables);
    let columns = variables.map(
        (item, inx) => (
            {
                title: item[0].toUpperCase() + item.substr(1, item.length),
                key: item,
                dataIndex: `var${inx+1}`
            }
        )
    )
    // add action column at the beginning
    columns.unshift(
        {
            title: ".",
            key: "action",
            dataIndex: "action",
            width: 125
        }
    );

    // delete data in file
    const handleDelete = id => {
        axios.delete(
            `${process.env.REACT_APP_API_URL}/my-data/${id}/`,
            {headers: {
                Pragma: "no-cache",
                Authorization: 'JWT ' + localStorage.getItem('token')
            }}
        ).then(
            () => {
                message.warning(t('messages.data-deleted'));
                context.refreshData();
            }
        ).catch(
            () => message.error(t('messages.request-failed'))
        )
    }

    let dataSource = [...myFile['my_data']];
    for (let i in dataSource) {
        dataSource[i].key = i.toString();
        dataSource[i].action = (
            <div>
                <Button
                    size="small"
                    type="primary"
                    style={styling.action}
                    ghost
                    onClick={() => setState({
                        ...state,
                        editing: dataSource[i],
                        visible: true
                    })}
                >
                    <Icon type="edit" />
                </Button>
                <Popconfirm
                    title={t('messages.are-you-sure')}
                    onConfirm={() => handleDelete(dataSource[i].id)}
                    okText={ t('messages.yes') }
                    cancelText={ t('messages.no') }
                    style={styling.action}
                >
                    <Icon 
                        style={styling.actionDelete }
                        type="delete"
                        key="delete"
                    />
                </Popconfirm>
            </div>
        )
    }

    // save new entry to the file or overpaste updates for the edited one
    const handleSubmit = () => {
        props.form.validateFieldsAndScroll((err, values) => {
            if (!err) { 
                let url = `${process.env.REACT_APP_API_URL}/my-data/`
                let method = "post";
                let data = { ...values, 'my_file': fileID };

                // if updating
                if (state.editing) {
                    url = url + state.editing.id + "/";
                    method = "put";
                    data = {...data, id: state.editing.id}
                }

                // send request
                axios({
                    url: url,
                    method: method,
                    data: data,
                    headers: {
                        Pragma: "no-cache",
                        Authorization: 'JWT ' + localStorage.getItem('token')
                    }
                }).then(
                    () => {
                        if (state.editing) {
                            message.success(t('messages.request-success-update'));
                        } else {
                            message.success(t('messages.request-success'));
                        }
                        setState({
                            visible: false,
                            editing: false
                        });
                        context.refreshData();
                    }
                ).catch(
                    () => message.error( t('messages.request-failed') )
                )
            }
        })
    }

    return(
        <div>
            <h2>
                <Icon 
                    type="file-excel"
                    twoToneColor="#52c41a"
                    theme="twoTone"
                /> { myFile.name }
            </h2>
            
            {/* add new entry to the file / table below */}
            <Button
                style={styling.addNewBtn}
                type="primary"
                ghost
                onClick={() => setState({ visible: true })}
            >
                <Icon type="plus" /> { t('general.add-new-btn') }
            </Button>

            <Table 
                style={styling.table}
                columns={columns}
                dataSource={dataSource}
            />

            {/* modal for editing of a file row (entry) */}
            <Modal
                visible={state.visible}
                title={t('files.modal-editing-title')}
                okText={t('general.submit')}
                onCancel={() => setState({
                    visible: false,
                    editing: false
                })}
                onOk={handleSubmit}
            >
                <Form>
                    {variables.map(
                        (item, inx) => (
                            <Form.Item
                                key={item}
                                label={item[0].toUpperCase()+item.substr(1, item.length)}
                            >
                                { getFieldDecorator(`var${inx+1}`, {
                                    rules: [
                                        {
                                            required: true,
                                            message: t('messages.field-obligatory')
                                        }
                                    ],
                                    initialValue: state.editing ? state.editing[`var${inx+1}`] : ""
                                }) (
                                    <Input />
                                ) }
                            </Form.Item>
                        )
                    )}
                </Form>
            </Modal>
        </div>
    )
}
export default Form.create() ( FileDataView );