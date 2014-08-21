#!/bin/bash

if [[ "${CORDOVA_PLATFORMS}" =~ "android" ]]; then
    echo "Creating ant.properties"
    cp ~/.android/release.properties platforms/android/ant.properties
fi
