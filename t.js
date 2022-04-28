const http = require("axios")
const querystring = require('querystring')


const headers = {
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  }
};

let data = {
    grant_type: "client_credentials",
    code: "AQDtkhlDZHeA9U5psc3o61NyVuWGMsBe0R-XMtYMMncraPMCbTtvbao68HqXtKQcCK85vG4M3o3O0_M4q-_1wpBZAQRcpcJQ6OM4JknKKyaZ-oGyHpy3v6XKFXQfQK5hRNoh1B9z6Y3-Pu8k23aUQGzsMMJVc_fWPbOa8F5Xbo1Sxbze6IiMDz9xkRXEAyHWMIW1pGisquV41Xq1El8tJxnOkUdrCsBrOclZLVn2yXYOnOgPLpqNzqQGeI4nExi2yiUVwhBtJKOtNKsJmeUFiwdvE7Ap-tMsWdPfHroiSqdJYptpwcVE6jBXpOyxhiSsVgN5HcjFZyIxp4ONcSN7DaUvRlik641mBmC9QvI6KIi3R0bbgg8i5p9-qWVEQg4-rTR5kaRuUvsm1NX2J6-RmGllLuSmQMmrWE0EHItO0B4C0HTqdOUP6lcmb1DnhpkM1nBxAfG3B_s1DunKsPPVdTvonV4B5Yw7y2BeTeEvRD1Z5ggm8df4mFCsup8HNAzvriC8MrYylFQmAz8PQxuE_V1phhiXjl38i-0iIccnpp7uxSp1qQp8udxF5nbk4uzeY12f4pzTA34dfFCPtnGsMc9iF9hVldBsKsQpgOs6DYImqDDArLL_iAlbGLzAcRgUvZ3IMgmnGPvJwnIJIEm8d-IlBKgcvAjQhLqSdTOn99ZXqHjaqMjaqz-qENaXU5x7qPbXVa71PIB5",
  redirectUri: "http://localhost:8000/callback",
  client_id: "7ada486c7ff64752bc36713834e05d52",
  client_secret: "d928da6ef9714362849a91817d1c6e6b",
};

http
  .post(
    "https://accounts.spotify.com/api/token",
    querystring.stringify(data),
    headers
  )
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.log(error);
  });