# Website Video Update Playbook

Purpose: give KP a simple GitHub-based operating guide for updating the Penn Enterprises site with videos of current work, automations, dashboards, and client-ready systems.

Status as of 2026-06-03: planning guide added to GitHub. This document does not deploy the site by itself.

## Verified Starting Point

The live Penn Enterprises website is currently on Netlify:

- Production URL: https://pennenterprisesllc.com
- Netlify project: courageous-souffle-e1386d
- Netlify admin URL: https://app.netlify.com/projects/courageous-souffle-e1386d
- Netlify project ID: 2958cf7b-174c-4d89-a133-474165265e9e
- Local deploy folder found on KP machine: `/Users/kp/KP MANAGEMENT/Penn Enterprises LLC/Website`
- Existing portfolio route: `/portfolio`

Important: the local Netlify deploy folder looked like deployment output, not a full editable Git repo. Before production edits, confirm the editable source repo or rebuild source control around the current site.

## What GitHub Does In This Workflow

GitHub should become the source of truth for the site update process.

Use GitHub for:

- Website source code
- Portfolio data structure
- Update instructions
- Change history
- Pull requests before risky changes
- Receipts showing what changed and when

Do not use GitHub as the main video host. Store video files in a video platform or object storage, then save the video link in the site data.

## Recommended Video Flow

1. Record the current work
   - Screen recording of the automation, dashboard, website, or workflow.
   - Keep the video focused on the result and proof.

2. Upload the video outside GitHub
   - Best simple options: YouTube unlisted, Vimeo, Loom, Cloudinary, or Cloudflare R2.
   - Save the public or unlisted playback URL.

3. Add project metadata
   - Title
   - Short description
   - Problem solved
   - Automation or system built
   - Tools used
   - Video URL
   - Thumbnail URL
   - Status: building, shipped, live, or archived
   - Receipt date

4. Preview the site
   - Run the site locally or create a deploy preview.
   - Check that the video card opens correctly.
   - Check mobile layout.

5. Deploy after review
   - Publish only after the preview looks right.
   - Keep the GitHub commit as the receipt.

## Starter Portfolio Item Shape

Use this structure when adding videos to the site source later:

```json
{
  "title": "Lead Intake Automation",
  "slug": "lead-intake-automation",
  "status": "live",
  "category": "Automation",
  "summary": "A system that captures leads, scores them, and routes follow up without manual sorting.",
  "problem": "Leads were coming in without a consistent response path.",
  "solution": "Built a Make.com workflow connected to CRM tracking and owner alerts.",
  "tools": ["Make.com", "Google Sheets", "CRM", "Email"],
  "videoUrl": "https://example.com/video",
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "receiptDate": "2026-06-03"
}
```

## GitHub Learning Map For KP

Start here:

1. Repository
   - The project folder on GitHub.
   - Example: `clashon64-ship-it/Penn-Dashboard`.

2. Branch
   - A workspace line where changes happen.
   - Default branch in this repo is currently `claude/penn-dashboard-RvKeb`.

3. Commit
   - A saved change with a message.
   - This is your proof that something was added or changed.

4. Pull request
   - A review lane before merging changes.
   - Use this when a change might break the live site.

5. Deploy preview
   - A temporary version of the site for checking before production.
   - This is where videos and layout should be reviewed before going live.

## First Real Build Step

Create one editable source path for the public website.

Best path:

1. Find the current editable source repo for `pennenterprisesllc.com`.
2. If it does not exist, reconstruct it from the current Netlify output.
3. Add a `portfolio` data file to that source repo.
4. Make `/portfolio` render cards from that data file.
5. Add the first 3 current-work videos.
6. Connect Netlify to GitHub so pushes or approved PRs can deploy cleanly.

## Receipt Rules

Every website update needs a receipt:

- Code receipt: GitHub commit URL or commit SHA
- Deploy receipt: Netlify deploy URL and production URL checked
- Video receipt: video URL opened and playable
- Content receipt: portfolio title, status, and date shown on page

If one of those is missing, call the work partial instead of done.

## Open Questions

- Where is the current editable source repo for `pennenterprisesllc.com`?
- Should videos be hosted on YouTube unlisted, Loom, Vimeo, Cloudinary, or Cloudflare R2?
- Should the portfolio be managed from a plain JSON file first, or from Notion or Airtable later?
- Do we want Netlify deploys to trigger automatically from GitHub, or require manual approval first?
