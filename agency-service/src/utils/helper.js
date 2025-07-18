
import crypto from 'crypto';


/**
 * Helper to generate request token (SHA-512)
 */
export const generateRequestToken = ({ affcode, requestId, agentcode, sourceCode, sourceIp }) => {
    const tokenString = affcode + requestId + agentcode + sourceCode + sourceIp;
    return crypto.createHash('sha512').update(tokenString).digest('hex');
};
