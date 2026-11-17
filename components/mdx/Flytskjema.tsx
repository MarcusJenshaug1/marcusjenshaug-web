import type { ReactNode } from 'react'

export type Trinn = {
  /** Spørsmålet som siler. Svarer du ja, går du ut her. */
  spor: string
  /** Teknikken som løser det uten modell. */
  ja: string
  /** Hvorfor den er å foretrekke. Kort. */
  hvorfor?: string
}

type Props = {
  tittel?: string
  trinn: Trinn[]
  /** Det som står igjen når ingen regel traff. */
  enden: { navn: string; detalj?: ReactNode }
}

/**
 * Et flytskjema tegnet som en sil, ikke som en graf: hvert spørsmål siler bort
 * det som kan løses uten modell, og det som faller helt gjennom er det eneste
 * som fortjener en. Lest ovenfra og ned på mobil, uten vannrett rulling.
 */
export function Flytskjema({ tittel, trinn, enden }: Props) {
  return (
    <figure className="my-8 not-prose">
      {tittel && (
        <figcaption className="mb-4 font-display text-[.8125rem] uppercase tracking-[.12em] text-ink-3">
          {tittel}
        </figcaption>
      )}

      <ol className="m-0 list-none p-0">
        {trinn.map((t, i) => (
          <li key={i} className="relative pb-5 pl-9 last:pb-0">
            <span
              aria-hidden
              className="absolute left-[11px] top-7 bottom-0 w-px bg-rule"
            />
            <span
              aria-hidden
              className="absolute left-0 top-1 grid h-[22px] w-[22px] place-items-center rounded-full border border-rule-strong bg-bg-elev font-mono text-[11px] text-ink-3"
            >
              {i + 1}
            </span>

            <p className="m-0 text-[.9375rem] font-medium leading-snug text-ink">{t.spor}</p>

            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-md border border-rule bg-bg-sunken px-3 py-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-ok">ja</span>
              <span className="text-[.875rem] text-ink-2">{t.ja}</span>
              {t.hvorfor && <span className="text-[.8125rem] text-ink-4">{t.hvorfor}</span>}
            </div>

            <p className="mt-1.5 mb-0 font-mono text-[11px] uppercase tracking-wider text-ink-4">
              nei, videre ned
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-1 ml-9 rounded-md border border-accent bg-accent-bg px-3 py-2.5">
        <p className="m-0 text-[.9375rem] font-medium text-accent-ink">{enden.navn}</p>
        {enden.detalj && <p className="mt-1 mb-0 text-[.875rem] text-ink-2">{enden.detalj}</p>}
      </div>
    </figure>
  )
}
