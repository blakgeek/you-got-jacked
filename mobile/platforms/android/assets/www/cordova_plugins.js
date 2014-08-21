cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/org.apache.cordova.splashscreen/www/splashscreen.js",
        "id": "org.apache.cordova.splashscreen.SplashScreen",
        "clobbers": [
            "navigator.splashscreen"
        ]
    },
    {
        "file": "plugins/com.blakgeek.cordova.plugin.lowlatencyaudio/www/LowLatencyAudio.js",
        "id": "com.blakgeek.cordova.plugin.lowlatencyaudio.LowLatencyAudio",
        "clobbers": [
            "window.plugins.LowLatencyAudio"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "org.apache.cordova.console": "0.2.10",
    "org.apache.cordova.splashscreen": "0.3.2",
    "com.blakgeek.cordova.plugin.lowlatencyaudio": "1.1.3"
}
// BOTTOM OF METADATA
});