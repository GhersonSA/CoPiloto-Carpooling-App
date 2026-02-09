import 'dotenv/config';

const appJson = require('./app.json');

const config = {
  expo: {
    ...appJson.expo,
    plugins: [
      ...(appJson.expo.plugins || []),
    ],
    android: {
      ...appJson.expo.android,
      package: "com.gherson.copiloto",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        },
      },
    },
    extra: {
      ...(appJson.expo.extra || {}),
      eas: {
        projectId: "8a370027-d550-499b-b761-fad0894de3b9",
      }
    }
  },
};

export default config;