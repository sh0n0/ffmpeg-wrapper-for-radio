// @deno-types="npm:@types/cli-progress"
import cliProgress from 'npm:cli-progress';
import { fetchRadioSeries } from './api.ts';
import { downloadAndEdit } from './ffmpeg.ts';
import { urls } from './urls.ts';

const homeDir = Deno.env.get('HOME');

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
