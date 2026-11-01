# Review Sites: comments on a hosted build

After purchase, a brand reviews its website and lander on a hosted build of its own repository. One script tag adds the sign-in check and the comment tools. Nobody installs anything.

Comments go to the brand's review round in the portal, with the page, the spot and a picture of the area. Rounds, answers and Final work as they do for every other part.

## 1. Host the build

Each brand has its own repository and its own Vercel project.

1. Create the project in the agency's Vercel team. Do not connect automatic production deploys. A build must stay still during a round, and nothing else keeps it still.
2. Add the domain `<brand>-review.fsaiagency.com` to the project. Use one label before `-review`, with no dots.
3. Add a DNS record in the `fsaiagency.com` zone: `CNAME`, name `<brand>-review`, target `cname.vercel-dns.com`, DNS only (not proxied).
4. Deploy only between rounds.

## 2. Add the tag

Put the tag first in `<head>`. Do not use `async`, `defer` or a framework's lazy loading: the page must stay hidden until the script runs.

```html
<script src="https://portal.fsaiagency.com/review-site.js"></script>
```

In a Next.js root layout, a setting keeps the tag and `noindex` out of the production build:

```tsx
const portal = process.env.NEXT_PUBLIC_REVIEW_SITE_PORTAL;

export const metadata = {
  ...(portal ? { robots: { index: false, follow: false } } : {}),
};

// In the root layout:
<head>
  {portal ? <script src={`${portal}/review-site.js`} /> : null}
</head>
```

Set `NEXT_PUBLIC_REVIEW_SITE_PORTAL=https://portal.fsaiagency.com` only on the Review Site's project.

The script does nothing on a host that does not end in `-review.fsaiagency.com`, so a tag left in a live build has no effect. If the site sends a Content-Security-Policy, allow `https://portal.fsaiagency.com` in `script-src` and `connect-src`.

## 3. Add the link

In the portal, open Admin, the brand, Kit, then Links.

| Part | Slot | Example |
| --- | --- | --- |
| Website | Staging | `https://katiroll-review.fsaiagency.com/` |
| Lander, one page | Lander | `https://katiroll-review.fsaiagency.com/franchise` |
| Lander, with markets | One slot per market | `https://katiroll-lander-review.fsaiagency.com/austin` |

Each link is a full URL, so a lander can share the website's host or have its own. The longest link path that matches a page decides which part a comment goes to. A page that matches no link opens, but it takes no comments.

One host serves one brand. The portal refuses a host that another brand already uses.

Agents can set the same link with the MCP tool `set_review_site_link`.

## What people see

- **Signed out:** the page stays hidden. The person goes to the portal's sign-in, then back to the same page.
- **The brand's team, after purchase:** a toolbar at the bottom of the page, with Comment, Select Area, Select Text and the list of comments. Submit Round stays in the portal.
- **Agency users:** the site and its comments, read only. They answer comments in the portal.
- **Anyone else:** a page that says they have no access.

The brand opens the site from the Website page, the Lander page, the Review hub, Welcome and the round emails. Before purchase, those pages keep the uploaded preview.

## What the lock does not do

The lock is a sign-in check in the browser. The site's HTML and files still reach anyone who asks for them, and the page shows if the script cannot load. Put nothing secret on a Review Site.

## Troubleshooting

| What you see | Cause | Fix |
| --- | --- | --- |
| The page shows with no toolbar | The tag is missing or runs late, or the host does not end in `-review.fsaiagency.com` | Check the tag and the domain |
| "This Review Is Not Connected" | No link in the portal has this host | Add the link in Admin |
| "No Access To This Review" | The account is not an active member of the brand, or the brand has not bought the part | Invite the person, or check the purchase |
| "This page is not in this review" | The page's path matches no link | Add a link that covers the path |
| "Sign In To Review" after signing in | The browser did not send the session | Open the site on its `fsaiagency.com` host, not a `vercel.app` URL |
| No Comment button | The round is closed, or the person is an agency user | Open a round, or sign in as a member of the brand |
