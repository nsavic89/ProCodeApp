import React, { useContext } from 'react';
import { UserDataContext } from '../../contexts/UserDataContext';
import { Loading } from '../Loading';
import { Icon, Table, Button } from 'antd';


const styling = {
    table: {
        marginTop: 50
    },
    action: {
        margin: 1,
        border: "none",
        boxShadow: "none"
    }
}

// shows data contained in a file
function FileDataView(props) {
    const fileID = parseInt(props.match.params.id);
    const context = useContext(UserDataContext);

    if (!context.loaded) {
        return (
            <div>{ Loading }</div>
        )
    }

    const myFile = context.files.find(o => o.id === fileID);

    // create columns and datasource
    let columns = JSON.parse(myFile.variables).map(
        (item, inx) => (
            {
                title: item[0].toUpperCase() + item.substr(1, item.length),
                key: item,
                dataIndex: `var${inx+1}`
            }
        )
    )
    columns.unshift(
        {
            title: ".",
            key: "action",
            dataIndex: "action",
            width: 125
        }
    )

    let dataSource = [...myFile['my_data']];
    for (let i in dataSource) {
        dataSource[i].action = (
            <div>
                <Button
                    size="small"
                    type="primary"
                    style={styling.action}
                    ghost
                >
                    <Icon type="edit" />
                </Button>
                <Button
                    size="small"
                    type="danger"
                    style={styling.action}
                    ghost
                >
                    <Icon type="delete" />
                </Button>
            </div>
        )
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

            <Table 
                style={styling.table}
                columns={columns}
                dataSource={dataSource}
            />
        </div>
    )
}
export default FileDataView;