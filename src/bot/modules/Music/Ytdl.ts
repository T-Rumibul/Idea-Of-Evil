import * as ytdl from 'play-dl';
import dotenv from 'dotenv';
//import { YouTube } from 'player-stream-extractor';
dotenv.config();
ytdl.setToken({
  spotify: {
    client_id: process.env.SPOTIFY_CLIENT_ID || '',
    client_secret: process.env.SPOTIFY_CLIENT_SECRET || '',
    refresh_token: process.env.SPOTIFY_REFRESH_TOKEN || '',
    market: 'US',
  },
  youtube: {
    cookie: process.env.YOUTUBE_COOKIES || '',
  },
});

//export const yt_stream = new YouTube()
//yt_stream.headers = {
 // Host: 'music.youtube.com',
//  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0',
 // Accept: '*/*',
 // 'Accept-Language': 'en-US,en;q=0.5',
 // 'Accept-Encoding': 'gzip, deflate, br, zstd',
 // 'Content-Type': 'application/json',
//  Referer: 'https://music.youtube.com/',
 // 'X-Goog-Visitor-Id': 'CgtVSDdNaDVxUms2Zyjl4769BjIiCgJQTBIcEhgSFhMLFBUWFwwYGRobHB0eHw4PIBAREiEgEw%3D%3D',
//  'X-Youtube-Bootstrap-Logged-In': 'true',
//  'X-Youtube-Client-Name': '67',
//  'X-Youtube-Client-Version': '1.20250212.01.00',
//  'X-Goog-AuthUser': '0',
 // 'X-Origin': 'https://music.youtube.com',
//  Origin: 'https://music.youtube.com',
 // 'Sec-Fetch-Dest': 'empty',
 // 'Sec-Fetch-Mode': 'cors',
//  'Sec-Fetch-Site': 'same-origin',
 // Authorization: 'SAPISIDHASH 1739567602_38944bf6133f64e3ea8616e319cf396cf04ef9e6_u SAPISID1PHASH //1739567602//38944bf6133f64e3ea8616e319cf396cf04ef9e6_u SAPISID3PHASH 1739567602_38944bf6133f64e3ea8616e319cf396cf04ef9e6_u',
  //Connection: 'keep-alive',
  //'Alt-Used': 'music.youtube.com',
 // Cookie: 'VISITOR_PRIVACY_METADATA=CgJQTBIcEhgSFhMLFBUWFwwYGRobHB0eHw4PIBAREiEgEw%3D%3D; PREF=f6=40000000&tz=Europe.Warsaw&repeat=NONE&f7=100; SOCS=CAISNQgREitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjUwMjEwLjA2X3AwGgJlbiACGgYIgMmvvQY; VISITOR_INFO1_LIVE=UH7Mh5qRk6g; __Secure-ROLLOUT_TOKEN=CJTzrqy6qv-VQBDR35vrrL2LAxiPwMiV-8OLAw%3D%3D; LOGIN_INFO=AFmmF2swRQIgCij3WMkrkbjMNeb0iT-I8he3weVwCmlDYg2oDdrxHiMCIQDgTj13OCT1mDYvovNGfh0JvTLfMUSLqjzwvwOXVJAoSg:QUQ3MjNmeUNIVW1Mejd2MGhuNUMxSFNFUmpjR2VBWmJhOWNxdHVRZWdXb3JjQXVBMDN0NUNGNTgtZXp5VWtQbzJMQndWcVJlUWRpSFkya0VFTHB3dUQySTFTTklqeGZuMkRMdmxPNmVtVXhWcHdpMjRGU0pKUmVGdWRuX0Z4c0ZVVnV1ZEstbHFRTlk4N3Yyel9JdklHZ2VSX2hzUDVqWWZn; SID=g.a000tQgygXlbeTkVgcbegzRhszLTR6CrFo3Lpa0E25lr9ecVFcCTooXeJMfjjtCAyh0YjW12tQACgYKASYSARESFQHGX2Mi5jnmQyEFqiS0_igEuNb2IhoVAUF8yKrZ_QrslPqzC5T_PMfi3UDk0076; __Secure-1PSIDTS=sidts-CjEBEJ3XV6wyHdopgs9olrAnC3G8NBwdxJN3KaG4RwZ2hspAShJvZoTNIhTZhAw61KbJEAA; __Secure-3PSIDTS=sidts-CjEBEJ3XV6wyHdopgs9olrAnC3G8NBwdxJN3KaG4RwZ2hspAShJvZoTNIhTZhAw61KbJEAA; __Secure-1PSID=g.a000tQgygXlbeTkVgcbegzRhszLTR6CrFo3Lpa0E25lr9ecVFcCTcj-x2U3ZYKtKIFMtyAaiFAACgYKAZESARESFQHGX2Mi5KRlJ8u1zlG6IwGxpPlLORoVAUF8yKpKcRXANcaKOP5KmjhXRh7C0076; __Secure-3PSID=g.a000tQgygXlbeTkVgcbegzRhszLTR6CrFo3Lpa0E25lr9ecVFcCTZHO7b5ejYkYyU_IL_QDW6gACgYKAWQSARESFQHGX2MiZoSbG0_zt0adVTeQqHoAYBoVAUF8yKqE97vdI9pPzmP_66lWkPYF0076; HSID=ABGVXWBSrSYPcAv6g; SSID=A40SFLB2oM7LgplsE; APISID=SuBDMvJGptCiJim3/AWAD1kwdREH0PcPfM; SAPISID=nGpS7odBGwi_CnFT/A23-CC3woq6_qHyu-; __Secure-1PAPISID=nGpS7odBGwi_CnFT/A23-CC3woq6_qHyu-; __Secure-3PAPISID=nGpS7odBGwi_CnFT/A23-CC3woq6_qHyu-; SIDCC=AKEyXzWqPxQ0yuWagV5whXt7FEwVvnabJGH4ZWA0k1DauGpK3K4F-Gpl8ine3I66-0ioTeRdeA; __Secure-1PSIDCC=AKEyXzUPn8kGBscfvH1NFW6VNIft_mlyAhAQi4F8iCKfgtHOZhjNOqrSSPMlWmv5aVUfkdoLDXo; __Secure-3PSIDCC=AKEyXzVqPhNdESR02yZaaNB45qmEJ9zV7n0U1VsMz8JJENfZTGjIFqJqTwsEV9pRdHuALVsdaWQ; NID=521=uDvXzMs4g-K_B4UvURH0GV7iUoBS3-z6D_szgr4ErxtWTsbkucykLHXzAXay8QiBhLt2G-fq1oGulGh-ktMW_0JMMwmEdXX8JZJgGXGqyz_F4Lfq2WBpeVRvIEiXirsJiPb-WglAGSle3pcqwfFX3sK4al2ibg9EJf9Fv7NMSCCj2JjxFi7LT06kzxlWIDllQ8kYE6WmgK9sxqlqsPe-zYNUi2QWT6u3SZApJQcs9nYpB8K19SbCJ3ip9MHl2bO5_IvWfoCLqSYPdFlCT1UhJuXVVrTeFCUMRYg; YSC=a8K0yv4Sw6M; ST-21omk5=csn=wbxElZVYiKbyYA1J&itct=CJsDEKCzAhgAIhMIod3apYrEiwMVCdtCBR29WyOQ',
 // TE: 'trailers'
//}

export default ytdl;
