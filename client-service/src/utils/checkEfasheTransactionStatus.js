import  axios from "axios";
import { generateAccessToken } from "./generator.js";





export const callPollEndpoint = async (responseData,trxId) => {
  const accessToken = await generateAccessToken();
  //let URL=`https://sb-api.efashe.com/rw${responseData.data.data.pollEndpoint}`
  let URL = `https://sb-api.efashe.com/rw/v2/trx/${trxId}/status`
  
 
  try {
    const response = await axios.get(URL.replace(/\/$/, ''),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.replace(/['"]+/g, '')}`
        },
      }
      );
      if(response.status === 200)return response
    // console.log('Response from poll endpoint:', response.data);
    // Handle response as needed
  } catch (error) {
    console.error('Error calling poll endpoint:', error);
    // Handle error
  }
  return response
};


