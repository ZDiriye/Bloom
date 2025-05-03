const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
// turn the new flag off
defaultConfig.resolver.unstable_enablePackageExports = false;

defaultConfig.resolver.assetExts.push(
  'bin', 
  'json'
);

module.exports = defaultConfig;