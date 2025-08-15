// plugins/remove-tv-capability.js
const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

module.exports = function withNoTVManifest(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;

    // Step 1: 移除所有 uses-feature 中与 TV 相关的声明
    if (androidManifest.manifest['uses-feature']) {
      androidManifest.manifest['uses-feature'] = androidManifest.manifest['uses-feature'].filter(
        (feature) => {
          const name = feature['$']['android:name'];
          return ![
            'android.software.leanback',
            'android.hardware.type.television',
          ].includes(name);
        }
      );
    }

    // Step 2: 修改 MainActivity，移除 LEANBACK_LAUNCHER
    const application = androidManifest.manifest.application[0];
    const mainActivity = application.activity?.find(
      (activity) => activity['$']['android:name'] === '.MainActivity'
    );

    if (mainActivity && mainActivity['intent-filter']) {
      for (const intentFilter of mainActivity['intent-filter']) {
        if (intentFilter.action?.[0]['$']['android:name'] === 'android.intent.action.MAIN') {
          // 只保留 LAUNCHER，移除 LEANBACK_LAUNCHER
          intentFilter.category = (intentFilter.category || []).filter(
            (cat) =>
              cat['$']['android:name'] !== 'android.intent.category.LEANBACK_LAUNCHER'
          );
        }
      }
    }

    return config;
  });
};
