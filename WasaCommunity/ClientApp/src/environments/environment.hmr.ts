export const environment = {
    production: false,
    hmr: true,
    baseUrl: 'https://localhost:5001', // Change this to the address of your backend API if different from frontend address
    tokenUrl: 'https://localhost:5001', // For IdentityServer/Authorization Server API. You can set to null if same as baseUrl
    loginUrl: '/Login'
   };
