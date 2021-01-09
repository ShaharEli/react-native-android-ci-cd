import nativePixelMatch from './pixelMatch';

const delay = (secs) => new Promise((resolve) => setTimeout(resolve, secs * 1000));

export const screenshotConfig = new nativePixelMatch(
  'temp',
  'shots',
  'screenshot_testing',
  'detox'
);

export const testScreenshot = async (name, folder) => {
  await delay(0.5);
  screenshotConfig.createScreenshot(name, folder);
  screenshotConfig.pixelDiff(name, folder);
  await delay(0.5);
};
