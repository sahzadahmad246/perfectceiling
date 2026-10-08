# PageSpeed findings and fixes

The shared report dated 8 October 2026 was retrieved as HTML. Its embedded Lighthouse results contain both mobile and desktop audits. No local browser, production build, or API key was used to obtain it.

- Mobile: performance 87, accessibility 92, best practices 100, SEO 100. FCP 0.9 s, LCP 3.5 s, speed index 5.1 s, TBT 10 ms, CLS 0.005.
- Desktop: performance 99, accessibility 92, best practices 100, SEO 100. FCP 0.3 s, LCP 0.5 s, speed index 1.3 s, TBT 10 ms, CLS approximately 0.
- The LCP element is the first hero image. Its eager loading, priority hint and initial-document discovery already passed. The breakdown still reports a substantial resource load delay, so responsive head preloading is an additional targeted improvement, not a correction of lazy loading.
- The report contains no available CrUX record for the tested URL/origin. Lab scores do not establish a field Core Web Vitals pass.

## Changes

1. Preload only the initial hero image using Next.js 16's `preload`, with matching responsive sizes. Later slides retain low-priority loading; do not preload all five images.
2. Correct catalogue mosaic sizes to account for card padding and the actual two-thirds/one-third columns, including a full-width single-photo collection. This allows smaller matching responsive candidates instead of the oversized 640px preview reported on desktop.
3. Permit quality 65 alongside 75 and use 65 only for small catalogue/service previews. Keep the hero, project images, detail galleries and full-size source images at their existing quality.
4. Darken the flagged homepage text colors while retaining backgrounds and layout. Verify the replacement text/background pairs meet 4.5:1 contrast.
5. Give the rating stars a valid named `img` role. Remove the redundant prohibited label from the numeric rating paragraph.
6. Lazy-load and asynchronously decode the decorative Google reviewer avatar, reserving its dimensions.

## Remaining observations

The report flags roughly 47 KiB of unused JavaScript and 12 KiB of legacy polyfills in framework chunks. With only 10 ms TBT, these are secondary to image loading; stripping framework code or browser compatibility support is not justified by this run. The render-blocking stylesheet is approximately 16 KiB with a mobile estimate of 170 ms; keep required styles rather than introducing an unstyled initial page. Google's externally hosted avatar has an estimated 2 KiB cache saving; its cache headers are controlled by Google.

The original report is a fixed historical snapshot. These changes have passed type checking, targeted lint and 24 tests, but a new production PageSpeed run after deployment is required to quantify any score or LCP improvement. No new score is claimed.

Reports:
- https://pagespeed.web.dev/analysis/https-perfectceiling-co-in/crpxs981qy?form_factor=mobile
- https://pagespeed.web.dev/analysis/https-perfectceiling-co-in/crpxs981qy?form_factor=desktop

## Follow-up for the remaining screenshot findings

- **Render-blocking CSS:** editor-only toolbar and popup rules now load with the dynamically imported BlockNote editor. Public reading typography remains in the shared stylesheet. This reduces unnecessary shared styles; required Tailwind/layout styles remain render-blocking.
- **Unused application JavaScript:** the public-page toast renderer is dynamically loaded after window load/idle or first interaction. Admin/login routes mount it immediately. The report's unused React/Next runtime bytes are not claimed eliminated.
- **Caching and third parties:** supported reviewer avatar URLs now use Next's image optimizer and first-party delivery, retaining lazy loading, dimensions, no-referrer behavior and initials on failure. Unknown hosts keep the existing fallback.
- **Layout shift:** the slideshow play/pause control reserves its 44px slot even before the reduced-motion preference is resolved. The report's other small shift came from the preloaded web font swapping in; metric-adjusted Next font fallback is already enabled. CLS 0.005 passes the lab threshold and is not a field measurement.
- **Long task:** the sole reported task is 61 ms in the framework bootstrap, contributing roughly 10 ms of blocking time. A fresh deployed run is needed to assess whether deferred work changes it.
- **Legacy JavaScript:** the 12 KiB warning points to Next's compatibility polyfills. They have not been stripped using an unsupported webpack alias or an unverified browser-support change.

The screenshot references the same saved report ID (`crpxs981qy`). It continues to display its original findings after code changes; run a new analysis after the new deployment finishes.
