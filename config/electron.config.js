module.exports = {
    appId: 'com.expensifyreactnative.chat',
    productName: 'New Expensify',
    extraMetadata: {
        main: './desktop/main.js',
    },
    mac: {
        category: 'public.app-category.finance',
        target: [
            {target: 'dmg', arch: ['x64', 'arm64', 'universal']},
        ],
        icon: process.env.SHOULD_DEPLOY_PRODUCTION === 'true' ? './desktop/icon.png' : './desktop/icon-stg.png',
        hardenedRuntime: true,
        entitlements: 'desktop/entitlements.mac.plist',
        entitlementsInherit: 'desktop/entitlements.mac.plist',
        type: 'distribution',
    },
    dmg: {
        internetEnabled: true,
    },
    publish: [{
        provider: 's3',
        bucket: process.env.SHOULD_DEPLOY_PRODUCTION === 'true' ? 'expensify-cash' : 'staging-expensify-cash',
        channel: 'latest',
    }],
    files: [
        './dist/**/*',
        './desktop/*.js',
        './src/libs/checkForUpdates.js',
    ],
    directories: {
        output: 'desktop-build',
    },
};
