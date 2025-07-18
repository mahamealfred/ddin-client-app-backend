import Joi from "joi";

const validateClientMomoTopUp = (data) => {
 const schema = Joi.object({
  
    phoneNumber: Joi.number()
    .integer()
    .min(100000000000)   // Smallest 12-digit number
    .max(999999999999)   // Largest 12-digit number
    .required()
    .messages({
      'number.base': 'Phone number must be a number',
      'number.min': 'Phone number must be exactly 12 digits',
      'number.max': 'Phone number must be exactly 12 digits',
    }),
  
  });

  return schema.validate(data);
};

const validatelogin = (data) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};

export {validatelogin,validateRegistration}