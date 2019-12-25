import React from 'react';
import { Icon } from 'antd';


export const Loading = (
    <div style={{
        textAlign: "center",
        color: "#1890ff",
        fontSize: 36
    }}>
        <Icon type="loading" />
    </div>
)

export const LoadingPage = (
    <div
        style={{
            textAlign: "center",
            color: "white",
            fontSize: 36,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
            minHeight: 500,
            background: "rgb(30,30,30,0.75)",
            paddingTop: "25vh",
            zIndex: 1
        }}
    >
        <Icon type="loading" /> <span style={{ fontSize: 14 }}>
            please wait / attendez svp / warten Sie bitte / attendere un momento
        </span>
    </div>
)