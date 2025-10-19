const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '../');
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.extraNodeModules = {
  'react': path.resolve(workspaceRoot, 'node_modules/react'),
  'react-native': path.resolve(workspaceRoot, 'node_modules/react-native'),
  'react-native-reanimated': path.resolve(workspaceRoot, 'node_modules/react-native-reanimated'),
  'react-native-gesture-handler': path.resolve(workspaceRoot, 'node_modules/react-native-gesture-handler'),
  'expo': path.resolve(workspaceRoot, 'node_modules/expo'),
  '@babel/runtime': path.resolve(workspaceRoot, 'node_modules/@babel/runtime'),
};

config.resolver.unstable_enablePackageExports = false;
config.resolver.unstable_enableSymlinks = false;

module.exports = config;