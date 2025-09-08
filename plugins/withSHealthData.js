const { withAppBuildGradle, withAndroidManifest, withMainApplication } = require('@expo/config-plugins');

const withSHealthGradle = (config) => {
  return withAppBuildGradle(config, (cfg) => {
    const gradle = cfg.modResults;

    // Ensure flatDir repo
    if (!gradle.contents.includes('flatDir')) {
      gradle.contents = gradle.contents.replace(
        /repositories\s*{/,
        `repositories {
        flatDir { dirs 'libs' }`
      );
    }

    // Add compileOptions if not present
    if (!gradle.contents.includes('compileOptions')) {
      gradle.contents = gradle.contents.replace(
        /android\s*{/,
        `android {
        compileOptions {
          sourceCompatibility JavaVersion.VERSION_1_8
          targetCompatibility JavaVersion.VERSION_1_8
        }`
      );
    }

    // Add AAR dependency if not present
    if (!gradle.contents.includes('samsung-health-data-api')) {
      gradle.contents = gradle.contents.replace(
        /dependencies\s*{/,
        `dependencies {
        implementation(name: 'samsung-health-data-api', ext: 'aar')`
      );
    }

    // Add packaging options if not present
    if (!gradle.contents.includes('packagingOptions')) {
      gradle.contents = gradle.contents.replace(
        /android\s*{/,
        `android {
        packagingOptions {
          resources {
            excludes += ['META-INF/*']
          }
        }`
      );
    }

    return cfg;
  });
};

const withSHealthManifest = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    
    // Ensure application exists
    if (!manifest.application) {
      manifest.application = [{}];
    }
    
    // Add meta-data for Samsung Health permissions
    const metaData = [
      {
        $: {
          'android:name': 'com.samsung.android.health.permission.read',
          'android:value': 'com.samsung.shealth.step_daily_trend;com.samsung.health.heart_rate',
        },
      },
      {
        $: {
          'android:name': 'com.samsung.android.health.permission.write',
          'android:value': 'com.samsung.health.exercise',
        },
      },
    ];

    // Add meta-data to application
    manifest.application[0]['meta-data'] = [
      ...(manifest.application[0]['meta-data'] || []),
      ...metaData,
    ];

    return config;
  });
};

module.exports = (config) => {
  config = withSHealthGradle(config);
  config = withSHealthManifest(config);
  return config;
};
