
import CryptoJS from 'crypto-js';
import axios from "axios";

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


export const generateFDIAccessToken = async(req,res)=>{
    let data = JSON.stringify({
        "api_key": "fec6eb42-30e0-4868-ab6c-46dfa78718b4",
        "api_secret": "74a0dd2d-ee5c-4067-aa81-fb5eb8400102"
      });
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://sb-api.efashe.com/rw/v2/auth',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
      
    const accesstoken=await  axios.request(config)
      .then((response) => {
        
        const token=JSON.stringify(response.data.data.accessToken)
        //console.log(JSON.stringify(response.data.data.accessToken));
        return token
       
      })
      .catch((error) => {
        return JSON.stringify({
            responseCodeCode:error.response.status,
            communicationStatus:"FAILED",
            error: error.message,
          });  
      });
      
      return  accesstoken
};