// @deno-types="npm:@types/fluent-ffmpeg"
import ffmpeg from 'npm:fluent-ffmpeg';
import NodeID3 from 'npm:node-id3';

async function downloadAndEdit(
  title: string,
  programTitle: string,
  streamUrl: string,
  outputFilePath: string,
  onProgress: (progress: number) => void,
  onEnd: () => void
) {
  await download(streamUrl, outputFilePath, onProgress);

  const level = programTitle.includes('初級編')
    ? '初級編'
    : programTitle.includes('応用編')
    ? '応用編'
    : new Error('Invalid level');
  const album = `${title} ${level}`;

  NodeID3.update(
    {
      album,
    },
    outputFilePath
  );

  onEnd();
}

function download(
  streamUrl: string,
  outputFilePath: string,
  onProgress: (progress: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(streamUrl)
      .inputOptions('-http_seekable 0')
      .outputOptions('-write_xing 0')
      .save(outputFilePath)
      .on('progress', (progress) => {
        onProgress(progress.percent ?? 0);
      })
      .on('end', () => {
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

export { downloadAndEdit };
