# Automatic contribution calendar refresh

## Schedule and data

The **Portfolio CI and Pages** workflow (`.github/workflows/portfolio.yml`) checks at 00:17, 06:17, 12:17, and 18:17 UTC, or 05:47, 11:47, 17:47, and 23:47 IST. It runs on the default production branch, `main`.

The script fetches only the public contribution calendar without authentication. It stores dates, exact counts, and intensity levels. Private repository names, commits, and events are never requested or stored. Parsing rejects missing counts, invalid intensity, impossible/duplicate/discontinuous dates, partial years, and older calendars. Changed data replaces the saved snapshot atomically; unchanged data preserves both file contents and its capture date.

## Deployment behavior

1. Run offline refresh tests, then fetch and validate the public calendar.
2. If changed, install pinned dependencies, type-check, and build before committing only `src/data/github.json` to `main` as the Actions bot.
3. Pass that exact commit to the site's full validation job, including browser and accessibility checks.
4. Upload the verified static output, deploy it to GitHub Pages, then verify the public commit marker and assets.

An unchanged scheduled check skips the build/deployment jobs and creates no commit. A manual run still validates and deploys even if the calendar is unchanged. A failed fetch or parser validation leaves the previous snapshot untouched. A failed pre-deployment check leaves the published site untouched. A failed post-deployment check reports a problem after publication and requires investigation or rollback.

The bot push does not start a second push workflow; deployment happens in the same workflow run. No personal access token, deploy hook, or service secret is required. [GitHub token triggering rules](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)

## Manual run and pause

In [Actions](https://github.com/the-anantkumar/portfolio/actions/workflows/portfolio.yml), open **Portfolio CI and Pages**, choose **Run workflow**, and select `main`. Leave `refresh` checked to fetch new contributions, or uncheck it to redeploy the current snapshot. Equivalent CLI:

```sh
gh workflow run portfolio.yml --ref main -f refresh=true
```

To pause only scheduled refreshes, remove/comment the `schedule` trigger through a PR. Disabling the entire workflow also stops PR checks and ordinary deployments. To roll back calendar data, pause the schedule first, then revert the bot commit through a PR; otherwise the next check can restore the same upstream data.

The job has `contents: write` only for its refresh step group. Validation uses read access, and the deployment job alone receives Pages/OIDC write permissions. All jobs require the intended public repository; forks and private copies do not run. Branch rules remain authoritative: a blocked bot push fails rather than bypassing protection or force-pushing.

## Freshness

This is a periodically refreshed snapshot. Allow the six-hour interval plus deployment/cache time after GitHub exposes a change. GitHub itself may take up to 24 hours to show an eligible contribution. Schedules may be delayed or dropped; public workflows can be disabled after 60 days without repository activity. Check the workflow run history if the snapshot date is unexpectedly old. [Contribution processing](https://docs.github.com/en/account-and-profile/how-tos/contribution-settings/troubleshooting-missing-contributions), [schedule behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)

The visible date belongs to the saved calendar; a successful unchanged check does not change it. Visitors make no GitHub API calls. Reopening or refreshing the page reads the deployed calendar, while an already-open page does not poll. GitHub Pages controls CDN caching; the optional Cloudflare cache directives do not apply to this host.

## Local reproduction

```sh
npm run test:github
npm run refresh:github
npm run check
npm run build
```

Use `npm run refresh:github -- /path/to/calendar.html` to reproduce parsing offline. Tests use synthetic HTML and temporary files rather than modifying the committed snapshot. See [deployment operations](deployment.md) for browser tests, exact-release verification, cost boundaries, and rollback.
