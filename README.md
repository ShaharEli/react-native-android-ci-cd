# react-native-android-ci/cd

## Use this template to tun your tests in github actions

### Steps to setup:

- Copy the .github folder and the files within that folder to your root folder.
- Setup your tests and with detox - [link to the detox repo](https://github.com/wix/Detox).

- Add <code>
  "android.emu.workflow": {
  "binaryPath": "android/app/build/outputs/apk/release/app-release.apk",
  "build": "cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release && cd ..",
  "type": "android.emulator",
  "name": "emu"
  }
  </code> configuration in .detoxrc.json under "configurations".

- Add <code>
  "build-detox-android": "detox build -c android.emu.workflow",<br/>
  "test-detox-android": "detox test -c android.emu.workflow"
  </code> scripts to the package.json under "scripts".
