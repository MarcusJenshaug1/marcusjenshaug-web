# Portrett som følger musa

Støttedokument for loopen. Oppdateres underveis.

## Kravet (ordrett)

Portrettet på forsiden skal reagere på musa som om jeg faktisk ser på den. Ett foto, ingen genererte bilder, jevn bevegelse. Slik henger delene sammen:

**Utgangspunkt:** Det originale portrettet, tegnet i WebGL med dagens effekt (litt drift, ripple og fargeforskyvning når musa er over bildet). Denne effekten skal beholdes.

**Hodet dreier:** Oppå portrettet ligger et usynlig mesh (rutenett) som dekker hode, hår, ører og hals. Hvert vertex har en dybdeverdi hentet fra et dybdekart laget av bildet med en AI-dybdemodell (f.eks. Depth Anything / MiDaS). Når musa flytter seg, roteres meshet litt om et pivotpunkt bak hodet, slik at nesen flytter seg mer enn ørene. Kantvertexene (skuldre, bakgrunn) er låst, så bare hodet beveger seg og det oppstår ingen synlig søm. Bildet strekkes altså på riktig sted, som et ansiktsfilter, uten at nettet er synlig.

**Øynene følger:** Inne i hver øyeåpning forskyves bildet litt mot musa. Øyelokkene står stille, iris flytter seg. Øyeåpningene defineres av landmarks fra MediaPipe Face Mesh, kjørt én gang offline (ikke i nettleseren ved runtime) og lagret som statiske koordinater.

**Kontinuerlig bevegelse:** Musposisjon mappes til en retning i [-1, 1] på begge akser og glattes med lerp per frame, så hodet glir i stedet for å hoppe. Går musa ut av vinduet, glir alt tilbake til nøytral (rett fram).

**Forkastet, skal ikke prøves igjen:**
- AI-genererte varianter av portrettet (lignet ikke)
- Sprite-bytting mellom vinkler (hakkete)
- Tilt/forskyvning av hele bildet (feil ting beveget seg)

## Slik er WebGL-portrettet bygget

Filer: `components/fx/HeroVisual.tsx` (montering, fallback), `components/fx/HeroScene.tsx` (R3F-scene, shader, pekersporing), `components/fx/HeadWarp.tsx` (deformasjonsmesh), `components/fx/face/head-grid.json` (data).

- **Stack:** three.js via `@react-three/fiber` 9 og `@react-three/drei` (`useTexture`). Scenen lastes med `next/dynamic` uten SSR, kun når WebGL finnes, viewport ≥ 768 px, ikke `prefers-reduced-motion`, ikke `pointer: coarse`. Ellers vises `next/image`-fallback.
- **Bakgrunnsplan:** `planeGeometry` skalert til viewport, `ShaderMaterial` med `coverUv` (object-fit: cover), støy-drift, ripple ved pekerbevegelse over bildet (`uMouse`, `uVelocity`) og RGB-forskyvning. Uniforms: `uTexture`, `uDepth`, `uLook`, `uParallax` (0), `uFace`, `uEyeA`, `uEyeB`, `uEyeShift`, `uTime`, `uVelocity`, `uMouse`, `uImageAspect`, `uPlaneAspect`.
- **Pekersporing:** én `pointermove`-lytter på `window`. Retning relativt til lerretets senter, normalisert med 45 % av viewport, klemt til [-1, 1], lagret i en ref. `useFrame` lerper `uLook` mot målet (0.06 per frame). `pointerleave` på `<html>` setter målet til (0, 0).
- **Touch (`pointer: coarse`):** scenen monteres også der, men `input="scroll"`: én `scroll`-lytter mapper `scrollY / (60 % av viewport-høyden)` til blikk ned (0 → -1) med 35 % sideveis dreining. Øverst på siden ser han rett fram. Samme mesh, shader og lerp.
- **Hodemesh:** 40×52-rutenett over regionen x 0.27–0.87, y 0.02–0.80 av bildet. Per vertex: bilde-uv (fast), dybde fra dybdekartet, elliptisk vekt (1 innenfor 60 % av ellipsen, 0 ved kanten). Rotasjon yaw ±10°, pitch ±6° om et pivot bak hodet, relieff fra dybde. Samme fragment-shader som bakgrunnen med `uFace = 1` (hopper over cover-mapping og parallakse), så drift/ripple/RGB-forskyvning ligger også på hodet.
- **Øyne:** ellipser fra MediaPipe-landemerker (33/133/159/145 og 263/362/386/374). I `uFace`-grenen forskyves uv innenfor ellipsen mot `uLook` med `smoothstep(1.0, 0.5, r)` som maske.

