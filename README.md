# react native android ci/cd

## Use this template to run your tests and deploy to playstore in github actions 

### Steps to setup for tests only:

#### 1. For tests only (recommended for staging):

- Copy the .github folder and the workflows floder with `android-tests-only.yml` to your root folder.
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

#### 2. For deployment to the play store only:

- Copy the .github folder and the workflows folder with `android-deploy-only.yml` to your root folder.
- Change the package name to your package name.
- Make sure that you have release that is equal to the `track` section in google store.
- Add these secrets to the repo secrets:
  - SIGNING_KEY => key for google store release (follow instruction in react native website (just generate one don`t include it in the android files)).
  - ALIAS => the alias you used for the key
  - KEY_STORE_PASSWORD => the key store password you used for the key
  - KEY_PASSWORD => the key password you used for the key
  - SERVICE_ACCOUNT_JSON => json file from google cloud that you need generate (with owner premmisions).

#### 3. For testing and deployment to the play store combined:

- Copy the .github folder and the workflows folder with `android-tests-and-deploy.yml` to your root folder.
- Follow all the above steps.
