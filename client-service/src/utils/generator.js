import axios from "axios";


export const generateMomoToken=async(req,res) =>{
  let data = JSON.stringify({
        "appId": "59505C96-DCC6-4E66-840A-A49654D30C26",
        "secret": "81D78194-4A3E-4D30-BF8D-665E0D52978F"
      });
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://payments-api.fdibiz.com/v2/auth',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
      
    const accesstoken=await  axios.request(config)
      .then((response) => {
        
        const token=JSON.stringify(response.data.data.token)
        //console.log(JSON.stringify(response.data.data.accessToken));
        return token
       
      })
      .catch((error) => {
        return res.status(500).json({
            successs:false,
            message: error.message,
          });  
      });
      
      return  accesstoken
}


//for Efashe
export const generateAccessToken = async(req,res)=>{
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
            success:false,
            message: error.message,
          });  
      });
      
      return  accesstoken
};
