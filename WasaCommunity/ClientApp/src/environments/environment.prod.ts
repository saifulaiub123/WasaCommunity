// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================


export const environment = {
  production: true,
  hmr: false,
  baseUrl: 'https://community.wasasweden.se', // Change this to http://wasacommunity-app.westeurope.azurecontainer.io:5000 || https://community.wasasweden.se when deploying
  tokenUrl: 'https://community.wasasweden.se', // For IdentityServer/Authorization Server API. You can set to null if same as baseUrl
  loginUrl: '/Login'
};
