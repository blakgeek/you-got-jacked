#!/bin/bash

# check for the release flag otherwise just build normal
if [[ "${CORDOVA_CMDLINE}" =~ "--release" ]]; then
    target="mobile:release"
else
    target="mobile"
fi
pushd ..
grunt "${target}"
popd