-- Seed av uses-items: Utvikling, Tjenester, Hverdag
-- Maskinvare er lagt inn manuelt. Idempotent via WHERE NOT EXISTS.

insert into uses_items (category, name, description, url, order_index)
select t.category, t.name, t.description, nullif(t.url, ''), t.order_index
from (values
  -- Utvikling
  ('Utvikling', 'VS Code', 'Primær editor. Kjører mørkt tema med Inter som UI-font.', 'https://code.visualstudio.com/', 10),
  ('Utvikling', 'Claude Code', 'AI-parprogrammerer i terminalen. Uunnværlig for større refaktoreringer og oppsett.', 'https://www.anthropic.com/claude-code', 20),
  ('Utvikling', 'GitHub Copilot Chat', 'Inline AI-assistent i VS Code. Raskere feedback-loop enn å bytte vindu.', 'https://github.com/features/copilot', 30),
  ('Utvikling', 'Windows Terminal', 'Terminal-emulator med tabs og profiler.', 'https://aka.ms/terminal', 40),
  ('Utvikling', 'Git + GitHub CLI', 'Versjonskontroll og gh-kommandoen for PR-er uten å forlate terminalen.', 'https://cli.github.com/', 50),
  ('Utvikling', 'pnpm', 'Pakke-manager. Raskere enn npm og ærlig om dependencies via strict node_modules.', 'https://pnpm.io/', 60),
  ('Utvikling', 'Bun', 'Bruker det til raske one-off scripts og eksperimentering.', 'https://bun.sh/', 70),
  ('Utvikling', 'Tailwind CSS IntelliSense', 'VS Code-extension for Tailwind-autocomplete og hover-dokumentasjon.', 'https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss', 80),
  ('Utvikling', 'MDX for VS Code', 'Syntax highlighting og preview for MDX-filer.', 'https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-mdx', 90),
  ('Utvikling', 'ngrok', 'Tunnelering av lokale servere for å teste webhooks og mobile views raskt.', 'https://ngrok.com/', 100),

  -- Tjenester
  ('Tjenester', 'Vercel', 'Hosting for små prosjekter og personlige sider. Førsteklasses Next.js-støtte.', 'https://vercel.com/', 10),
  ('Tjenester', 'Azure', 'Hosting for større prosjekter og enterprise-oppdrag. App Service, Functions og SQL Database.', 'https://azure.microsoft.com/', 15),
  ('Tjenester', 'Supabase', 'Postgres, auth og storage i én pakke. Kjernen i Klink og denne siden.', 'https://supabase.com/', 20),
  ('Tjenester', 'GitHub', 'Koden min og alle sideprosjektene bor her.', 'https://github.com/', 30),
  ('Tjenester', 'Cloudflare', 'DNS og cache-lag for egne prosjekter.', 'https://www.cloudflare.com/', 40),
  ('Tjenester', 'Figma', 'Design og mockups før jeg begynner å kode.', 'https://www.figma.com/', 50),
  ('Tjenester', 'Uniweb', 'Domeneregistrar for .no-domenene mine.', 'https://www.uniweb.no/', 60),

  -- Hverdag (Firefox droppet, Chrome oppgradert til primær)
  ('Hverdag', 'Obsidian', 'Notat-app med markdown og lokale filer. Her samler jeg ideer, læringsnotater og research.', 'https://obsidian.md/', 10),
  ('Hverdag', 'Claude', 'AI-assistent for alt fra debugging til skriving.', 'https://claude.ai/', 20),
  ('Hverdag', 'Bitwarden', 'Passordhåndtering. Gratis, open source, og fungerer overalt.', 'https://bitwarden.com/', 30),
  ('Hverdag', 'Chrome', 'Primær nettleser. DevTools og Lighthouse for utvikling.', 'https://www.google.com/chrome/', 40),
  ('Hverdag', 'Discord', 'Kommunikasjon med venner og utvikler-fellesskap.', 'https://discord.com/', 50),
  ('Hverdag', 'Spotify', 'Musikk og lydbøker. Lofi og ambient når jeg kjører dype fokus-økter.', 'https://www.spotify.com/', 60),
  ('Hverdag', 'Inter', 'Foretrukket font for UI og redaktør. Designet for skjerm, leses godt i alle størrelser.', 'https://rsms.me/inter/', 70)
) as t(category, name, description, url, order_index)
where not exists (
  select 1 from uses_items u
  where u.category = t.category and u.name = t.name
);
