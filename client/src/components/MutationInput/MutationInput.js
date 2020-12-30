import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import './MutationInput.scss';


const MutationInput = ({refetch, mutationType, dataTitle, dataKey, maxLength, placeholder, inputVariable, customVariables}) => {
    const [text, setText] = useState('');
    const [errorState, setError] = useState(null);
    const [mutation] = useMutation(mutationType);
    const [message, setMessage] = useState(null);
    const [shouldDisplayOnTimeout, setShouldDisplayOnTimeout] = useState(false);

    const handleTextChange = (e) => {
        setError(null);
        setText(e.target.value);
    }

    const enterPressed = (e, targetFunc) => {
        let code = e.keyCode || e.which;
        if(code === 13) { 
            targetFunc()
        } 
    }

    useEffect(() => {
        let timeout = null;
        if(shouldDisplayOnTimeout){
            timeout = setTimeout(() => {
                setMessage(null);
            }, 2000)
        }
        return () => clearTimeout(timeout);
    })

    const handleSubmit = async () => {
        try{
            // Validate input
            if(text === ''){
                throw new Error(`${dataTitle} cannot be empty`);
            }

            let inputVarObj = {[inputVariable]: text};

            let variableObj = customVariables ? Object.assign({}, inputVarObj, ...customVariables) : inputVarObj;

            let result = await mutation({ variables: variableObj });

            setText('')

            if(result.data[dataKey].success){
                setMessage(result.data[dataKey].message)
                setShouldDisplayOnTimeout(true)
                refetch();
            } else{
                throw new Error(result.data[dataKey].message)
            }
        } catch(err){
            setError(err.message);
        }
    }

    return(
        <div className='mutationInputContainer'>
            <div className='section'>
                <h3>{dataTitle}</h3>
                <input 
                    maxLength={maxLength} 
                    value={text} 
                    onChange={(e) => handleTextChange(e)} 
                    placeholder={placeholder}
                    onKeyPress={(e) => enterPressed(e, handleSubmit)}
                />
                <button className="_btn submitButton" onClick={() => handleSubmit()}>{dataTitle}</button>
            </div>
            <div className="info">
                { errorState &&
                    <div className='error'>{errorState}</div>
                }
                { message &&
                    <div className='success'>{message}</div>
                }
            </div>
        </div>
    )
}

export default MutationInput;