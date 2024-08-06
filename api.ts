export async function fetchRadioSeries(url: string): Promise<RadioSeries> {
  const response = await fetch(url);
  return await response.json();
}

type Episode = {
  id: number;
  program_title: string;
  onair_date: string;
  closed_at: string;
  stream_url: string;
  aa_contents_id: string;
  program_sub_title: string;
};

type SameTagSeries = {
  id: number;
  title: string;
  radio_broadcast: string;
  corner_name: string;
  onair_date: string;
  thumbnail_url: string;
  link_url: string;
  series_site_id: string;
  corner_site_id: string;
};

type RadioSeries = {
  id: number;
  title: string;
  radio_broadcast: string;
  schedule: string;
  corner_name: string;
  thumbnail_url: string;
  series_description: string;
  series_url: string;
  share_text_title: string;
  share_text_url: string;
  share_text_description: string;
  episodes: Episode[];
  same_tag_series: SameTagSeries[];
};
