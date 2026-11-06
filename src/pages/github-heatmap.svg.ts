import type { APIRoute } from 'astro';
import snapshot from '../data/github.json';
export const GET: APIRoute = () => {
  const palette = ['#1e3044', '#287f92', '#36b6bd', '#79ded0', '#e0ff97'];
  const start = new Date(`${snapshot.from}T00:00:00Z`).getTime();
  const days = snapshot.days.map(day => {
    const date = new Date(`${day.date}T00:00:00Z`);
    const week = Math.floor((date.getTime() - start) / 86400000 / 7);
    return { ...day, week, weekday: date.getUTCDay(), firstOfMonth: date.getUTCDate() === 1, month: date.toLocaleDateString('en', { month: 'short', timeZone: 'UTC' }) };
  });
  const months = days.filter((day, i) => i === 0 || (day.firstOfMonth && day.week > 1));
  const labels = months.map(day => `<text x="${32 + day.week * 13}" y="12">${day.month}</text>`).join('');
  const cells = days.map(day => `<rect x="${32 + day.week * 13}" y="${23 + day.weekday * 13}" width="9" height="9" rx="2" fill="${palette[day.level]}" stroke="${day.level ? palette[day.level] : '#526881'}"><title>${day.date}: ${day.count} contributions</title></rect>`).join('');
  return new Response(`<svg xmlns="http://www.w3.org/2000/svg" width="725" height="125" viewBox="0 0 725 125" role="img" aria-labelledby="title"><title id="title">GitHub activity: ${snapshot.total} contributions, ${snapshot.from} to ${snapshot.to}</title><g font-family="monospace" font-size="9" fill="#c8d6e5">${labels}<text x="0" y="45">Mon</text><text x="0" y="71">Wed</text><text x="0" y="97">Fri</text></g><g stroke-width="0.65">${cells}</g></svg>`, { headers: { 'Content-Type': 'image/svg+xml' } });
};