### Historikk i denne runden

| PR | Hva | Resultat |
|---|---|---|
| #12 | 7×7 sprite av AI-genererte hodevinkler + lukkede øyne | Revertert: lignet ikke, hakkete |
| #13–#15 | Dybdeparallakse på hele bildet | For subtilt / feil ting beveget seg |
| #16–#17 | Lerretstørrelse-fiks (`ResizeSync`) + 3D-tilt av hele bildet | Tilt forkastet |
| #18 | 468-punkts landemerke-mesh over ansiktet med synlig wireframe | Riktig teknikk, men bare ansiktet og synlig nett |
| #19 | `image_url` = `/portrett.jpg` ble tolket som egendefinert bilde → effekten var av | Fikset |
| #20 | `HeadWarp`: usynlig rutenett over hode+hals, øyne i shader | Live |

## Research

Fire parallelle agenter, sammendrag med kilder.

### A. Dybdekart

- Depth Anything V2 er mer robust enn MiDaS (hallusinerer dybde ved sterke kanter) og enklere enn Marigold (krever torch/diffusers, støyete). Anbefaling: `onnx-community/depth-anything-v2-base` via transformers.js i Node; `small` er glattere, `large` gir mest relieff. Ingen modell gir ren hår-silhuett, så silhuetten må maskeres separat.
- Modellen jobber på 518 px; PNG-en fra pipelinen er bare oppskalert. Sample ned med area-average og blur ≈ én rutenettcelle før sampling, og normaliser dybden innenfor hoderegionen, ikke hele bildet.
- DA V2 gir relativ invers dybde: høy verdi = nær (nesetippen lysest). Relativ ≠ metrisk, men det er irrelevant her.
- Kilder: [DA V2-paper](https://arxiv.org/html/2406.09414v1), [Roboflow om dybdemodeller](https://blog.roboflow.com/depth-estimation-models/), [Marigold V2](https://arxiv.org/html/2609.08084v1), [Guardians of the Hair](https://arxiv.org/html/2601.03362), [HF: depth-anything-v2-base](https://huggingface.co/onnx-community/depth-anything-v2-base), [DA V2 issue #93 om invers dybde](https://github.com/DepthAnything/Depth-Anything-V2/issues/93).

### B. Mesh-deformasjon

- Referanser: [Codrops «Fake 3D»](https://tympanus.net/codrops/2019/02/20/how-to-create-a-fake-3d-image-effect-with-webgl/) (uv-offset i fragment), [three.js-forum 3D-parallakse](https://discourse.threejs.org/t/3d-from-image-parallax-website/83291), [2.5D Depth Studio](https://github.com/nermadie/2.5D_Depth_Studio), [Facebook 3D Photos](https://techcrunch.com/2018/06/07/how-facebooks-new-3d-photos-work/) (river mesh ved dybdehopp + inpainting, utenfor scope), [Codrops relighting](https://tympanus.net/codrops/2026/08/19/relighting-images-with-depth-maps-and-three-js/), [Zucconi parallax](https://www.alanzucconi.com/2019/01/01/parallax-shader/).
- Konsensus: blurret dybde + liten amplitude + vekt som går til 0 ved silhuetten. Én vekt på hele deltaet (pivot og relieff samlet), men relieffet med egen gain siden det er relieffet som gir nese-vs-øre. Maske fra dybdekartet (terskel + blur) i stedet for ren ellipse, ellipsen som sikkerhetsnett. uv følger basisposisjonen; kun `position` flyttes.

### C. Øyne

- Landemerker (MediaPipe `face_mesh_connections.py`): øye A nedre lokk `33,7,163,144,145,153,154,155,133`, øvre `33,246,161,160,159,158,157,173,133`, iris `468` (ring 469–472). Øye B nedre `263,249,390,373,374,380,381,382,362`, øvre `263,466,388,387,386,385,384,398,362`, iris `473` (ring 474–477).
- Ellipse skyter over ved øyekrokene; bruk polygonet rasterisert til en liten maske med noen piksler blur. Forskyvning ≤ 0,12 × øyebredde horisontalt og ≈ 0,05 vertikalt; vekt størst ved iris-senter, null ved lokk-kant. Å flytte kun iris med inpainting av sklera gir flere artefakter i shader uten ekstra assets.
- Kilder: [face_mesh_connections.py](https://raw.githubusercontent.com/google-ai-edge/mediapipe/master/mediapipe/python/solutions/face_mesh_connections.py), [478-punkts-oversikt](https://dev.to/metsander/mediapipe-face-mesh-all-478-landmark-points-5ec8), [Akjava: Eyes Slide-Move](https://huggingface.co/blog/Akjava/eyes-slide-move), [bentasker: eyes follow mouse](https://www.bentasker.co.uk/posts/blog/general/making-part-of-an-image-track-the-mouse-position.html).

### D. Integrasjon og ytelse

- **Rotårsak for tomt/feilskalert lerret:** `react-use-measure` 2.1.7 måler ikke i effect eller rAF. Eneste vei til første verdi er ResizeObserver-callback → debouncet 50 ms `setTimeout` (delt timer med window-`scroll`, fordi R3F sender `scroll: true`) → `getBoundingClientRect` → `setState`. Ingen retry. Målingen uteblir når Lenis fyrer scroll-events oftere enn 50 ms (`scrollTo` hver frame ved lerp og scroll-restore), og blir 0×0 når `useTexture` suspender inne i Canvas: `CanvasImpl` kaster, nærmeste Suspense (next/dynamic) setter `display:none` på Canvas-div-en, og RO måler 0. Window `resize` går ubuffret, derfor «fikset» resize alltid.
- **Fiks:** monter `HeroScene` først når `.hero-visual-inner` har målbar størrelse (egen ResizeObserver i `HeroVisual`), `resize={{ scroll: false, debounce: 0, offsetSize: true }}` på `Canvas`, og `<Suspense fallback={null}>` rundt `PortraitPlane` inne i Canvas så Canvas-DOM aldri skjules. `ResizeSync` og resize-events fjernet.
- Pekermønster: én `pointermove` på window → ref, lerp i `useFrame`, ingen React-state per event. `frameloop='never'` når scenen er utenfor viewport fungerer dynamisk i 9.6.1; lerpen er per frame så den hopper ikke, men `uTime += delta` klemmes til maks 0,1 s fordi klokken restartes.
- Touch og reduced motion: statisk `next/image`; scenen monteres ikke. Betinget rendering er nok, R3F disposer ved unmount.
- Kilder: [react-use-measure #90](https://github.com/pmndrs/react-use-measure/issues/90), [#93](https://github.com/pmndrs/react-use-measure/issues/93), [#100](https://github.com/pmndrs/react-use-measure/issues/100), [R3F #3074](https://github.com/pmndrs/react-three-fiber/issues/3074), [R3F Canvas-docs](https://r3f.docs.pmnd.rs/api/canvas), [R3F scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance).

### Runde 2 (12. september 2026): fem agenter om realisme og «premium»-følelse

- **Hodevridning:** relighting fra dybdegradienten (normal roteres med hodet, fast lys, ±12 % luminans, nøytral = 1) er billigste tydelige forbedring. Dybdekart flater ansiktet; MediaPipe-z gir nese/kinn og blandes inn innenfor ansiktet. Yaw-pivot i hodets senter, pitch-pivot ved nakken, roll ≈ −0,15 × yaw og liten sideforflytning. Hals/skuldre følger hodet forsinket og svakere. Kilder: [Codrops relighting](https://tympanus.net/codrops/2026/08/19/relighting-images-with-depth-maps-and-three-js/), [MediaPipe Face Mesh](https://github.com/google-ai-edge/mediapipe/wiki/MediaPipe-Face-Mesh), [rotasjonsakser for hodet](https://journals.physiology.org/doi/full/10.1152/jn.00764.2007), [follow-through](https://blog.cg-wire.com/follow-through-overlapping-action/).
- **Øyne:** catchlight (refleksen) skal stå stille mens iris flytter seg: luminans-terskel innenfor iris-radius, komponer fra uforskjøvet bilde. Øynene leder (τ ≈ 60–80 ms, saccade), hodet følger med fjær (250–400 ms), øynene gir tilbake ≈ 0,6 av hodets utslag (VOR). Øvre øyelokk følger vertikalt blikk med halv styrke. Små asymmetrier mellom øynene. Blunk med kun uv-warp blir uggent; utelatt. Kilder: [Catch light](https://en.wikipedia.org/wiki/Catch_light), [sakkader og hode](https://pmc.ncbi.nlm.nih.gov/articles/PMC2605952), [Eyes Alive](https://dl.acm.org/doi/10.1145/566654.566629).
- **Bevegelse:** per-frame-lerp er frame-rate-avhengig; bruk eksponentiell demping med tidskonstant eller dempet fjær. Lag: øyne 1 : hode 2,5 : skuldre 5 i tidskonstant. Idle-støy (1D-støy, 2–6 % amplitude, 0,1–0,4 Hz) på målet når musa står stille, saccade ved rask bevegelse, dødsone 2 %, «kjedsomhet» etter 4–7 s mot 80 % av nøytral. Kilder: [Driscoll](https://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/), [Juckett damped springs](https://www.ryanjuckett.com/damped-springs/), [Frontiers 2026](https://www.frontiersin.org/journals/virtual-reality/articles/10.3389/frvir.2026.1806316/full).
- **Silhuett:** størst gevinst er to lag: inpaintet bakgrunnsplate + hodemesh med myk alfa fra matting (BEN2/RMBG via transformers.js `background-removal`, evt. ViTMatte for hår). Ikke gjort ennå. Kilder: [3D Photo Inpainting](https://shihmengli.github.io/3D-Photo-Inpainting/), [transformers.js PR #1216](https://github.com/huggingface/transformers.js/pull/1216), [ViTMatte](https://huggingface.co/Xenova/vitmatte-base-composition-1k).
- **Referanser:** [Codrops Stacy](https://tympanus.net/codrops/2019/10/14/how-to-create-an-interactive-3d-character-with-three-js/), [PrivacyPuppet](https://github.com/privacypuppet/privacypuppet), [Cassie Evans «lil' me»](https://www.cassie.codes/posts/making-a-lil-me-part-1/). Det som skiller «wow» fra gimmick: idle-drift, øyne før hode, lys som følger rotasjonen, lagvis parallakse. Live2D/Rive er ikke verdt det for et foto. Blikket bør følge over hele siden, også over tekst og knapper.

Implementert fra runde 2 (PR #28): tidsbasert lagdelt blikkmodell (`components/fx/gaze.ts`), roll/sideforflytning/nakke-følging i vertex-shaderen, relighting og catchlight i fragment-shaderen, øyelokk-følging, landemerke-relieff i rutenettet. Ikke gjort: to-lags bakgrunnsplate.

## Valgt løsning

- **Dybde:** Depth Anything V2 base via transformers.js, normalisert innenfor hodemasken, blurret én rutenettcelle, samplet til 40×52.
- **Mesh:** rutenett over hode og hals. Vekt = ellipse × dybdemaske (terskel 0,14 med 0,10 myk kant; bakgrunnen ligger på 0,02–0,10 og hodet på 0,28–0,49 fordi skuldrene tar toppen av skalaen. En terskel på 0,3 ga nesten null vekt på venstre halvdel av ansiktet, «bare høyre side funker»). Rotasjonen skjer i vertex-shaderen (`components/fx/HeadWarp.tsx`): vertex løftes til `HEAD_Z + relieff·RELIEF`, roteres om pivot bak hodet med `uLook·uAngles`, og blandes mot basisposisjonen med vekten. uv er fast.
- **Øyne:** polygon-maske (`public/portrett-eyes.png`) × radial vekt fra iris-senter, forskyvning 0,12/0,05 × øyebredde, i fragment-shaderen (`uFace`-grenen i `HeroScene.tsx`).
- **Bevegelse:** én `pointermove`-lytter, mål i ref, lerp 0,06 i `useFrame`. `pointerleave` på `<html>` → mål (0, 0).
- **Ingen bakgrunnsparallakse og ingen tilt** (forkastet).

## Genererte assets

Alt ligger i `scripts/portrait/` med egen `package.json` (`@huggingface/transformers`, `@mediapipe/tasks-vision`, `sharp`).

1. `npm install` i `scripts/portrait/`.
2. `node depth.mjs` → `out/depth-raw.png` (Depth Anything V2 base, ca. 1–5 s på CPU).
3. `node serve.mjs` og åpne `http://localhost:8123/landmarks.html` → `out/landmarks.json` (478 punkter). Modellfilen `face_landmarker.task` lastes ned fra Googles CDN til `out/` første gang (gitignorert).
4. `node head-grid.mjs` → `components/fx/face/head-grid.json` (relieff, vekt, iris, øyebredde) og `public/portrett-eyes.png` (øyemaske, 1/4 oppløsning).

`out/depth-raw.png` og `out/landmarks.json` er sjekket inn, så steg 4 kan kjøres uten modellene.

## Verifisering (PR #21, 12. september 2026)

Kjørt mot produksjon i wmux-nettleseren (synlig fane, 1264×625, dpr 1) med syntetiske `pointermove`-events og skjermbilder etter 1,5 s (lerp ferdig).

| Sjekk | Resultat |
|---|---|
| `npm run lint`, `tsc --noEmit`, `npm run build` | Grønne |
| Lerret får riktig størrelse ved første montering | 435×545 med én gang, ingen 300×150 |
| Shader-feil i konsollen | Ingen (kun `THREE.Clock`-deprecation fra drei) |
| Pekeren i fire hjørner | Hodet dreier tydelig den veien, nesen mer enn ørene, iris mot pekeren, øyelokk i ro |
| Pekeren midt på ansiktet | Nøytral |
| Pekeren forlater vinduet | Glir tilbake til nøytral |
| Søm ved hals, skuldre, bakgrunn ved maks utslag | Ingen synlig |
| Drift, ripple og RGB-forskyvning | Fungerer, også over hodemeshet (samme fragment-shader) |
| Frametid under pekerbevegelse | 300 frames på 2,5 s (120 Hz), snitt 8,3 ms, maks 8,5 ms, 0 over 25 ms |
| Reduced motion | Verifisert i kode: `useReducedMotion` gir `useScene = false`, scenen monteres ikke, `next/image` vises. |
| Touch | Scenen monteres med `input="scroll"` (etter PR #21: blikket følger scrollingen). Verifisert i kode og med syntetisk `scrollY` i desktop-nettleser, ikke på fysisk telefon. |

Merk for testing: i en skjult fane (`document.visibilityState === 'hidden'`) fyrer verken ResizeObserver eller rAF, så scenen monteres først når fanen blir synlig. Det er ønsket oppførsel, men Chrome-automatisering i bakgrunnsfaner gir falske negativer.

## Gjenstår

- React-feil #418 (hydreringsavvik): reprodusert i dev-modus mot ekte data. Diffen viste `<body cz-shortcut-listen="true">`, et attributt ColorZilla-utvidelsen i Chrome setter før React hydrerer. Ikke en feil i koden. `<body suppressHydrationWarning>` er lagt til slik Next anbefaler for utvidelser som endrer DOM-en. Elementer som utvidelser (f.eks. Claude in Chrome) legger inn før hydrering kan fortsatt gi #418 i prod; det er utenfor kodens kontroll.
- Finjustering etter smak: `YAW_DEG`, `PITCH_DEG`, `RELIEF` i `HeadWarp.tsx`; `EYE_SHIFT` i `HeroScene.tsx`.
