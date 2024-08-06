// @deno-types="npm:@types/cli-progress"
import cliProgress from 'npm:cli-progress';
import { fetchRadioSeries } from './api.ts';
import { downloadAndEdit } from './ffmpeg.ts';

const homeDir = Deno.env.get('HOME');

const urls = [
  {
    // Russian
    url: 'https://www.nhk.or.jp/radio-api/app/v1/web/ondemand/series?site_id=YRLK72JZ7Q&corner_site_id=01',
  },
  {
    // French
    url: 'https://www.nhk.or.jp/radio-api/app/v1/web/ondemand/series?site_id=XQ487ZM61K&corner_site_id=01',
  },
];

const radioSeriesPromises = urls.map(({ url }) => {
  return fetchRadioSeries(url);
});

const radioSeries = await Promise.all(radioSeriesPromises);

const multibar = new cliProgress.MultiBar(
  {
    clearOnComplete: false,
    hideCursor: true,
    format: ' {bar} | {filename} | {value}/{total}',
  },
  cliProgress.Presets.shades_grey
);

const progressBars = new Map<string, cliProgress.SingleBar>();

radioSeries.forEach((json) => {
  json.episodes.forEach((episode) => {
    progressBars.set(
      episode.program_title,
      multibar.create(100, 0, {
        filename: episode.program_title,
      })
    );
  });
});

const promises = radioSeries.flatMap((json) => {
  return json.episodes.map((episode) => {
    const outputFilePath = `${homeDir}/Downloads/${episode.program_title}.mp3`;

    return downloadAndEdit(
      json.title,
      episode.program_title,
      episode.stream_url,
      outputFilePath,
      (progress) => {
        const progressInt = Math.floor(progress);
        const progressBar = progressBars.get(episode.program_title);
        if (progressBar) {
          progressBar.update(progressInt);
        }
      },
      () => {
        const progressBar = progressBars.get(episode.program_title);
        if (progressBar) {
          progressBar.update(100);
          progressBar.stop();
        }
      }
    );
  });
});

await Promise.all(promises.flat());
multibar.stop();
