# Put your website live on your domain

We host your new website. You keep your domain. To go live, your domain needs to point to us. That takes a few DNS records, added once.

## 1. Tell us about your domain

In **Launch Setup** in your portal, fill in **Website And Domain**:

- the domain, for example `yourbrand.com`, or a subdomain such as `franchise.yourbrand.com`
- where it is registered, for example GoDaddy, Cloudflare or Squarespace
- who can change its DNS, with their email

## 2. Add the records we send you

When your Final Kit is approved, we email you the records, with the subject **Three Records To Put [your brand] Live**. Forward it to whoever manages the domain. They add the records at your domain provider, in its DNS settings.

The email has the exact values. A typical set looks like this:

| Type    | Name                | Value                  |
| ------- | ------------------- | ---------------------- |
| `A`     | `@`                 | `76.76.21.21`          |
| `CNAME` | `www`               | `cname.vercel-dns.com` |
| `TXT`   | `_vercel`           | a code, only if our email lists one |

A subdomain such as `franchise.yourbrand.com` needs only one `CNAME`, with the name `franchise`.

- **Replace** the `A` record for `@` and the `CNAME` for `www` if they exist. Your old site stops when you do this, so add the records when you are ready to switch.
- **Do not change** your `MX` records or other `TXT` records. They run your email.
- **On Cloudflare**, set each record to **DNS only** (grey cloud), not Proxied.

Prefer not to do it yourself? Reply to our email, give us access to your DNS, and we add the records for you.

## 3. We check it and put it live

When the records are in, we:

- connect the domain and turn on HTTPS, automatically and free
- check that every form sends its leads to your pipeline
- check your tags: Google Tag Manager, Google Analytics and the Meta pixel

Then we email you that your site is live. DNS changes usually show within an hour. Some providers take up to 48 hours.

## If something looks wrong

- **The old site still shows:** your device may still have the old address. Wait an hour, or try on your phone with Wi-Fi off.
- **A security warning shows:** the HTTPS certificate is still being issued. This takes a few minutes after the records are in.
- **Email stopped working:** an `MX` or email `TXT` record was changed. Put it back as it was, then tell us.

Questions at any step: reply to our email, or use **Help** in your portal.
