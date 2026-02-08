import 'dotenv/config';

const config = {
  expo: {
    ...require('./app.json').expo,
    plugins: [
      ...(require('./app.json').expo.plugins || []),
    ],
    android: {
      ...require('./app.json').expo.android,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        },
      },
    },
  },
};

export default config;
