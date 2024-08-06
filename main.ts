// @deno-types="npm:@types/cli-progress"
import cliProgress from 'npm:cli-progress';
import { fetchRadioList } from './api.ts';
import { downloadAndEdit } from "./ffmpeg.ts";

const homeDir = Deno.env.get('HOME');

const json = await fetchRadioList();

const multibar = new cliProgress.MultiBar(
  {
    clearOnComplete: false,
    hideCursor: true,
    format: ' {bar} | {filename} | {value}/{total}',
  },
  cliProgress.Presets.shades_grey
);

const progressBars = new Map<string, cliProgress.SingleBar>(
  json.episodes.map((episode) => {
    return [
      episode.program_title,
      multibar.create(100, 0, {
        filename: episode.program_title,
      }),
    ];
  })
);

const promises = json.episodes.map((episode) => {
  const outputFilePath = `${homeDir}/Downloads/${episode.program_title}.mp3`;

  return downloadAndEdit(
    json.title,
    episode.program_title,
    episode.stream_url,
    outputFilePath,
    (progress) => {
      const progressInt = Math.floor(progress);
      progressBars.get(episode.program_title)?.update(progressInt);
    },
    () => {
      progressBars.get(episode.program_title)?.update(100);
      progressBars.get(episode.program_title)?.stop();
    }
  );
});

await Promise.all(promises);
multibar.stop();
