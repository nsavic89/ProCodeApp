import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserDataContext } from '../../contexts/UserDataContext';
import { Loading } from '../Loading';
import { Icon, Table } from 'antd';


const styling = {
    action: {
        textAlign: "right"
    },
    downloadBtn: {
        borderRadius: 0
    },
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
            title: '',
            dataIndex: 'starting',
            key: 'starting'
        }, {
            title: startingScheme,
            dataIndex: 'startingTitle',
            key: 'startingTitle'
        }, {
            title: '',
            dataIndex: 'end',
            key: 'end'
        }, {
            title: endScheme,
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

    // url for download of excel file
    const url = `${process.env.REACT_APP_API_URL}/download-transcoding/${fileID}/`;
    return (
        <div>
            <h2>
                { t('files.results.page-title-trans') }
            </h2>
            <div style={styling.action}>
                <button
                    className="success-btn"
                    style={styling.downloadBtn}
                    onClick={() => window.open(url)}
                >
                    <Icon type="download"/> {t('general.download')}
                </button>
            </div>
            <Table
                style={styling.table}
                dataSource={dataSource}
                columns={columns}
            />
        </div>
    )
}
export default TranscodingResults;