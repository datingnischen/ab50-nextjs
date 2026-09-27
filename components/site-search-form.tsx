import { SITE_SEARCH_PATH } from "@/lib/site-search";

/** GET-Formular auf /ueber-uns/suche/?q=… – ohne Client-JS, funktioniert hinter nginx auf ab50.de. */
export function SiteSearchForm({
  query = "",
  label = "Magazin und Stadtseiten durchsuchen",
  compact = false,
  autoFocus = false,
}: {
  query?: string;
  label?: string;
  compact?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <form className={`site-search-form${compact ? " site-search-form-compact" : ""}`} action={SITE_SEARCH_PATH} method="get" role="search">
      <label className="site-search-label" htmlFor={compact ? "site-search-q-compact" : "site-search-q"}>{label}</label>
      <div className="site-search-row">
        <input
          id={compact ? "site-search-q-compact" : "site-search-q"}
          className="site-search-input"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="z. B. Berlin, Profil, Sicherheit"
          maxLength={100}
          autoComplete="off"
          autoFocus={autoFocus}
        />
        <button className="button-primary site-search-button" type="submit">Suchen</button>
      </div>
    </form>
  );
}
