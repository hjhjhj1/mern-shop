/*
  此文件用于给react-app-rewired修改create-react-app脚手架的默认配置
 */
const { injectBabelPlugin } = require('react-app-rewired');

module.exports = function override(config, env) {
  // 使用css而不是less
  config = injectBabelPlugin(['import', { libraryName: 'antd', style: 'css' }], config);
  return config;
};
