// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// expo-sqlite no alvo web usa wa-sqlite (WASM) — sem isso o Metro nao
// resolve o import do .wasm (docs.expo.dev/versions/v57.0.0/sdk/sqlite,
// secao "Usage on web"). So importa pra suporte web opcional, o alvo
// real do produto e Android/iOS nativo (plan.md).
config.resolver.assetExts.push('wasm');

module.exports = config;
