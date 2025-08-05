
import CryptoJS from 'crypto-js';


export const generateRequestId=() =>{
    let id = 'A';
    for (let i = 0; i < 15; i++) {
        id += Math.floor(Math.random() * 10); 
    }
    return id;
}

export const generateRequestToken=(AFFCODE,requestId,AGENT_CODE,SOURCE_CODE,sourceIp)=> {
     const requestTokenString = `${AFFCODE}${requestId}${AGENT_CODE}${SOURCE_CODE}${sourceIp}`;
     const requestToken = CryptoJS.SHA512(requestTokenString).toString();
  
  return requestToken;
}