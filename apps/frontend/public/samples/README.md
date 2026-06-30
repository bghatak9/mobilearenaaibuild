# Bulk upload sample files

Download these from **Admin → Bulk Upload** or use the paths below.

All sample rows use **original MobileArena fictional brands and devices** (Volt Mobile, Nimbus Tech, Orbit Devices, Prism Labs, Echo Systems).

| Category | File | Notes |
|----------|------|--------|
| Phones | `phones-sample.csv` | Upload creates brands/categories automatically |
| Upcoming Devices | `upcoming-devices-sample.csv` | Requires `announced_date` and/or `released_date` (future launch) |
| Brands | `brands-sample.csv` | Optional `logo` path — uses `/samples/logos/*.svg` on this site |
| News | `news-sample.csv` | `title` + `content` required |
| Documentation | `documentation-sample.csv` | Same columns as news |
| Users | `users-sample.csv` | SUPER_ADMIN cannot be bulk-uploaded |
| Prices | `prices-sample.csv` | Upload **phones first** — matches device `name` |
| Reviews | `reviews-sample.csv` | Upload **phones first** — `device` must match |
| Images | `images-sample.zip` | ZIP folders = device **slug** (upload phones first) |

### Brand logos (local)

Sample logos live in `public/samples/logos/` (`volt.svg`, `nimbus.svg`, `orbit.svg`, `prism.svg`).

### Images ZIP layout

```
images-sample.zip
├── volt-stride-pro/
│   ├── front.png
│   └── gallery-1.png
├── nimbus-arc-ultra/
│   └── front.png
└── orbit-prism-mini/
    └── front.png
```

Folder names must match the slug generated from the phone `name` in `phones-sample.csv`.
