---
description: "Build a brand's media folder as a ZIP for Admin, Media."
search: false
editLink: false
prev: false
next: false
head:
  - - meta
    - name: robots
      content: noindex, nofollow
---

# Prompt: brand media ZIP

Give this prompt to the agent that prepares the brand's media. Replace `<Brand Name>` and `<slug>` first. The slug must be the brand's slug in the portal.

```text
Build the media ZIP for the brand <Brand Name>, portal slug <slug>, for upload in the FS Ai Agency portal (Admin, Media, Upload Folder).

Use katiroll/ in the repo franchiseai/fsai-agency-portal-media as the model. Copy its folder layout, its manifest.json shape, its article JSON format and its social/<set>/plan.json format.

Rules. The portal refuses the upload if any of these fail:
- manifest.json is at the top of the ZIP. brand.slug is exactly <slug>, and brand.logo points to a file in the ZIP.
- Every file, data.cover and meta path in the manifest is a relative path to a file in the ZIP.
- Part kind is one of: website, lander, decks, ads, articles, images, social, ops-decks, lms. Each part key is unique.
- Asset kind is one of: slide, video, image, article, page.
- File and folder names use only letters, digits, ".", "-" and "_". A name does not start with "." or "-". No spaces.
- Images are png, jpg, webp or svg. Videos are mp4, webm or mov. Each file is 500 MB or less, and the ZIP holds at most 20,000 files. manifest.json is under 4 MB.
- Do not include a site/ folder. The website goes up separately.
- Leave out list_price, min_offer and floor on parts. Copy the packages block from katiroll as it is.

Before you zip, check that every path in the manifest exists. If you have the portal repo, run:
  npm run media:publish -- <folder> --brand <slug> --dry-run
It prints every problem and changes nothing.

Then give me the ZIP and a list of the parts and the number of assets in each.
```

## Upload

1. The brand must exist in Admin, Clients.
2. Go to Admin, Media, the brand, **Upload Folder**. Drop the ZIP.
3. The portal checks the manifest and every path before it uploads. Fix what it lists, then upload again.
