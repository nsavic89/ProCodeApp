import React, {createContext, useState} from 'react';
import axios from 'axios';


export const UserContext = createContext({});

export default function UserContextProvider(props) {

    // if classifications not loaded then classifications: false
    const [ state, setState ] = useState({});

    // here any data loaded will be stored
    // codes is object containing classification codes
    // as a list for a key as classification reference
    const [ data, setData ] = useState({
        codes: {},
        myFileData: {}
    });

        
    // check if dev or production
    const isProduction = () => {
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
            return false;
        }
        return true;
    }

    // get headers for axios requests
    const headers = () => {
        return {
            Pragma: "no-cache",
            Authorization: 'JWT ' + localStorage.getItem('token')
        }
    }

    // API URL
    const API = isProduction() ? 
                'http://api.pro-code.ch'
                : 'http://localhost:8000'

    // laod classifications
    if (!state.classifications) {
        axios.get( 
            `${API}/classifications/`,
            { headers: headers() }
        ).then(
            res => {
                setData({ ...data, classifications: res.data })
                setState({ ...state, classifications: true });
            }
        )
    }

    const updateData = (key, values) => {
        let newData = {...data}
        newData[key] = values;
        setData(newData);
    }


    // styling 
    // form style
    const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            md: { span: 8 },
            lg: { span: 6 }
        },
        wrapperCol: { 
            xs: { span: 24 },
            md: { span: 16 },
            lg: { span: 12 }
         },
    }
    // for buttons and other elements without label
    const tailItemLayout = {
        wrapperCol: { 
            xs: { span: 24 },
            md: { span: 16, offset: 8 },
            lg: { span: 12, offset: 6 }
         },
    }

    return(
        <UserContext.Provider 
            value={{
                state: {...state},
                data: {...data},
                API: API,
                fun: {
                    updateData: updateData
                },
                styling: {
                    formItemLayout: formItemLayout,
                    tailItemLayout: tailItemLayout
                }
            }}
        >
            { props.children }
        </UserContext.Provider>
    )
}