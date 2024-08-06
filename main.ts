// @deno-types="npm:@types/cli-progress"
import cliProgress from "npm:cli-progress";
import { fetchRadioSeries } from "./api.ts";
import { downloadAndEdit } from "./ffmpeg.ts";
import { urls } from "./urls.ts";
import { addIdToHistoryFile, readHistoryFile } from "./history.ts";

const homeDir = Deno.env.get("HOME");

const downloadedEpisodes = await readHistoryFile();

const radioSeriesPromises = urls.map(({ url }) => {
  return fetchRadioSeries(url);
});

const radioSeries = await Promise.all(radioSeriesPromises);

const multibar = new cliProgress.MultiBar(
  {
    clearOnComplete: false,
    hideCursor: true,
    format: " {bar} | {filename} | {value}/{total}",
  },
  cliProgress.Presets.shades_grey,
);

const progressBars = new Map<string, cliProgress.SingleBar>();

radioSeries.forEach((json) => {
  json.episodes.forEach(async (episode) => {
    if (!downloadedEpisodes.has(episode.id)) {
      progressBars.set(
        episode.program_title,
        multibar.create(100, 0, {
          filename: episode.program_title,
        }),
      );
      await addIdToHistoryFile(episode.id);
    }
  });
});

const promises = radioSeries.flatMap((json) => {
  return json.episodes.map((episode) => {
    if (downloadedEpisodes.has(episode.id)) {
      console.log(
        `Skipping already downloaded episode: ${episode.program_title}`,
      );
      return Promise.resolve();
    }

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
      },
    );
  });
});

await Promise.all(promises.flat());
multibar.stop();
