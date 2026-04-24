export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-surface/40">
      <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-muted-foreground">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="font-serif text-xl text-foreground">Tamil AI Vanoli</div>
            <p className="mt-2 max-w-sm leading-relaxed">
              An independent AI internet radio station. Original Tamil RJ-style shows generated from
              public sources and verified inputs.
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-foreground/80">Disclosure</div>
            <p className="mt-2 max-w-sm leading-relaxed">
              AI-generated radio content based on public sources and verified inputs. We do not
              affiliate with, imitate, or republish any existing radio station, RJ, or copyrighted
              article text.
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-foreground/80">Editorial</div>
            <p className="mt-2 max-w-sm leading-relaxed">
              Sensitive segments (politics, religion, caste, finance, health, legal, emergency) go
              through admin approval before publishing. Source links are shown beside factual segments.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-border/60 pt-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Tamil AI Vanoli — built with care for Tamil listeners.
        </div>
      </div>
    </footer>
  );
}
