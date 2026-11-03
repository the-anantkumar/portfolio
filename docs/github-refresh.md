# Automatic contribution calendar refresh

## What runs

`.github/workflows/refresh-github.yml` schedules checks at 00:17, 06:17, 12:17, and 18:17 UTC (05:47, 11:47, 17:47, and 23:47 IST). The Actions page also supports a manual run once the workflow is installed. The workflow checks out `pilot`, runs offline refresh tests, then fetches the public GitHub contribution calendar without credentials.

Only dated counts and intensity levels are saved. Private repository names, commits, and events are never requested or stored. The parser checks real, unique, continuous dates, a full calendar year, exact counts, and valid levels. It rejects incomplete or older calendars. A changed snapshot is written through a temporary file and atomic rename. An unchanged calendar does not rewrite the snapshot or its capture date.

Changed data is type-checked and built before a bot commit containing only `src/data/github.json` is pushed to `pilot`. The workflow never force-pushes. A concurrent push or branch rule may reject the update; the next run starts from current `pilot`. Failed fetches, invalid markup, or failed validation leave the published site on its last successful version. Workflow failures remain visible in Actions.

## Activate after local review

The local implementation is complete; remote scheduling and hosting are not configured by these commits.

1. Push the phased commits to `pilot`.
2. Add the same `.github/workflows/refresh-github.yml` to the default branch, currently `main`, through a reviewed commit or PR. Only that file is needed on `main` because it explicitly checks out `pilot`. Keep both copies synchronized when changing the schedule or steps. GitHub requires the workflow on the default branch for scheduled and manual triggers. [GitHub trigger documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
3. Enable Actions for the repository. Repository/organization policy must permit the job's `contents: write` permission and a bot push to `pilot`. The automatically provided `GITHUB_TOKEN` is sufficient; do not add a personal access token. If branch rules require PRs, adapt the update flow to a reviewed PR instead of bypassing those rules.
4. Connect Cloudflare Pages Free to this repository with `pilot` as production branch and the build settings in the README. Allow builds when `src/data/github.json` changes. Pages Git integration builds pushed branch changes. [Cloudflare Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)
5. In Actions, select **Refresh GitHub contributions**, then **Run workflow**. An unchanged result is a successful check with no deployment. On a real data change, verify the bot commit on `pilot`, the successful Pages deployment for that commit, and the displayed calendar/CSV. Hosted cache headers must be checked after this first deployment.

The `GITHUB_TOKEN` push does not trigger another GitHub Actions push workflow. This design uses Cloudflare's Git integration for deployment. If hosting later moves into a GitHub Actions workflow, deploy in this job or explicitly dispatch the deployment; do not assume a chained push workflow will run. [GitHub workflow triggering rules](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)

## Freshness and cost

This is a scheduled snapshot. Allow the refresh interval plus deployment time after GitHub exposes a change. GitHub itself can take up to 24 hours to show eligible contributions, and scheduled runs can be delayed or dropped. GitHub can disable public schedules after 60 days without repository activity. Check Actions if the date looks unexpectedly old. [Contribution delays](https://docs.github.com/en/account-and-profile/how-tos/contribution-settings/troubleshooting-missing-contributions), [schedule limitations](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)

Visitors make no GitHub API calls. Refreshing or reopening the portfolio reads the deployed calendar; an open page does not poll. SVG and CSV responses request cache revalidation, while hashed CSS stays immutable. A date on the page identifies the saved snapshot, not a claim that the scheduler ran recently.

The workflow runs only in the named public repository, uses a standard Ubuntu runner, disables dependency caching, uploads no artifacts, and has a ten-minute timeout. Standard runners are free for public repositories under current terms. The job skips private repositories and forks. [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)

Four scheduled checks per day can create at most 124 scheduled builds in a 31-day month, and fewer when data is unchanged. Pages Free currently includes 500 builds per month, shared with other builds in the account. Manual runs, retries, and ordinary code pushes also use that allowance. Stay on Free, do not enable paid add-ons, and pause automation rather than pay if the allowance is exhausted. [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)

## Local operation and rollback

```sh
npm run test:github
npm run refresh:github
npm run check
npm run build
```

An optional HTML path (`npm run refresh:github -- /path/to/calendar.html`) lets a maintainer reproduce parser behavior offline. Tests use synthetic HTML and temporary snapshots, never the committed data.

To pause refreshes, disable **Refresh GitHub contributions** in Actions. The last deployed calendar remains available. To undo an unwanted calendar update, disable the workflow first, then revert its bot commit and let Pages rebuild. Otherwise the next scheduled run can reapply the same GitHub data.

The baseline portfolio, punctuation cleanup, and automation are separate commits for backtracking. Revert the automation commit on `pilot` to remove its code, and remove/disable the workflow on `main` too; reverting only `pilot` does not turn off a schedule stored on the default branch.
