module.exports = {
    "extends": "umi",
    "globals": {
        "HUZAN_ENV": false,
        "PREVIEW_ENV": false,
        "DISABLE_BROWSER_DETECTION": false,
    },
    "plugins": [
        "react-hooks",
    ],
    "rules": {
        "react-hooks/rules-of-hooks": "error",
        'react-hooks/exhaustive-deps': 'warn',
        "require-yield": 1,
        "no-extend-native": 0,
        "jsx-a11y/href-no-hash": 0,
        "react/no-deprecated": 0,
        "no-script-url": "off",
        'linebreak-style': 0,
        "no-mixed-spaces-and-tabs": [
            2,
            false,
        ],
        "indent": [
            "error",
            4,
            {
                "SwitchCase": 1,
            },
        ],
        "semi": ["error", "never"],
        //        "no-unused-vars": [
        //            "error",
        //            {
        //                "args": "none",
        //                "ignoreRestSiblings": true
        //            }
        //        ]
    },
    parserOptions: {
        ecmaFeatures: {
            legacyDecorators: true,
        },
    },
    settings: {
        react: {
            version: 'latest',
        },
    },
}
