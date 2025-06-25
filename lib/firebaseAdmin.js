import admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: "barber-shop-e547b",
            clientEmail: "firebase-adminsdk-fbsvc@barber-shop-e547b.iam.gserviceaccount.com",
            privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCs1UmrLD7H21Tm\nDYplUf0ftcavLTo1jz04Z0OsXLdlw/XHo4dNf4vsq9B7MCjT/4cCHaGvWsy2T+Ot\ntlO+bY/+oaycD0MsRsKPXT6d1L9oURJqJp4EmS8rD10V9Z/e2gQkQSIkzkWKrpPK\nc34NbNNOwY6pvHKM5w4+f+3FQqLwLxIms8Wcc+OwNxcNqbZMfsXZRg45Rrp7OaLH\nx52tr6G8gWXa4iOEcAI9IhzaYgEzz9/AUDm6LNrYBxaB3oi9XmFUIpYeWpup/E/X\nhxfmMGM7roaSu7H1xJn2wmFOiPcWGBAHJhcUcgduKGVvV7j7kElAqsiZWNJcqK3a\n8bubrnfNAgMBAAECggEACq6SA4jUBoEpUaCjnZiAJv4SnhATCW1lcL99IMGIOjtu\nzNxwB9uqt8F0vLBgzZ186CYRsKdRgLEWVs2uhlX6MNgoNWsCEVH8Q2UVcibMf7OH\nClWBrbIUBrrH24wXSew6lk0KQbEX/jbE/p29vDGuK69t1FLH16qOKFG6zdbNAEAm\ng7rn8Bj0RAd/kh+hCTXGTV6e972imeabkKwABaPOpplnnuezxNdyIpVzLkm/Oreh\ns94trRBI5iRBaqFk02LEMYZE6/i81SAKFQRRAFm6zwba7vwNpobXK0o31gwGDe6g\n09x022rwDaTaHFjlQhWplp3ML5O35GgRisEqam+Z8QKBgQDU/9SgLVRi8tMW9+4g\n2IiwParkQIZnvNOSUc3flzpH3iSlgztEdlwaDIHYUoPvaZ+up0p/OmJNtppq942b\n562LwWnuzdrvWC+38bg882MqW2ID64tR1H7PxmvhZ+H8Hn6auZMaFxFNYv4eAPmB\nXsyis671Kevn5P2xxUoqj47FeQKBgQDPuZmtMSDu/zLq540OlwTPSVJlpKeGwbw1\n/DZvlPfYT21kJIA+bJU4S/SgMLdjgyhsSVkOw4vbcU1ZivXKXzZwPegO+3NEK9Kl\nzHBV3a1z/El6qwuNQE4u7LgDL8EbpTxQRGxr0pJHa+bjt55sg4Uh/5OF/TGaSajG\noHb8Kx+T9QKBgQCU3n3Quf3p7oek3QI9SLo4W9GOGJ8X8Dz7XluCs6LTSirY16Db\n19HFjwpNlFaMRYmKu3fw9nBwmnjQ3FbIKaP9MuCEPLKRaFRpvvMi/oVHvHkD/mPw\nfJFpTOhnsYCcAwA/ygZLTOYV7WNouwun5QcnjGhzB6rO+BhsYFTW7GFAGQKBgG5X\nvB948nKiU2ze1VpDtIVcAI4HugnmTdEricsaCdH41zYUAZ+nVFjUWDzjw/bzi/yB\ntfIWw+sss5b2LvxyOVvENsoGnkM/OCVkhOPH3sS25l1oELnWx/E7Q8BFlMHXs0M8\nJY/dCmEwGzUpq9kewBDAT6AkUD4SFLp2MN5hFeQlAoGADSuvSmSFfWDEdhK/Hte9\nQBsMyBdlNRVPzXCoJqYlIC7SZwIm6VoQEIWRSh5FXuSYSWAUGsQgIDRBDPDXPeFK\n6xyVw5YD1TT9ubypVVWmr3+hGx2nKmtljPicZPTeotNteoThhLy+SdeyBhoXx3TU\nDgpHedNYgEPrR98sDLuARAA=\n-----END PRIVATE KEY-----\n",
        }),
    });
}

export default admin;


// import admin from 'firebase-admin';

// if (!admin.apps.length) {
//     admin.initializeApp({
//         credential: admin.credential.cert({
//             projectId: barber - shop - e547b,
//             clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//             privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//         }),
//     });
// }

// export default admin;
