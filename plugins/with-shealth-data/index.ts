import {
    AndroidConfig,
    ConfigPlugin,
    withAndroidManifest,
    withAppBuildGradle,
    withMainApplication,
} from "@expo/config-plugins";
  
const AAR_NAME = "samsung-health-data-api";

const withSHealthGradle: ConfigPlugin = (config) => {
    return withAppBuildGradle(config, (cfg) => {
        const gradle = cfg.modResults;

        // ensure flatDir repo
        gradle.contents = gradle.contents.replace(
            /repositories\s*{([\s\S]*?)}/m,
            (m) => {
                if (m.includes("flatDir")) return m;
                return m.replace(
                    /repositories\s*{/,
                    `repositories {
          flatDir { dirs 'libs' }`
                );
            }
        );

        // compileOptions Java 1.8+
        gradle.contents = gradle.contents.replace(
            /android\s*{([\s\S]*?)}/m,
            (block) =>
                block.includes("compileOptions")
                    ? block
                    : block.replace(
                        /android\s*{/,
                        `android {
      compileOptions { sourceCompatibility JavaVersion.VERSION_1_8; targetCompatibility JavaVersion.VERSION_1_8 }`
                    )
        );

        // dependency on AAR
        if (!gradle.contents.includes(`implementation(name: '${AAR_NAME}', ext: 'aar')`)) {
            gradle.contents = gradle.contents.replace(
                /dependencies\s*{([\s\S]*?)}/m,
                (m) =>
                    m.replace(
                        /dependencies\s*{/,
                        `dependencies {
      implementation(name: '${AAR_NAME}', ext: 'aar')`
                    )
            );
        }

        // packagingOptions for duplicate META-INF
        gradle.contents = gradle.contents.replace(
            /android\s*{([\s\S]*?)}/m,
            (block) =>
                block.includes("packagingOptions")
                    ? block
                    : block.replace(
                        /android\s*{/,
                        `android {
      packagingOptions { resources { excludes += ['META-INF/*'] } }`
                    )
        );

        return cfg;
    });
};

const withSHealthManifest: ConfigPlugin = (config) => {
    return withAndroidManifest(config, (cfg) => {
        const manifest = cfg.modResults;
        
        // Get the main application element
        const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

        // Add Samsung Health data permission meta-data entries
        AndroidConfig.Manifest.addMetaDataItemToMainApplication(
            mainApplication,
            "com.samsung.android.health.permission.read",
            "com.samsung.shealth.step_daily_trend;com.samsung.health.heart_rate"
        );
        AndroidConfig.Manifest.addMetaDataItemToMainApplication(
            mainApplication,
            "com.samsung.android.health.permission.write",
            "com.samsung.health.exercise"
        );

        return cfg;
    });
};

const withSHealthMainApplication: ConfigPlugin = (config) => {
    return withMainApplication(config, (cfg) => {
        // No Java init needed here; we initialize inside the module.
        return cfg;
    });
};

const withSHealth: ConfigPlugin = (config) => {
    config = withSHealthGradle(config);
    config = withSHealthManifest(config);
    config = withSHealthMainApplication(config);
    return config;
};

export default withSHealth;
