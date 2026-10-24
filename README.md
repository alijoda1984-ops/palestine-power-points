# Palestine Power Points

Build a mobile-first Arabic RTL progressive web app named «كيلة الأعمال الكهربائية» for a Palestinian electrician. This is a real working tool, not just a mockup. Use a simple, clear interface optimized for iPhone Safari. Core requirements: (1) Home screen with clear actions: اتفاقية عمل, مشروع جديد, المشاريع المحفوظة, النسخ الاحتياطي. (2) Project setup captures project name/location, owner and electrician details, date, agreement mode: «العمل مع بضاعة» or «مصانعة», and a user-entered price per point. (3) The work-with-goods mode uses only the union-book column for points with goods; manufacturing mode must be treated as a separate ruleset and must not reuse 2018 values because the user will supply a separate 2025 book. Do not calculate, display, or include material/goods cost anywhere. (4) Project calculation table in RTL with columns item/code, quantity, points per item, total points. Allow search/filter by section and item, adding quantities, editing/removing project lines, subtotal by section, total points, price per point and labor total only. (5) Save and reopen multiple projects on the device using IndexedDB or localStorage; include JSON export/import backup and clear validation/error states. (6) Print-friendly detailed project report and agreement export/print, with Arabic typography and RTL layout. (7) PWA support: manifest, service worker, app icons/metadata suitable for iOS Add to Home Screen; make clear that installation requires the deployed HTTPS URL. (8) Keep data local-first and do not require login or cloud database in the first version. (9) Do not fabricate any union-book point values, legal terms, or 2025 manufacturing values. Until verified source data is provided, create a clearly marked import/data-management route and sample rows visibly labeled as test data, never as official values. Do not include the separate PDF named «محمد عبدالله رمون» as a source. Keep the design very simple, high-contrast, large touch targets, and no item pictures. Please implement actual working controls and test key flows, especially project creation, calculations, save/load, backup import/export, and print. Report any remaining limitations honestly.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://palestine-power-points.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a60ffe0c-7560-4fba-aa44-5fe68304df8f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
