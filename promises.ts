import { json, homeDir, downloadAndEdit } from './main';

export const promises = json.episodes.map((episode) => {
  const outputFilePath = `${homeDir}/Downloads/${episode.program_title}.mp3`;

  downloadAndEdit(
    episode.program_title,
    episode.stream_url,
    outputFilePath,
    (progress) => {
      const progressInt = Math.floor(progress);
      progressBar.update(progressInt);
      console.log(
        'episode.program_title',
        episode.program_title,
        'progressInt',
        progressInt
      );
    },
    () => {
      progressBar.update(100);
      progressBar.stop();
    }
  );
});
