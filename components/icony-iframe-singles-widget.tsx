import type { IconyWidgetLocation } from "@/data/city-widget-locations";

type IconyGender = 1 | 2;

type WidgetFrameInput = {
  city: string;
  platformId: string;
  location: IconyWidgetLocation;
  gender: IconyGender;
  profileClickUrl: string;
  fallbackSearchUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function frameDocument({ city, platformId, location, gender, profileClickUrl, fallbackSearchUrl }: WidgetFrameInput) {
  const options = JSON.stringify({
    platformId,
    city,
    gender,
    country: location.country,
    zip: location.zip || "",
    count: 6,
    ageMin: 48,
    affiliate: "location",
    profileClickUrl,
    fallbackSearchUrl,
  }).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<style>
  :root { color-scheme: light; --brand:#1A4C95; --brand-dark:#143d77; --muted:#5f6b7e; --line:#d8e2f0; --text:#253144; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: transparent; color: var(--text); }
  a { color: inherit; text-decoration: none; }
  .state { min-height: 246px; display: grid; place-items: center; padding: 18px; border: 1px solid var(--line); border-radius: 24px; background: #f7fbff; color: var(--brand-dark); font-weight: 850; text-align: center; }
  .grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; }
  .tile { display: grid; gap: 8px; min-width: 0; padding: 10px; border: 1px solid var(--line); border-radius: 20px; background: #fff; box-shadow: 0 10px 28px rgba(26,76,149,.06); }
  .tile:hover { border-color: rgba(26,76,149,.28); transform: translateY(-1px); }
  .image { aspect-ratio: 1; overflow: hidden; border-radius: 16px; background: linear-gradient(135deg, #edf3fc, #f7fbff); }
  .image img { width: 100%; height: 100%; object-fit: cover; display: block; }
  strong, span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  strong { font-size: .94rem; line-height: 1.2; }
  span { color: var(--muted); font-size: .82rem; line-height: 1.3; }
  @media (max-width: 680px) { .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (max-width: 420px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
</head>
<body>
<div id="root" class="state">Singles werden geladen…</div>
<script>
(function(){
  var options = ${options};
  function installIcony(win, doc) {
    if (win.icony) return;
    (function(i,c,o,n,y,j,s){i['IconyObject']=y;i[y]=i[y]||function(){function b(a){return a?(a^Math.random()*16>>a/4).toString(16):'i'+([1e7]+1e7).replace(/[018]/g,b)+1*new Date}var k=arguments;k.id=b();(i[y].q=i[y].q||[]).push(k);if(i[y].R){i[y].R()};return k.id;};j=c.createElement(o),s=c.getElementsByTagName(o)[0];j.async=1;j.src=n;s.parentNode.insertBefore(j,s)})(win,doc,'script','https://js.icony.com/api.js','icony');
  }
  function normalizeImage(url) { if (!url) return ''; return url.indexOf('//') === 0 ? 'https:' + url : url; }
  function safeText(value) { return String(value || '').replace(/[&<>]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]; }); }
  function render(items) {
    var root = document.getElementById('root');
    if (!Array.isArray(items) || !items.length) {
      root.className = 'state';
      root.textContent = 'Gerade keine Schnelltreffer. Bitte die ausführliche Suche nutzen.';
      return;
    }
    root.className = 'grid';
    root.innerHTML = items.slice(0, options.count).map(function(item) {
      var image = normalizeImage(item.imageurl);
      var href = options.profileClickUrl || item.vcardurl || options.fallbackSearchUrl;
      var name = safeText(item.username || 'Profil aus ' + options.city);
      var info = safeText(item.userinfo_text || [item.age ? item.age + ' Jahre' : '', item.city || options.city].filter(Boolean).join(', '));
      return '<a class="tile" href="' + href.replace(/"/g, '&quot;') + '" target="_blank" rel="noopener noreferrer">'
        + '<div class="image">' + (image ? '<img src="' + image.replace(/"/g, '&quot;') + '" alt="Profilbild von ' + name.replace(/"/g, '&quot;') + '" loading="lazy" />' : '') + '</div>'
        + '<strong>' + name + '</strong><span>' + info + '</span></a>';
    }).join('');
  }
  installIcony(window, document);
  window.icony('create', options.platformId);
  window.icony('get', 'activities', 'json', function(response) { render(response && response.data); }, {
    count: options.count,
    gender: options.gender,
    country: options.country,
    zip: options.zip,
    age_min: options.ageMin,
    affiliate: options.affiliate,
    use_thumbnails: 0,
    blurred: 0
  });
})();
</script>
</body>
</html>`;
}

function frameTitle(gender: IconyGender, city: string) {
  return gender === 2 ? `Frauen aus ${city}` : `Männer aus ${city}`;
}

export function IconyIframeSinglesWidget({
  city,
  platformId,
  location,
  searchUrl,
  profileClickUrl,
  eyebrow,
  title,
  text,
  ctaLabel,
  note,
}: {
  city: string;
  platformId: string;
  location: IconyWidgetLocation;
  searchUrl: string;
  profileClickUrl: string;
  eyebrow?: string;
  title?: string;
  text?: string;
  ctaLabel?: string;
  note?: string;
}) {
  const cityLabel = escapeHtml(city);
  const widgetEyebrow = eyebrow || "Singles entdecken";
  const widgetTitle = title || `Neue Singles in ${city}`;
  const widgetText = text || "Wähle, ob du Frauen oder Männer sehen möchtest. Wenn du den Umkreis erweitern willst, kannst du direkt ausführlicher suchen.";
  const widgetCtaLabel = ctaLabel || `Ausführlicher in ${city} suchen`;
  const widgetNote = note || "Kostenlos starten · Umkreis selbst erweitern · diskret stöbern";

  return (
    <section className="container icony-iframe-section" aria-label={`Singles in ${city}`}>
      <div className="icony-iframe-copy">
        <p className="eyebrow">{widgetEyebrow}</p>
        <h2>{widgetTitle}</h2>
        <p>{widgetText}</p>
      </div>

      <div className="icony-iframe-tabs">
        <input type="radio" name={`icony-singles-${pageSafeId(city)}`} id={`icony-women-${pageSafeId(city)}`} defaultChecked />
        <label htmlFor={`icony-women-${pageSafeId(city)}`}>Frauen anzeigen</label>
        <input type="radio" name={`icony-singles-${pageSafeId(city)}`} id={`icony-men-${pageSafeId(city)}`} />
        <label htmlFor={`icony-men-${pageSafeId(city)}`}>Männer anzeigen</label>

        <div className="icony-iframe-panel icony-iframe-panel-women">
          <iframe
            title={frameTitle(2, city)}
            srcDoc={frameDocument({ city: cityLabel, platformId, location, gender: 2, profileClickUrl, fallbackSearchUrl: searchUrl })}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
          />
        </div>
        <div className="icony-iframe-panel icony-iframe-panel-men">
          <iframe
            title={frameTitle(1, city)}
            srcDoc={frameDocument({ city: cityLabel, platformId, location, gender: 1, profileClickUrl, fallbackSearchUrl: searchUrl })}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
          />
        </div>
      </div>

      <div className="icony-iframe-actions">
        <a className="button-primary" href={searchUrl}>{widgetCtaLabel}</a>
        <span>{widgetNote}</span>
      </div>
    </section>
  );
}

function pageSafeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "city";
}
