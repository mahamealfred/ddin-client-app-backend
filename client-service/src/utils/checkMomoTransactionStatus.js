
import dotenv from "dotenv";
import axios  from "axios";
import { generateMomoToken } from "./generator.js";

dotenv.config()





export const callPollEndpoint = async (responseData,trxId) => {
  const accessToken = await generateMomoToken();
  let URL = `https://payments-api.fdibiz.com/v2/momo/trx/${trxId}/info`
  
 
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


