import React, { useContext } from 'react';
import { TreeSelect } from 'antd';
import { UserDataContext } from '../../contexts/UserDataContext';


const { TreeNode } = TreeSelect;

// SchemeTree creates TreeSelect component
// that corresponds to the received classi-
// -fication (clsf) data received from parent

// Props required -> scheme, titleLabel
function SchemeTree(props) {
    const context = useContext(UserDataContext);

    if (!props.scheme) {
        return <div />;
    }

    let scheme = props.scheme;
    if (typeof(scheme) !== 'object') {
        try{
            scheme = context.schemes.find(o => o.id === scheme);
        }catch(e) {
            console.log(e);
        }
    }

    const nodes = () => {
        // here we create nodes
        let nodes = [];
        let levels = scheme.levels;
        let clsf = scheme.classification;

        try{
            levels = JSON.parse(levels);
        } catch(e) {
            console.log(e);
        }

        // final nodes
        nodes = clsf.filter(o => o.level === levels[levels.length-1]);
        nodes = nodes.map(
            item => (
                <TreeNode
                    key={item.code}
                    value={item.code}
                    title={`${item.code}: ${item[props.titleLabel]}`}
                    leaf
                />
            )
        )
        
        let inx = levels.length - 2;        
        while (inx > -1) {
            let cLevel = levels[inx];
            let branches = clsf.filter(o => o.level === cLevel);

            for (let i in branches) {
                let parent = branches[i].code;
                let childrenCodes = clsf.filter(
                    o => o.parent === parent).map(item => item.code);
            
                let children = nodes.filter(o => childrenCodes.indexOf(o.key) !== -1);
                branches[i] = (
                    <TreeNode
                        key={parent}
                        value={parent}
                        title={`${parent}: ${branches[i][props.titleLabel]}`}
                    >{children.map(item => item)}</TreeNode>
                )
            }
            nodes = branches;
            inx--;
        }

        return nodes;
    }

    return (
        <TreeSelect
            style={{ width: "100%" }}
            onChange={ val => props.onChange(val) }
        >
            {nodes().map(item => item)}
        </TreeSelect>
    )
}
export default SchemeTree;