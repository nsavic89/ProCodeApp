import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserDataContext } from '../../contexts/UserDataContext';
import { Loading } from '../Loading';
import { Table } from 'antd';


const styling = {
    table: {
        marginTop: 25
    }
}


// presents results of transcoding between two schemes
// for uploaded files
function TranscodingResults(props) {

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
    let myCoding = context.myTranscoding.filter(
            o => o['my_file'] === fileID
        );
    let startingScheme = context.schemes.find(
            o => o.id === myCoding[0].starting.scheme
        ).name;

    let endScheme = context.schemes.find(
            o => o.id === myCoding[0].output[0].scheme
        ).name;

    // columns for table below
    const columns = [
        {
            title: startingScheme,
            dataIndex: 'starting',
            key: 'starting'
        }, {
            title: '',
            dataIndex: 'startingTitle',
            key: 'startingTitle'
        }, {
            title: endScheme,
            dataIndex: 'end',
            key: 'end'
        }, {
            title: '',
            dataIndex: 'endTitle',
            key: 'endTitle'
        }
    ]

    // dataSource for table below
    let dataSource = [];
    let labelTitle = file.lng === 'en' ? 'title' : 'title_' + file.lng;

    for (let i in myCoding) {
        let obj = {
            starting: myCoding[i].starting.code,
            startingTitle: myCoding[i].starting[labelTitle],
            end: [],
            endTitle: []
        };

        let outputs = myCoding[i].output;
        for (let o in outputs) {
            obj.end.push(
                <div>{outputs[o].code}</div>);

            obj.endTitle.push(
                <div>{outputs[o][labelTitle]}</div>);
        }

        dataSource.push(obj);
    }

    return (
        <div>
            <h2>
                { t('files.results.page-title-trans') }
            </h2>
            <Table
                style={styling.table}
                dataSource={dataSource}
                columns={columns}
            />
        </div>
    )
}
export default TranscodingResults;