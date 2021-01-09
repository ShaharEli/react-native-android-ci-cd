const { execSync } = require("child_process");
const {
  existsSync,
  createReadStream,
  createWriteStream,
  readFileSync,
  mkdirSync,
  unlink,
  writeFileSync,
} = require("fs");
const { resolve } = require("path");
const pixelMatch = require("pixelmatch");

const { PNG } = require("pngjs");

const SCREENSHOT_OPTIONS = {
  timeout: 1000,
  killSignal: "SIGKILL",
};

export const getDevicePlatform = (testRunner) => {
  if (testRunner === "appium") {
    return driver.getCapabilities().getCapability("platformName");
  }
  if (testRunner === "detox") {
    return device.getPlatform();
  }
  console.error("Platform target not detected, detox or appium not detected");
  return null;
};
export const saveScreenshot = (directory, fileName) => {
  mkdirSync(resolve(directory));
};
class Setup {
  constructor(
    tmpPath = "tmp",
    savePath = "screenshots",
    basePath = "",
    testRunner
  ) {
    this.createScreenshot = (identifier, subDir = "", config = this.config) => {
      const { savePath, tmpPath, testRunner } = config;
      const platform = getDevicePlatform(testRunner);
      if (!platform || !tmpPath) {
        return;
      }
      if (!existsSync(resolve(tmpPath, subDir))) {
        mkdirSync(resolve(tmpPath, subDir));
      }
      const file = resolve(tmpPath, subDir, `${identifier}.png`);
      switch (platform) {
        case "ios":
          execSync(
            `xcrun simctl io booted screenshot ${file}`,
            SCREENSHOT_OPTIONS
          );
          break;
        case "android":
          execSync(`adb shell screencap -p | perl -pe 's/\x0D\x0A/\x0A/g' > ${file}
`);
          break;
        default:
          return console.warn(
            `Unsupported OS: ${platform}, screenshots disabled`
          );
      }
    };
    /**
     * Creates a pixel diff image which highlights areas that do not match between two images
     * can override path using config
     */
    this.pixelDiff = (name, subDir = "", config = this.config) => {
      const { savePath, tmpPath } = config;
      const filename = `${name}.png`;
      const getSavePath = () => resolve(savePath, subDir, filename);
      const getTmpPath = () => resolve(tmpPath, subDir, filename);
      if (!existsSync(getTmpPath())) {
        return console.error("Temp file does not exist");
      }
      if (!existsSync(resolve(savePath, subDir))) {
        mkdirSync(resolve(savePath, subDir));
      }
      if (!existsSync(getSavePath())) {
        const readStream = createReadStream(getTmpPath());
        const writeStream = createWriteStream(getSavePath());
        readStream.on("error", () => console.log("error with read stream"));
        writeStream.on("error", () => console.log("written"));
        readStream.on("close", function () {
          unlink(getTmpPath(), () => console.log("unlinked old path"));
        });
        console.log(`Success: Moved ${filename} to saved folder`);
        readStream.pipe(writeStream);
        return;
      }
      const tmpImage = PNG.sync.read(readFileSync(getTmpPath()));
      const saveImage = PNG.sync.read(readFileSync(getSavePath()));
      const { width, height } = saveImage;
      const diff = new PNG({ width, height });
      const diffCount = pixelMatch(
        saveImage.data,
        tmpImage.data,
        diff.data,
        width,
        height,
        {
          threshold: 0.1,
        }
      );
      console.log("diffCount:", diffCount);
      if (diffCount > 0) {
        writeFileSync(
          resolve(tmpPath, subDir, `diff-${filename}`),
          PNG.sync.write(diff)
        );
        throw new Error("Screenshots not matching!");
      }
    };
    this.config = this.createConfig(tmpPath, savePath, basePath, testRunner);
  }

  createConfig(tmpPath, savePath, basePath, testRunner) {
    if (!testRunner) {
      throw new Error(
        "Error: Test Runner not provided, please choose appium or detox"
      );
    }
    if (!existsSync(resolve(basePath))) {
      mkdirSync(resolve(basePath));
    }
    if (!existsSync(resolve(basePath, savePath))) {
      mkdirSync(resolve(basePath, savePath));
    }
    if (!existsSync(resolve(basePath, tmpPath))) {
      mkdirSync(resolve(basePath, tmpPath));
    }
    const baseURL = resolve(basePath);
    return {
      basePath: baseURL,
      savePath: resolve(basePath, savePath),
      testRunner,
      tmpPath: resolve(basePath, tmpPath),
    };
  }
}
export default Setup;
