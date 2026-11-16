import type { APIRoute } from 'astro';
import snapshot from '../data/github.json';
export const GET: APIRoute = () => {
  const palette = ['#e8ebe6', '#93b49c', '#659575', '#3f7051', '#244d32'];
  const start = new Date(`${snapshot.from}T00:00:00Z`).getTime();
  const days = snapshot.days.map(day => {
    const date = new Date(`${day.date}T00:00:00Z`);
    const week = Math.floor((date.getTime() - start) / 86400000 / 7);
    return { ...day, week, weekday: date.getUTCDay(), firstOfMonth: date.getUTCDate() === 1, month: date.toLocaleDateString('en', { month: 'short', timeZone: 'UTC' }) };
  });
  const months = days.filter((day, i) => i === 0 || (day.firstOfMonth && day.week > 1));
  const labels = months.map(day => `<text x="${32 + day.week * 13}" y="12">${day.month}</text>`).join('');
  const cells = days.map(day => `<rect x="${32 + day.week * 13}" y="${23 + day.weekday * 13}" width="9" height="9" rx="2" fill="${palette[day.level]}" stroke="${day.level ? palette[day.level] : '#bac3b9'}"><title>${day.date}: ${day.count} contributions</title></rect>`).join('');
  return new Response(`<svg xmlns="http://www.w3.org/2000/svg" width="725" height="125" viewBox="0 0 725 125" role="img" aria-labelledby="title" aria-describedby="description"><title id="title">Public GitHub activity: ${snapshot.total} contributions, ${snapshot.from} to ${snapshot.to}</title><desc id="description">Each square represents a day. Outlined pale squares have no contributions; green squares become darker as the contribution count increases.</desc><g font-family="system-ui, sans-serif" font-size="10" fill="#545d56">${labels}<text x="0" y="45">Mon</text><text x="0" y="71">Wed</text><text x="0" y="97">Fri</text></g><g stroke-width="0.65">${cells}</g></svg>`, { headers: { 'Content-Type': 'image/svg+xml' } });
};
