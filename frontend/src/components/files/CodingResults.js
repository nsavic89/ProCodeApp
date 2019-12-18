import React, { useContext } from 'react';
import { UserDataContext } from '../../contexts/UserDataContext';
import { Loading } from '../Loading';
import { Table } from 'antd';
import { useTranslation } from 'react-i18next';



const styling = {
    table: {
        marginTop: 25
    }
}



// shows results of coding of a file
function CodingResults(props) {
    const context = useContext(UserDataContext);
    const { t } = useTranslation();

    if (!context.loaded){
        return(
            <div>
                { Loading }
            </div>
        )
    }

    let fileID = parseInt(props.match.params.id);
    let file = context.files.find(o => o.id === fileID);
    let myCoding = context.myCoding.filter(o => o['my_file'] === fileID)

    // columns for table below
    const columns = [
        {
            title: t('files.results.column-input'),
            dataIndex: 'text',
            key: 'text'
        }, {
            title: t('files.results.column-code'),
            dataIndex: 'code',
            key: 'code'
        }, {
            title: t('files.results.column-title'),
            dataIndex: 'title',
            key: 'title'
        }
    ]

    // dataSource for table below
    let dataSource = [];
    let labelTitle = file.lng === 'en' ? 'title' : 'title_' + file.lng;

    for (let i in myCoding) {
        console.log(myCoding[i])
        let obj = {
            key: i.toString(),
            text: myCoding[i].text
        }

        let output =  myCoding[i].output;
        let codes = [];
        let titles = [];

        for (let o in output) {
            codes.push(<div>{output[o].code}</div>);
            titles.push(<div>{output[o][labelTitle]}</div>);
        }

        obj.code = codes;
        obj.title = titles;

        dataSource.push(obj);
    }

    return(
        <div>
            <h2>
                { t('files.results.page-title') }
            </h2>
            <Table
                style={styling.table}
                columns={columns}
                dataSource={dataSource}
            />
        </div>
    )
}
export default CodingResults;