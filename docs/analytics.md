# Google Analytics 4 implementation

Measurement ID: `G-RMFH4E7NGS`

## Privacy boundary

- Google Analytics is not downloaded until the visitor grants analytics consent.
- Consent Mode v2 defaults `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization` to `denied` before any Google command that could measure activity.
- Accepting grants only `analytics_storage`; advertising storage and personalization remain denied.
- Page views use `location.origin + location.pathname`. The complete URL, query string, and hash are never sent.
- New reading and Gunghap state is stored in the URL fragment (`#...`), which browsers do not include in requests to GitHub Pages. Legacy query-string links are migrated to the fragment format in the browser.
- Event parameter names that could contain birth dates, times, gender, coordinates, contact details, or query data are rejected by the analytics wrapper.
- Analytics cookies expire after at most 90 days. Withdrawing consent updates Google consent, removes `_ga` cookies, and reloads the page without loading Google Analytics again.
- Birth dates, birth times, gender, cities, longitude, time-zone offsets, and calculated chart values stay in the browser.

## Events

| Event | Trigger | Safe parameters |
| --- | --- | --- |
| `page_view` | Each accepted page load | `page_title`, query-free `page_location`, `language` |
| `chart_submit` | Valid birth form submission | `language`, `calendar_type`, `pillar_status`, `solar_correction`, `reading_focus` |
| `chart_form_start` | First interaction with the birth form | `language` |
| `chart_view` | Successful chart render | `language`, `pillar_status`, `solar_correction`, `reading_focus` |
| `reading_focus_select` | A visitor selects a reading theme on the home or result page | `reading_focus`, `selection_area`, `language` |
| `chart_form_error` | Birth form validation failure | `error_type`, `language` |
| `chart_error` | Unexpected chart rendering failure | `error_type`, `language` |
| `luck_cycle_select` | A Daeun or Seun card is selected | `cycle_type`, `cycle_index`, `language` |
| `timing_tier_navigate` | Daeun, Seun, or Wolun timeline navigation | `timing_tier`, `language` |
| `reading_mode_select` | Beginner/expert display changes | `display_mode`, `language` |
| `onboarding_start`, `onboarding_step`, `onboarding_complete`, `onboarding_skip` | First-visit guide activity | `step_number` where applicable, `language` |
| `profile_save`, `profile_load`, `profile_delete` | Local-only profile activity | `storage_type`, `selection_area` where applicable, `language` |
| `gunghap_form_start`, `gunghap_submit`, `gunghap_view` | Compatibility funnel milestones | `language` |
| `gunghap_matrix_select` | A 4×4 compatibility cell is opened | `relation_state`, `language` |
| `comparison_history_open`, `comparison_history_clear` | Local comparison-history activity | `storage_type`, `language` |
| `chart_layer_toggle` | A visitor shows or hides Ten Gods, Hidden Stems, 12 Life Stages, or Shinsal in the original-chart matrix | `layer_name`, `layer_state`, `language` |
| `share` | Copy-link or PNG action | `method`, `content_type`, `language` |
| `glossary_open` | A visitor opens a glossary explanation | `term`, `language` |
| `navigation_click` | Internal navigation link | `destination`, `link_area`, `language` |
| `language_change` | Language selector changes | `from_language`, `to_language` |
| `shop_click` | Naver Store link | `destination`, `link_area`, `language` |
| `booking_click` | Kakao booking link | `destination`, `link_area`, `language` |
| `analytics_consent_update` | Analytics is accepted | `consent_choice` |

A rejection event is intentionally not sent because analytics consent is denied.

## GA4 property checklist

These settings live in Google Analytics and cannot be configured by repository code:

1. In **Admin → Data streams → Web**, confirm that the stream uses measurement ID `G-RMFH4E7NGS`.
2. Under **Enhanced measurement → Page views → Show advanced settings**, disable **Page changes based on browser history events**. The site sends one controlled, query-free and hash-free `page_view`; leaving history measurement enabled can create duplicate automatic page views. Keep this disabled even though the current code avoids `pushState`, `popState`, and `replaceState`.
3. In **Admin → Data collection and modification → Data retention**, choose the shortest retention period that meets the reporting need.
4. Create event-scoped custom dimensions for the safe parameters you want in Explorations, especially `language`, `destination`, `link_area`, `calendar_type`, `pillar_status`, `solar_correction`, `reading_focus`, `selection_area`, `cycle_type`, `cycle_index`, `timing_tier`, `display_mode`, `storage_type`, `relation_state`, `layer_name`, `layer_state`, `error_type`, and `term`.
5. Mark `booking_click` as a key event. Mark `shop_click` as a key event if store traffic is a business conversion.
6. Test in **Realtime** after accepting analytics. Use Google Tag Assistant to confirm the default denied state, the granted update, one query-free `page_view`, and the expected event names.

## Custom domain later

No code change is required. Page locations use the visitor's current origin, so they automatically switch from `tonyzorz.github.io` to the custom domain. Update the Web data stream URL in GA4, make the custom domain canonical in Astro, and redirect the GitHub Pages hostname to avoid splitting reports between two hostnames.
