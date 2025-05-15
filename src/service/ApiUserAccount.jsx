import axios from 'axios';
import https from 'https';
import Cookies from 'js-cookie'; // Import js-cookie
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode

const API_URL = process.env.NEXT_PUBLIC_API_TEST_URL;
console.log('API_URL:', API_URL);

const MASTERDATA_URL = process.env.NEXT_PUBLIC_MASTERDATA_TEST_URL;
//console.log('Master Data URL:', MASTERDATA_URL);

const LMS_URL = process.env.NEXT_PUBLIC_LMS_TEST_URL;
//console.log('LMS URL:', LMS_URL);

// Create an HTTPS agent that skips SSL verification
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const ApiClientUserAccount = axios.create({
  baseURL: API_URL,
  httpsAgent,
});

const UserAccountMasterData = axios.create({
  baseURL: MASTERDATA_URL,
  httpsAgent,
});

// Normal (unauthenticated) ApiClientLms
const ApiClientLms = axios.create({
  baseURL: LMS_URL,
  httpsAgent,
});

// Function to get and decode token from cookies
const getDecodedToken = () => {
  const token = Cookies.get('access_token'); // Fetch token from cookies
  if (!token) {
    //console.log('Token is missing in cookies');
    return null;
  }

  try {
    const decodedToken = jwtDecode(token);
    //console.log('Decoded JWT:', decodedToken);
    return decodedToken;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

// Authenticated ApiClientLms with decoded JWT
let AuthenticatedApiClientLms = null;
const decodedToken = getDecodedToken();
if (decodedToken && decodedToken.access) {
  AuthenticatedApiClientLms = axios.create({
    baseURL: LMS_URL,
    headers: {
      Authorization: `Bearer ${decodedToken.access}`, // Use decoded access token
      'Content-Type': 'application/json',
    },
    httpsAgent,
  });
} else {
  //console.log('No valid decoded token available for AuthenticatedApiClientLms');
  // Create an unauthenticated instance as fallback
  AuthenticatedApiClientLms = axios.create({
    baseURL: LMS_URL,
    httpsAgent,
  });
}

// Handle authenticated requests for other clients (optional, based on your needs)
// let AuthenticatedApiClientUserAccount = null;
// let AuthenticatedApiClientUserAccountMasterData = null;

// if (decodedToken && decodedToken.access) {
//   AuthenticatedApiClientUserAccount = axios.create({
//     baseURL: API_URL,
//     headers: {
//       Authorization: `Bearer ${decodedToken.access}`,
//       'Content-Type': 'application/json',
//     },
//     httpsAgent,
//   });

//   AuthenticatedApiClientUserAccountMasterData = axios.create({
//     baseURL: MASTERDATA_URL,
//     headers: {
//       Authorization: `Bearer ${decodedToken.access}`,
//       'Content-Type': 'application/json',
//     },
//     httpsAgent,
//   });
// } 
// else {
//   //console.log('No valid decoded token available for other authenticated clients');
//   AuthenticatedApiClientUserAccount = axios.create({
//     baseURL: API_URL,
//     httpsAgent,
//   });
//   AuthenticatedApiClientUserAccountMasterData = axios.create({
//     baseURL: MASTERDATA_URL,
//     httpsAgent,
  // });
// }

// Export all API clients
export {
  ApiClientUserAccount,
  // AuthenticatedApiClientUserAccount,
  UserAccountMasterData,
  // AuthenticatedApiClientUserAccountMasterData,
  ApiClientLms,
  AuthenticatedApiClientLms,
};