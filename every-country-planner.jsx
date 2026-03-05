import { useState, useMemo } from "react";

// leave = annual leave days used | days = total days including weekends
const TRIPS = [
  // ═══ EUROPE ═══
  {
    id: 1, name: "Andorra", region: "Europe",
    countries: ["Andorra"],
    days: 3, leave: 1, cost: 350, difficulty: "Easy",
    route: "London → Barcelona (Ryanair Fri eve) → bus to Andorra (3h Sat) → return Sun → fly home Sun eve",
    notes: "Take Friday off, fly Fri night. Bus up Sat morning, explore, return Sun. Hotels €60–80. Duty-free shopping. Basically a long weekend.",
    bhTip: "Attach to a May or August bank holiday Monday for 0 leave days.",
    months: "Any", priority: 1
  },
  {
    id: 2, name: "San Marino", region: "Europe",
    countries: ["San Marino"],
    days: 3, leave: 1, cost: 350, difficulty: "Easy",
    route: "London → Bologna (Ryanair Fri eve) → bus to San Marino (1.5h Sat) → return Sun",
    notes: "Take Friday off. Fly Fri night. Tiny hilltop republic — half a day covers it. Good pasta. Back Sunday.",
    bhTip: "Use a bank holiday Monday for 0 leave days.",
    months: "Any (best Apr–Oct)", priority: 1
  },
  {
    id: 3, name: "Liechtenstein", region: "Europe",
    countries: ["Liechtenstein"],
    days: 3, leave: 1, cost: 400, difficulty: "Easy",
    route: "London → Zürich (Fri eve) → train to Vaduz (1.5h Sat) → return Sun",
    notes: "Swiss prices (~£120/night). Walk the whole country in a day. Castle, vineyards, stamps. Tag onto any Swiss/Austrian trip.",
    bhTip: "Bank holiday Monday = 0 leave.",
    months: "Any", priority: 1
  },
  {
    id: 4, name: "Ukraine", region: "Europe",
    countries: ["Ukraine"],
    days: 9, leave: 5, cost: 800, difficulty: "Hard",
    route: "Sat → Sun. Lviv via Kraków or Kyiv direct when flights resume",
    notes: "⚠️ Dependent on security. Lviv may open first. Incredibly cheap once there. Wizz Air had £30 flights pre-war.",
    bhTip: "—",
    months: "May–Sep", priority: 4
  },
  {
    id: 5, name: "Belarus", region: "Europe",
    countries: ["Belarus"],
    days: 5, leave: 3, cost: 700, difficulty: "Hard",
    route: "Thu → Mon. Via Istanbul or overland from Vilnius",
    notes: "Visa situation fluctuates. Belavia sanctioned. Route via Turkey or enter from Lithuania. Cheap inside. Minsk is a surreal Soviet time capsule.",
    bhTip: "—",
    months: "May–Sep", priority: 4
  },

  // ═══ WEST AFRICA ═══
  {
    id: 6, name: "Senegal & Gambia", region: "West Africa",
    countries: ["Senegal", "Gambia"],
    days: 9, leave: 5, cost: 1200, difficulty: "Easy",
    route: "Sat → Sun. London → Dakar (direct 6h) → overland to Gambia → return Dakar",
    notes: "Gambia sits inside Senegal — easiest African combo. Direct London–Dakar ~£300. Budget hotels £25–40/night. Visa-free. Île de Gorée, Saint-Louis.",
    bhTip: "—",
    months: "Nov–May (dry)", priority: 1
  },
  {
    id: 7, name: "Ghana, Togo & Benin", region: "West Africa",
    countries: ["Ghana", "Togo", "Benin"],
    days: 12, leave: 8, cost: 1800, difficulty: "Medium",
    route: "Fri → Tue. London → Accra (direct 6.5h) → Lomé (3h) → Cotonou (2h) → return Accra",
    notes: "Classic coastal trio — all capitals within hours. Ghana comfortable. Togo/Benin borders fine. Visas: Ghana e-visa, Togo VOA, Benin e-visa. Flights ~£350.",
    bhTip: "Book over Easter: 10 days for 6 leave (Good Fri + Easter Mon free).",
    months: "Nov–Mar (dry)", priority: 1
  },
  {
    id: 8, name: "Côte d'Ivoire & Nigeria", region: "West Africa",
    countries: ["Côte d'Ivoire", "Nigeria"],
    days: 12, leave: 8, cost: 2500, difficulty: "Medium",
    route: "Fri → Tue. London → Lagos (direct 6.5h) → fly to Abidjan (~1h) → fly home via Paris",
    notes: "Lagos direct BA/Virgin ~£400–500. Nigeria visa bureaucratic. Lagos needs 3 days. Fly Lagos–Abidjan. CIV visa from London. Could tag CIV onto Ghana trip instead.",
    bhTip: "Easter or late May BH saves 1–2 leave days.",
    months: "Nov–Mar", priority: 2
  },
  {
    id: 9, name: "Guinea-Bissau & Guinea", region: "West Africa",
    countries: ["Guinea-Bissau", "Guinea"],
    days: 9, leave: 5, cost: 2000, difficulty: "Hard",
    route: "Sat → Sun. London → Lisbon → Bissau (TAP) → overland/fly Conakry → home via Dakar/Paris",
    notes: "Bissau via Lisbon (TAP). GB tiny — 2–3 days. Conakry rough. Both need visas. Basic hotels £20–40. Could tag onto Senegal with effort.",
    bhTip: "—",
    months: "Nov–Apr", priority: 3
  },
  {
    id: 10, name: "Sierra Leone & Liberia", region: "West Africa",
    countries: ["Sierra Leone", "Liberia"],
    days: 9, leave: 5, cost: 2200, difficulty: "Hard",
    route: "Sat → Sun. London → Freetown (via Brussels) → fly Monrovia → home",
    notes: "Overland Freetown–Monrovia 12h+ (impassable wet season) — fly instead (~£150). Both need visas. Hotels £30–60. Freetown beaches surprisingly good.",
    bhTip: "—",
    months: "Nov–Apr (dry)", priority: 3
  },
  {
    id: 11, name: "Cabo Verde", region: "West Africa",
    countries: ["Cabo Verde"],
    days: 6, leave: 4, cost: 900, difficulty: "Easy",
    route: "Sat → Thu. London → Sal/Boa Vista (direct TUI/BA 6h)",
    notes: "Direct budget flights — £200 return off-season. E-visa. Hotels £30–60. Good beach/recovery break.",
    bhTip: "Attach to August BH: take Tue–Fri = 4 leave for 9 days.",
    months: "Nov–Jun", priority: 1
  },
  {
    id: 12, name: "Mauritania", region: "West Africa",
    countries: ["Mauritania"],
    days: 9, leave: 5, cost: 1500, difficulty: "Hard",
    route: "Sat → Sun. London → Nouakchott (via Casablanca RAM) or overland from Senegal",
    notes: "RAM via Casablanca ~£400–500. Or cross overland from Senegal. Iron ore train to Chinguetti is iconic. Visa on arrival. Basic hotels £25–50.",
    bhTip: "—",
    months: "Nov–Mar", priority: 3
  },
  {
    id: 13, name: "Mali, Burkina Faso & Niger", region: "West Africa",
    countries: ["Mali", "Burkina Faso", "Niger"],
    days: 16, leave: 10, cost: 5500, difficulty: "Extreme",
    route: "Sat → Sun. Bamako/Ouagadougou/Niamey — all via Paris. May need 2–3 separate trips.",
    notes: "⚠️ ALL THREE: severe FCO warnings. Jihadist insurgency, coups. If they open: overland 12–15h between capitals. Visas required. Budget includes security. Likely separate trips over years.",
    bhTip: "—",
    months: "Nov–Feb if ever", priority: 5
  },

  // ═══ CENTRAL AFRICA ═══
  {
    id: 14, name: "Cameroon & Equatorial Guinea", region: "Central Africa",
    countries: ["Cameroon", "Equatorial Guinea"],
    days: 12, leave: 8, cost: 4000, difficulty: "Very Hard",
    route: "Fri → Tue. London → Douala (via Paris) → fly Malabo (45 min) → return via Douala",
    notes: "Douala–Malabo short hop. Cameroon visa from London. EG visa notoriously hard — apply months ahead. EG absurdly expensive (£100–200/night). ⚠️ Avoid Cameroon anglophone regions.",
    bhTip: "—",
    months: "Nov–Feb (dry)", priority: 3
  },
  {
    id: 15, name: "Gabon & Congo-Brazzaville", region: "Central Africa",
    countries: ["Gabon", "Congo (Congo-Brazzaville)"],
    days: 9, leave: 5, cost: 4000, difficulty: "Hard",
    route: "Sat → Sun. London → Libreville (via Paris) → fly Brazzaville → home",
    notes: "Both oil states = expensive. Gabon e-visa. Libreville £80–150/night. Brazzaville £60–120. Ferry to Kinshasa (10 min) if combining with DRC.",
    bhTip: "—",
    months: "Jun–Sep", priority: 3
  },
  {
    id: 16, name: "São Tomé & Príncipe", region: "Central Africa",
    countries: ["Sao Tome and Principe"],
    days: 8, leave: 4, cost: 1800, difficulty: "Medium",
    route: "Thu → Thu. London → Lisbon → São Tomé (TAP direct from Lisbon)",
    notes: "Via Lisbon. Gorgeous: chocolate plantations, colonial architecture, beaches. Cheaper than mainland Central Africa. £25–50/night. Visa on arrival. Gulf of Guinea's hidden gem.",
    bhTip: "Thu before a BH Friday (Good Friday) = 3 leave for 10 days.",
    months: "Jun–Sep", priority: 2
  },
  {
    id: 17, name: "Democratic Republic of Congo", region: "Central Africa",
    countries: ["Democratic Republic of the Congo"],
    days: 9, leave: 5, cost: 2800, difficulty: "Very Hard",
    route: "Sat → Sun. London → Kinshasa (via Paris/Addis). Or ferry from Brazzaville (10 min) combining with Trip 15",
    notes: "Visa from DRC embassy — allow weeks. Kinshasa only. Expensive: £60–150/night. The Brazzaville ferry combo is clever — world's closest capitals. Eastern DRC: ⚠️ avoid.",
    bhTip: "—",
    months: "Jun–Sep", priority: 4
  },
  {
    id: 18, name: "Central African Republic & Chad", region: "Central Africa",
    countries: ["Central African Republic", "Chad"],
    days: 12, leave: 8, cost: 5500, difficulty: "Extreme",
    route: "Fri → Tue. N'Djamena and Bangui via Paris. Or fly between (~2h)",
    notes: "⚠️ CAR: active conflict. Chad: N'Djamena accessible but expensive. Zakouma NP world-class. Could do Chad solo first (5 leave) and CAR when it opens. Budget includes security.",
    bhTip: "—",
    months: "Nov–Mar", priority: 5
  },

  // ═══ EAST AFRICA ═══
  {
    id: 19, name: "Kenya & Tanzania", region: "East Africa",
    countries: ["Kenya", "Tanzania"],
    days: 16, leave: 10, cost: 2500, difficulty: "Easy",
    route: "Sat → Sun. London → Nairobi (direct 8.5h) → Arusha → safari → Dar → Zanzibar → home",
    notes: "Direct London–Nairobi ~£350. EA Tourist Visa covers both. Budget safari ~£80–120/day. Zanzibar is a must. Hostels £10–20, mid-range £40–60.",
    bhTip: "Bridge two bank holidays: e.g. late May BH + take 8 leave = 16 days. Or Easter period.",
    months: "Jun–Oct or Jan–Feb", priority: 1
  },
  {
    id: 20, name: "Uganda, Rwanda & Burundi", region: "East Africa",
    countries: ["Uganda", "Rwanda", "Burundi"],
    days: 16, leave: 10, cost: 3200, difficulty: "Easy",
    route: "Sat → Sun. London → Entebbe → Kampala → bus to Kigali (8h) → bus to Bujumbura (5h) → fly home from Kigali",
    notes: "Natural overland loop. EA Tourist Visa covers Uganda/Rwanda. Burundi e-visa. Uganda gorillas ~$700 (Rwanda $1500). Bujumbura on Lake Tanganyika — 2 days. £30–50/day.",
    bhTip: "Same bridge strategy. Christmas period works well too: ~3 leave for 10+ days, then top up.",
    months: "Jun–Sep or Dec–Feb", priority: 1
  },
  {
    id: 21, name: "Ethiopia (stopover)", region: "East Africa",
    countries: ["Ethiopia"],
    days: 4, leave: 0, cost: 800, difficulty: "Easy",
    route: "FREE STOPOVER on any Ethiopian Airlines ticket to Africa. Add 3–4 days in Addis + day trip",
    notes: "THE hack. Ethiopian Airlines allows free Addis stopovers. Add to ANY Africa trip for just hotel + food. Addis + Lalibela day trip (internal flight ~£80). £15–30/day. E-visa. Use on Kenya, Southern Africa, or Indian Ocean trips. COSTS ZERO LEAVE — it's built into another trip's travel time.",
    bhTip: "No leave needed — absorbed into other trips.",
    months: "Year-round", priority: 1
  },
  {
    id: 22, name: "Djibouti & Eritrea", region: "East Africa",
    countries: ["Djibouti", "Eritrea"],
    days: 12, leave: 8, cost: 3000, difficulty: "Very Hard",
    route: "Fri → Tue. London → Addis → Djibouti (1h) → Asmara → home via Addis",
    notes: "Both from Addis hub. Djibouti: tiny, expensive, Lac Assal, whale sharks — 3 days. Eritrea: isolated, visa slow, no ATMs, Asmara Art Deco UNESCO — 5 days. Eritrea requires patience.",
    bhTip: "Easter block: 6 leave for 10 days. Enough for Djibouti alone if splitting.",
    months: "Nov–Mar", priority: 3
  },
  {
    id: 23, name: "Somalia (Somaliland)", region: "East Africa",
    countries: ["Somalia"],
    days: 6, leave: 4, cost: 2500, difficulty: "Extreme",
    route: "Sat → Thu. Hargeisa via Addis/Dubai. Or Mogadishu via Nairobi (armed escort)",
    notes: "Somaliland realistic option — safer, own visa on arrival. Most 'every country' travellers count it. Laas Geel cave paintings extraordinary. Hotels £30–50. Mogadishu requires armed security ($100–200/day).",
    bhTip: "Attach to BH Monday: leave Sat, back Thu = 3 leave.",
    months: "Dec–Mar", priority: 4
  },
  {
    id: 24, name: "South Sudan & Sudan", region: "East Africa",
    countries: ["South Sudan", "Sudan"],
    days: 12, leave: 8, cost: 5000, difficulty: "Extreme",
    route: "Separately: Khartoum via Cairo (when safe). Juba via Nairobi/Addis",
    notes: "⚠️ Sudan: civil war since 2023, inaccessible. South Sudan: extreme instability. Both years away. Pre-war Sudan: Meroë pyramids extraordinary. Budget speculative + security.",
    bhTip: "—",
    months: "When safe", priority: 5
  },

  // ═══ SOUTHERN AFRICA ═══
  {
    id: 25, name: "Zambia & Zimbabwe", region: "Southern Africa",
    countries: ["Zambia", "Zimbabwe"],
    days: 9, leave: 5, cost: 2000, difficulty: "Easy",
    route: "Sat → Sun. London → Lusaka (via Joburg) → South Luangwa → Livingstone → walk Vic Falls Bridge to Zim → fly home",
    notes: "Vic Falls links both — walk the bridge. KAZA UniVisa ~$50. South Luangwa world-class safari. Book with Ethiopian Airlines for free Ethiopia stopover. £40–70/day.",
    bhTip: "August BH: 4 leave for 9 days if timed right.",
    months: "May–Oct (dry)", priority: 1
  },
  {
    id: 26, name: "Namibia & Botswana", region: "Southern Africa",
    countries: ["Namibia", "Botswana"],
    days: 16, leave: 10, cost: 3200, difficulty: "Easy",
    route: "Sat → Sun. London → Windhoek → self-drive → Kasane border → Chobe NP → fly from Maun",
    notes: "Namibia self-drive: Sossusvlei, Etosha, Skeleton Coast. Cross to Botswana at Kasane. Camping £5–15/night. Car ~£30/day. Visa-free both.",
    bhTip: "Christmas/NY period: 3–4 leave for 10+ days, top up to 16 with more leave. Or bridge two BHs.",
    months: "May–Oct (dry)", priority: 1
  },
  {
    id: 27, name: "Lesotho & Eswatini", region: "Southern Africa",
    countries: ["Lesotho", "Eswatini (fmr. \"Swaziland\")"],
    days: 6, leave: 4, cost: 1100, difficulty: "Easy",
    route: "Sat → Thu. London → Joburg (direct 11h) → car → Eswatini (3.5h) → Lesotho (4h) → fly home",
    notes: "Both inside/beside South Africa. Car from Joburg essential. No visas (UK). Eswatini: 2 days. Lesotho: Sani Pass. £25–40/night. Flights ~£400.",
    bhTip: "Attach to BH Monday: Sat → Thu = 3 leave.",
    months: "Mar–May or Sep–Nov", priority: 1
  },
  {
    id: 28, name: "Malawi & Mozambique", region: "Southern Africa",
    countries: ["Malawi", "Mozambique"],
    days: 16, leave: 10, cost: 2500, difficulty: "Medium",
    route: "Sat → Sun. London → Lilongwe (via Addis) → Lake Malawi → overland to Mozambique → Maputo → fly home via Joburg",
    notes: "Malawi: Lake Malawi stunning, £15–25/day. Mozambique: Tofo whale sharks, Maputo food excellent. Enter Mozambique from southern Malawi. E-visas both. Ethiopian Airlines stopover in Addis en route.",
    bhTip: "Bridge late May + early May BHs: 8 leave for 16 days.",
    months: "May–Oct", priority: 1
  },

  // ═══ INDIAN OCEAN ═══
  {
    id: 29, name: "Madagascar & Comoros", region: "Indian Ocean",
    countries: ["Madagascar", "Comoros"],
    days: 16, leave: 10, cost: 3800, difficulty: "Hard",
    route: "Sat → Sun. London → Tana (via Paris/Nairobi) → explore → fly Moroni, Comoros (1.5h) → home via Nairobi",
    notes: "Madagascar HUGE — pick one region. Hire driver+4x4 (~£40/day). Comoros: tag on, fly from Tana. Volcanic islands, few tourists. Hotels: Mada £15–40, Comoros £20–50.",
    bhTip: "—",
    months: "Apr–Nov (dry)", priority: 2
  },
  {
    id: 30, name: "Mauritius & Seychelles", region: "Indian Ocean",
    countries: ["Mauritius", "Seychelles"],
    days: 9, leave: 5, cost: 3500, difficulty: "Easy",
    route: "Sat → Sun. London → Mahé (direct 10h) → fly to Mauritius (2.5h) → direct home",
    notes: "Both have direct London flights. Seychelles guesthouses La Digue £60/night. Mauritius mid-range £50–80. Self-catering helps. Flights ~£700–900 total.",
    bhTip: "August BH: 4 leave for 9 days.",
    months: "Apr–May or Oct–Nov", priority: 2
  },
  {
    id: 31, name: "Sri Lanka & Maldives", region: "Indian Ocean",
    countries: ["Sri Lanka", "Maldives"],
    days: 16, leave: 10, cost: 2400, difficulty: "Easy",
    route: "Sat → Sun. London → Colombo (direct 11h) → Kandy → Ella → coast → fly Malé (1.5h) → local island → home",
    notes: "Colombo–Malé is 1.5h. Sri Lanka: trains, temples, wildlife, beaches. Maldives: local island guesthouses £30–50/night NOT resorts. Sri Lanka £15–40/night. One of the best value trips on the list.",
    bhTip: "Christmas/NY: fly out ~20 Dec, back ~4 Jan. ~5 leave for 16 days over the festive period.",
    months: "Dec–Mar", priority: 1
  },

  // ═══ NORTH AFRICA ═══
  {
    id: 32, name: "Algeria", region: "North Africa",
    countries: ["Algeria"],
    days: 9, leave: 5, cost: 1700, difficulty: "Hard",
    route: "Sat → Sun. London → Algiers (via Paris, ~3h)",
    notes: "Visa required, 4–6 weeks. Under-touristed gem: Casbah, Roman ruins, M'zab Valley. Hotels £30–60. Very safe. French spoken. Internal Sahara flights cheap.",
    bhTip: "—",
    months: "Oct–Apr", priority: 2
  },
  {
    id: 33, name: "Libya", region: "North Africa",
    countries: ["Libya"],
    days: 9, leave: 5, cost: 3500, difficulty: "Extreme",
    route: "Sat → Sun. Tripoli via Istanbul/Tunis — organised tour only",
    notes: "⚠️ FCO against all travel. Sporadic tours: Leptis Magna, Sabratha. ~£2000–2500 tour + flights. Worth waiting for — archaeology is staggering.",
    bhTip: "—",
    months: "Oct–Apr if accessible", priority: 5
  },

  // ═══ MIDDLE EAST ═══
  {
    id: 34, name: "Oman", region: "Middle East",
    countries: ["Oman"],
    days: 9, leave: 5, cost: 1300, difficulty: "Easy",
    route: "Sat → Sun. London → Muscat (direct 7h). Self-drive loop: wadis, Jebel Shams, Wahiba Sands, Sur",
    notes: "Best Gulf state. E-visa. Hire car. Hotels £40–80. Petrol free. Direct flights ~£300–400. Very safe.",
    bhTip: "Late May BH: 4 leave for 9 days.",
    months: "Oct–Mar", priority: 1
  },
  {
    id: 35, name: "Qatar & Bahrain", region: "Middle East",
    countries: ["Qatar", "Bahrain"],
    days: 5, leave: 3, cost: 1000, difficulty: "Easy",
    route: "Thu → Mon. London → Doha (direct QR 7h) → fly Bahrain (1h, ~£60) → home",
    notes: "Extended weekend. Doha: MIA, Souq Waqif — 2 days. Bahrain: Manama — 1.5 days. Both visa-free. QR ~£250 return. Hotels £50–100.",
    bhTip: "BH Monday: Thu → Mon = 2 leave days only.",
    months: "Oct–Apr", priority: 1
  },
  {
    id: 36, name: "Lebanon & Syria", region: "Middle East",
    countries: ["Lebanon", "Syria"],
    days: 12, leave: 8, cost: 2200, difficulty: "Medium",
    route: "Fri → Tue. London → Beirut (direct 5h) → overland Damascus (2–3h) → Aleppo → Palmyra → Beirut → home",
    notes: "Syria opened significantly post-2024. Beirut–Damascus road operational. Damascus, Aleppo old city, Krak des Chevaliers, Palmyra — extraordinary. Lebanon: Byblos, Baalbek, Cedars, incredible food. Both very cheap (£20–40/night). Check latest FCO for Syria.",
    bhTip: "Easter: 6 leave for 10 days. Or Christmas/NY period.",
    months: "Apr–Jun or Sep–Nov", priority: 2
  },
  {
    id: 37, name: "Iraq (Kurdistan)", region: "Middle East",
    countries: ["Iraq"],
    days: 6, leave: 4, cost: 1500, difficulty: "Hard",
    route: "Sat → Thu. London → Erbil (via Istanbul)",
    notes: "Kurdistan (Erbil, Sulaymaniyah) vastly safer than federal Iraq. VOA at Erbil. Citadel UNESCO. Hotels £25–50. Counts as Iraq.",
    bhTip: "BH Monday: 3 leave.",
    months: "Mar–May or Sep–Nov", priority: 2
  },
  {
    id: 38, name: "Palestine", region: "Middle East",
    countries: ["Palestine State"],
    days: 5, leave: 3, cost: 900, difficulty: "Medium",
    route: "Thu → Mon. London → Tel Aviv/Amman → West Bank (Bethlehem, Ramallah, Hebron)",
    notes: "⚠️ Volatile — check FCO. No separate visa. Enter via Israel or Jordan. £20–40/night. Tag onto Jordan trip.",
    bhTip: "BH Monday = 2 leave.",
    months: "Mar–May or Sep–Nov", priority: 3
  },
  {
    id: 39, name: "Iran", region: "Middle East",
    countries: ["Iran"],
    days: 12, leave: 8, cost: 2200, difficulty: "Hard",
    route: "Fri → Tue. London → Tehran (via Istanbul). Isfahan, Shiraz, Yazd circuit",
    notes: "UK citizens need licensed guide (~£800–1200). Visa via agency. No UK cards — bring cash. Incredible value inside (£10–20/day). Isfahan, Persepolis, Yazd world-class.",
    bhTip: "Easter: 6 leave for 10 days covers the core circuit.",
    months: "Mar–May or Sep–Nov", priority: 2
  },
  {
    id: 40, name: "Yemen (Socotra)", region: "Middle East",
    countries: ["Yemen"],
    days: 9, leave: 5, cost: 4000, difficulty: "Extreme",
    route: "Sat → Sun. Charter from Abu Dhabi/Cairo to Socotra",
    notes: "⚠️ Mainland: war. Socotra via charter. Dragon Blood Trees. Tours ~£3000. Windows open occasionally.",
    bhTip: "—",
    months: "Oct–Apr", priority: 5
  },
  {
    id: 41, name: "Afghanistan", region: "Middle East",
    countries: ["Afghanistan"],
    days: 9, leave: 5, cost: 3500, difficulty: "Extreme",
    route: "Sat → Sun. Kabul via Dubai. Or Wakhan from Tajikistan side.",
    notes: "⚠️ Taliban control. Some operators run trips. Bamiyan, Band-e-Amir. ~£2500 tour. Ethical/safety concerns serious.",
    bhTip: "—",
    months: "When possible", priority: 5
  },

  // ═══ CENTRAL ASIA ═══
  {
    id: 42, name: "Tajikistan & Turkmenistan", region: "Central Asia",
    countries: ["Tajikistan", "Turkmenistan"],
    days: 16, leave: 10, cost: 3800, difficulty: "Hard",
    route: "Sat → Sun. London → Dushanbe (via Istanbul) → Pamir Highway → through Uzbekistan → Ashgabat → home",
    notes: "Route via Uzbekistan (you've been). Tajikistan e-visa + GBAO permit. Pamir Highway = bucket list. Turkmenistan: guide required, Darvaza crater. Both surreal. Flights ~£500.",
    bhTip: "—",
    months: "Jun–Sep", priority: 2
  },
  {
    id: 43, name: "Mongolia", region: "Central Asia",
    countries: ["Mongolia"],
    days: 12, leave: 8, cost: 2200, difficulty: "Medium",
    route: "Fri → Tue. London → UB (via Istanbul/Seoul). Countryside: Gobi, wild horses.",
    notes: "Visa-free. UB: 2 days. Driver+guide ~£50–80/day. Ger stays £10–20. Flights ~£400–500. 2 people per sq km. Summer only.",
    bhTip: "Late May BH: 7 leave for 12 days.",
    months: "Jun–Sep", priority: 2
  },

  // ═══ SOUTH ASIA ═══
  {
    id: 44, name: "Nepal & Bhutan", region: "South Asia",
    countries: ["Nepal", "Bhutan"],
    days: 16, leave: 10, cost: 3800, difficulty: "Medium",
    route: "Sat → Sun. London → Kathmandu → Nepal circuit → fly Paro (40 min) → Bhutan → home via KTM",
    notes: "Nepal: world's best value. Tea houses £5–10. Bhutan: $100/day fee, licensed operator, Tiger's Nest. Paro is 40 min from KTM. Combined flights ~£400 + Bhutan fees ~£600.",
    bhTip: "—",
    months: "Oct–Nov or Mar–Apr", priority: 1
  },
  {
    id: 45, name: "Bangladesh", region: "South Asia",
    countries: ["Bangladesh"],
    days: 9, leave: 5, cost: 1100, difficulty: "Medium",
    route: "Sat → Sun. London → Dhaka (direct Biman 10h or via Gulf ~£350)",
    notes: "Ultra-cheap: £10–20/day. Old Dhaka incredible. Sundarbans, Cox's Bazar, Sylhet. Visa on arrival. Chaotic but rewarding.",
    bhTip: "—",
    months: "Oct–Mar (dry)", priority: 2
  },

  // ═══ SOUTHEAST ASIA ═══
  {
    id: 46, name: "Myanmar", region: "Southeast Asia",
    countries: ["Myanmar (formerly Burma)"],
    days: 9, leave: 5, cost: 1500, difficulty: "Hard",
    route: "Sat → Sun. London → Yangon (via Bangkok)",
    notes: "⚠️ Military coup, civil war. Tourism supports junta. Yangon, Bagan, Inle Lake extraordinary. Very cheap. Many travellers waiting.",
    bhTip: "—",
    months: "Nov–Mar if conditions change", priority: 4
  },
  {
    id: 47, name: "Laos", region: "Southeast Asia",
    countries: ["Laos"],
    days: 9, leave: 5, cost: 1000, difficulty: "Easy",
    route: "Sat → Sun. London → Bangkok → Luang Prabang (AirAsia ~£50)",
    notes: "Budget paradise. Luang Prabang UNESCO, Mekong slow boat, Vang Vieng. £15–25/day. VOA. SE Asia's most relaxed country.",
    bhTip: "—",
    months: "Nov–Mar", priority: 1
  },
  {
    id: 48, name: "Singapore & Philippines", region: "Southeast Asia",
    countries: ["Singapore", "Philippines"],
    days: 16, leave: 10, cost: 2200, difficulty: "Easy",
    route: "Sat → Sun. London → Singapore (direct SQ 13h) → 2 days → fly Manila (3.5h, ~£80) → island hop → home",
    notes: "Singapore: 2 days, hawker centres £2–4. Philippines: Palawan, Cebu, Bohol. Internal flights ~£30–50. Visa-free both. Combined flights ~£500–600.",
    bhTip: "Christmas/NY: fly out ~20 Dec. 5–6 leave for 16 days over festive period.",
    months: "Dec–May (Phil dry)", priority: 1
  },
  {
    id: 49, name: "Indonesia & Timor-Leste", region: "Southeast Asia",
    countries: ["Indonesia", "Timor-Leste"],
    days: 16, leave: 10, cost: 2800, difficulty: "Easy",
    route: "Sat → Sun. London → Bali → Java (Yogyakarta, Borobudur) → Bali → fly Dili (1.5h) → home via Bali",
    notes: "Indonesia: 12 days across 2–3 islands. Timor-Leste: tag on from Bali (Citilink). Asia's newest country. VOA both. Indonesia £8–25/night. Timor £15–40.",
    bhTip: "Easter: 8 leave for 16 days (Good Fri + Easter Mon free).",
    months: "Apr–Oct (dry)", priority: 1
  },

  // ═══ PACIFIC ═══
  {
    id: 50, name: "Fiji, Samoa & Tonga", region: "Pacific",
    countries: ["Fiji", "Samoa", "Tonga"],
    days: 16, leave: 10, cost: 6000, difficulty: "Medium",
    route: "Sat → Sun. London → Nadi → Fiji islands → fly Apia (3h) → fly Tongatapu (1.5h) → Nadi → home",
    notes: "Fiji = Pacific hub. Fiji Airways connects all. Fiji: Yasawa budget dorms £20. Samoa: beach fale £15. Tonga: whales Jul–Oct. Visa-free all. London–Nadi ~£800–1000.",
    bhTip: "—",
    months: "May–Oct (dry, whales)", priority: 2
  },
  {
    id: 51, name: "Vanuatu & Solomon Islands", region: "Pacific",
    countries: ["Vanuatu", "Solomon Islands"],
    days: 16, leave: 10, cost: 6500, difficulty: "Hard",
    route: "Sat → Sun. London → Brisbane → Port Vila (3h) → Honiara → home via Brisbane",
    notes: "Both via Australia. Vanuatu: Mt Yasur volcano, blue holes. Solomons: WWII, diving, raw. Visa-free. Flights ~£900–1100 via Oz. Hotels £30–70.",
    bhTip: "Christmas/NY works well for Southern Hemisphere summer.",
    months: "May–Oct", priority: 3
  },
  {
    id: 52, name: "Papua New Guinea", region: "Pacific",
    countries: ["Papua New Guinea"],
    days: 12, leave: 8, cost: 4500, difficulty: "Very Hard",
    route: "Fri → Tue. London → POM (via Singapore — Air Niugini)",
    notes: "800+ languages. ⚠️ POM safety issues. Highlands for festivals (Mt Hagen Show Aug). Internal flights only real transport. Guided recommended. Visa required. Hotels £50–100.",
    bhTip: "August BH: 7 leave for 12 days (timed for Mt Hagen Show).",
    months: "May–Oct", priority: 3
  },
  {
    id: 53, name: "Tuvalu, Nauru & Kiribati", region: "Pacific",
    countries: ["Tuvalu", "Nauru", "Kiribati"],
    days: 20, leave: 14, cost: 9000, difficulty: "Very Hard",
    route: "Sat → Sun. London → Nadi → Funafuti (2x/week) → Nadi → Tarawa → Nadi → Brisbane → Nauru (1x/week) → Brisbane → home",
    notes: "The hardest trio. ALL have weekly/biweekly flights — schedule rules everything. Tuvalu: cycle country in 1 hour. Nauru: one hotel. Kiribati: climate frontline. No ATMs — bring USD/AUD. Most expensive per-country on list but saves 3 separate Pacific trips.",
    bhTip: "Must take 14 leave. Christmas period could claw back 3–4 days: fly out ~18 Dec, back ~6 Jan = 10 leave for 20 days.",
    months: "May–Oct (coordinate flights)", priority: 4
  },
  {
    id: 54, name: "Marshall Islands, Micronesia & Palau", region: "Pacific",
    countries: ["Marshall Islands", "Micronesia", "Palau"],
    days: 16, leave: 10, cost: 8500, difficulty: "Very Hard",
    route: "Sat → Sun. London → Honolulu → Island Hopper: Majuro → Pohnpei → Chuuk → Guam → Palau → home via Seoul",
    notes: "United Island Hopper: legendary route. Chuuk: WWII wreck diving. Palau: Rock Islands, Jellyfish Lake. Visa-free all. London–Honolulu ~£500, Hopper ~£400, Palau–Seoul ~£300.",
    bhTip: "—",
    months: "Year-round (best Nov–May)", priority: 4
  },

  // ═══ OCEANIA ═══
  {
    id: 55, name: "Australia & New Zealand", region: "Oceania",
    countries: ["Australia", "New Zealand"],
    days: 23, leave: 15, cost: 5500, difficulty: "Easy",
    route: "Sat → Sun. London → Auckland → campervan South Island (10d) → fly Sydney (3h) → Melbourne → home",
    notes: "Combine to justify 24h flight. NZ: South Island campervan. Australia: Sydney + Melbourne. Hostels/campervans £20–50/night. Flights ~£700 + ~£150 NZ–Oz.",
    bhTip: "Christmas/NY: fly out ~18 Dec, back ~9 Jan = 11 leave for 23 days. THE best use of the festive period for this list.",
    months: "Nov–Mar (their summer)", priority: 1
  },

  // ═══ CARIBBEAN ═══
  {
    id: 56, name: "Jamaica & Dominican Republic", region: "Caribbean",
    countries: ["Jamaica", "Dominican Republic"],
    days: 12, leave: 8, cost: 2500, difficulty: "Easy",
    route: "Fri → Tue. London → Kingston (direct BA 10h) → Jamaica → fly Santo Domingo (1.5h) → explore → home",
    notes: "Both easy from London. Jamaica: Kingston culture, Blue Mountains, Negril. DR: Zona Colonial, Samaná whales. Guesthouses £20–40. Visa-free both.",
    bhTip: "Easter: 6 leave for 10 days.",
    months: "Dec–Apr", priority: 1
  },
  {
    id: 57, name: "Trinidad, Dominica & St Vincent", region: "Caribbean",
    countries: ["Trinidad and Tobago", "Dominica", "Saint Vincent and the Grenadines"],
    days: 16, leave: 10, cost: 3800, difficulty: "Medium",
    route: "Sat → Sun. London → Port of Spain (direct BA) → fly Dominica (via Barbados) → fly SVG → home via Barbados",
    notes: "Lesser Antilles hop. Trinidad: Carnival Feb/Mar. Dominica: Nature Isle, Boiling Lake. SVG: Bequia, Tobago Cays sailing. Inter-island flights £80–150 each. Hotels £25–60. Visa-free all.",
    bhTip: "If timed for Carnival (Feb): attach to a late Feb half-term week if relevant.",
    months: "Dec–May (Carnival Feb/Mar)", priority: 2
  },
  {
    id: 58, name: "Haiti", region: "Caribbean",
    countries: ["Haiti"],
    days: 6, leave: 4, cost: 2000, difficulty: "Extreme",
    route: "Sat → Thu. Port-au-Prince via Miami. Or overland from DR when safe.",
    notes: "⚠️ FCO against all travel. Gang violence, kidnapping. Citadelle Laferrière extraordinary. Could enter from DR when stable. Budget includes security.",
    bhTip: "—",
    months: "When safe", priority: 5
  },

  // ═══ CENTRAL AMERICA ═══
  {
    id: 59, name: "Belize, Honduras & El Salvador", region: "Americas",
    countries: ["Belize", "Honduras", "El Salvador"],
    days: 16, leave: 10, cost: 2400, difficulty: "Easy",
    route: "Sat → Sun. London → Belize City (via Miami) → Caye Caulker → bus to Copán, Honduras → San Pedro Sula → bus to San Salvador → fly home",
    notes: "Classic overland. Belize: reef, ruins. Honduras: Copán, Bay Islands. El Salvador: surfing, pupusas £0.50. All visa-free. Buses 5–6h between. £15–35/day.",
    bhTip: "Easter: 8 leave for 16 days.",
    months: "Nov–Apr (dry)", priority: 1
  },
  {
    id: 60, name: "Panama", region: "Americas",
    countries: ["Panama"],
    days: 9, leave: 5, cost: 1400, difficulty: "Easy",
    route: "Sat → Sun. London → Panama City (via Madrid Iberia or Miami)",
    notes: "Canal, Casco Viejo, San Blas, Bocas del Toro. Visa-free. USD. Hotels £20–50. Flights ~£400–500.",
    bhTip: "Early May BH: 4 leave for 9 days.",
    months: "Dec–Apr (dry)", priority: 1
  },

  // ═══ SOUTH AMERICA ═══
  {
    id: 61, name: "Ecuador", region: "Americas",
    countries: ["Ecuador"],
    days: 12, leave: 8, cost: 2000, difficulty: "Easy",
    route: "Fri → Tue. London → Quito (via Madrid). Optional: Galápagos (+£1500–2500)",
    notes: "USD currency. Quito old town, volcanoes, Amazon, Otavalo. Without Galápagos: £20–30/day. Visa-free. Flights ~£450–550.",
    bhTip: "Late May BH: 7 leave for 12 days.",
    months: "Jun–Sep (highlands dry)", priority: 1
  },
  {
    id: 62, name: "Guyana & Suriname", region: "Americas",
    countries: ["Guyana", "Suriname"],
    days: 12, leave: 8, cost: 3000, difficulty: "Hard",
    route: "Fri → Tue. London → Georgetown (via Trinidad) → minibus Paramaribo (12h) → fly home Amsterdam (KLM direct!)",
    notes: "Guyana: Kaieteur Falls (5x Niagara). Suriname: Dutch colonial Paramaribo UNESCO. KLM Amsterdam–Paramaribo direct = perfect routing home. Hotels £25–50.",
    bhTip: "Easter: 6 leave for 10 days (enough if you skip deep interior).",
    months: "Feb–Apr or Aug–Nov", priority: 2
  },
  {
    id: 63, name: "Venezuela", region: "Americas",
    countries: ["Venezuela"],
    days: 9, leave: 5, cost: 2800, difficulty: "Extreme",
    route: "Sat → Sun. Caracas via Madrid/Bogotá",
    notes: "⚠️ FCO against all but essential travel. Angel Falls, Roraima. Dirt cheap inside when stable. High risk.",
    bhTip: "—",
    months: "When conditions improve", priority: 5
  },
  {
    id: 64, name: "Uruguay", region: "Americas",
    countries: ["Uruguay"],
    days: 9, leave: 5, cost: 1500, difficulty: "Easy",
    route: "Sat → Sun. London → Montevideo (via Madrid). Or ferry from Buenos Aires (1h)",
    notes: "SA's most relaxed. Colonia UNESCO, Montevideo, Punta del Este. £40–70/day. Visa-free. Could tag onto Argentina revisit. Flights ~£500.",
    bhTip: "—",
    months: "Oct–Mar", priority: 1
  },

  // ═══ EAST ASIA ═══
  {
    id: 65, name: "North Korea", region: "East Asia",
    countries: ["North Korea"],
    days: 9, leave: 5, cost: 3200, difficulty: "Extreme",
    route: "Sat → Sun. London → Beijing → Pyongyang (Air Koryo/train). Approved operator.",
    notes: "UK citizens can visit. Koryo Tours, YPT. ~€1500–2000 for 5-day tour. Ethical: money supports regime. No independent movement. Book 2–3 months ahead.",
    bhTip: "Early May BH: 4 leave for 9 days.",
    months: "Apr–Oct", priority: 4
  },
];

const ACTIVE_TRIPS = TRIPS.filter(t => t.countries.length > 0 && t.priority > 0);

const REGION_COLORS = {
  "Europe": { accent: "#5B6ABF" }, "West Africa": { accent: "#D4872C" }, "Central Africa": { accent: "#C25B28" },
  "East Africa": { accent: "#2D8E5F" }, "Southern Africa": { accent: "#3CAF6E" }, "Indian Ocean": { accent: "#2E86C1" },
  "North Africa": { accent: "#CA6F1E" }, "Middle East": { accent: "#B83230" }, "Central Asia": { accent: "#7D3C98" },
  "South Asia": { accent: "#D4AC0D" }, "Southeast Asia": { accent: "#17A589" }, "Pacific": { accent: "#2471A3" },
  "Oceania": { accent: "#148F77" }, "Caribbean": { accent: "#CB4335" }, "Americas": { accent: "#884EA0" },
  "East Asia": { accent: "#C2185B" },
};
const DIFF_COL = { "Easy": "#27ae60", "Medium": "#e67e22", "Hard": "#d35400", "Very Hard": "#c0392b", "Extreme": "#7B241C" };
const PRI_LABELS = { 1: "Go First", 2: "Go Soon", 3: "Mid-term", 4: "Long-term", 5: "When Possible" };

export default function Planner() {
  const [tab, setTab] = useState("trips");
  const [exp, setExp] = useState(null);
  const [sort, setSort] = useState("priority");
  const [region, setRegion] = useState("All");
  const [done, setDone] = useState(new Set());

  const regions = useMemo(() => ["All", ...Array.from(new Set(ACTIVE_TRIPS.map(t => t.region)))], []);

  const sorted = useMemo(() => {
    let f = ACTIVE_TRIPS.filter(t => region === "All" || t.region === region);
    if (sort === "priority") f.sort((a, b) => a.priority - b.priority || a.leave - b.leave);
    else if (sort === "cost") f.sort((a, b) => a.cost - b.cost);
    else if (sort === "leave") f.sort((a, b) => a.leave - b.leave);
    else if (sort === "region") f.sort((a, b) => a.region.localeCompare(b.region) || a.priority - b.priority);
    return f;
  }, [sort, region]);

  const stats = useMemo(() => {
    const all = ACTIVE_TRIPS;
    const dn = all.filter(t => done.has(t.id));
    const tc = all.reduce((s, t) => s + t.countries.length, 0);
    const td = all.reduce((s, t) => s + t.days, 0);
    const tl = all.reduce((s, t) => s + t.leave, 0);
    const tco = all.reduce((s, t) => s + t.cost, 0);
    const yr = Math.ceil(tl / 32);
    return {
      tc, td, tl, tco, yr,
      dc: dn.reduce((s, t) => s + t.countries.length, 0),
      dco: dn.reduce((s, t) => s + t.cost, 0),
      dl: dn.reduce((s, t) => s + t.leave, 0),
    };
  }, [done]);

  const yearPlan = useMemo(() => {
    const s = [...ACTIVE_TRIPS].sort((a, b) => a.priority - b.priority || a.leave - b.leave);
    const yrs = [];
    let cur = { year: 1, trips: [], leave: 0, days: 0, cost: 0 };
    for (const t of s) {
      if (cur.leave + t.leave <= 32) {
        cur.trips.push(t); cur.leave += t.leave; cur.days += t.days; cur.cost += t.cost;
      } else {
        if (cur.trips.length) yrs.push(cur);
        cur = { year: yrs.length + 2, trips: [t], leave: t.leave, days: t.days, cost: t.cost };
      }
    }
    if (cur.trips.length) yrs.push(cur);
    return yrs;
  }, []);

  const toggle = id => setDone(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const S = {
    mono: { fontFamily: "'Space Mono', monospace" },
    lbl: { fontFamily: "'Space Mono'", fontSize: 10, color: "#aaa", letterSpacing: 1.5, marginBottom: 4, textTransform: "uppercase" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f4f0", color: "#2d2d2d", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)", padding: "28px 24px 22px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ ...S.mono, fontSize: 11, color: "#e94560", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>Every Country Project</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#fff" }}>107 Countries · {ACTIVE_TRIPS.length} Trips</h1>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>London · 32 days leave/year · 88 done · weekends + bank holidays = free travel days</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginTop: 18 }}>
            {[
              { l: "TRIPS", v: ACTIVE_TRIPS.length, s: `${ACTIVE_TRIPS.length - done.size} left` },
              { l: "LEAVE DAYS", v: stats.tl, s: `~${stats.yr} yrs at 32/yr` },
              { l: "TOTAL DAYS", v: stats.td, s: `${stats.td - stats.tl} are free weekends` },
              { l: "EST. COST", v: `£${(stats.tco/1000).toFixed(0)}k`, s: `£${((stats.tco-stats.dco)/1000).toFixed(0)}k left` },
              { l: "PROGRESS", v: `${88 + stats.dc}/195`, s: `${((88 + stats.dc)/195*100).toFixed(0)}%` },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ ...S.mono, fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 2 }}>{s.l}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginTop: 2 }}>{s.v}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          {["trips", "timeline", "budget"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "13px 18px", background: "none", border: "none",
              borderBottom: tab === t ? "2px solid #c0392b" : "2px solid transparent",
              color: tab === t ? "#1a1a2e" : "#aaa",
              ...S.mono, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
            }}>{t}</button>
          ))}
        </div>

        {/* ── TRIPS ── */}
        {tab === "trips" && (
          <div style={{ paddingTop: 14, paddingBottom: 40 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
              <span style={{ ...S.mono, fontSize: 10, color: "#aaa", letterSpacing: 1 }}>SORT</span>
              {["priority", "cost", "leave", "region"].map(s => (
                <button key={s} onClick={() => setSort(s)} style={{
                  padding: "3px 9px", borderRadius: 4,
                  border: `1px solid ${sort === s ? "#c0392b" : "rgba(0,0,0,0.1)"}`,
                  background: sort === s ? "rgba(192,57,43,0.06)" : "#fff",
                  color: sort === s ? "#c0392b" : "#888", fontSize: 11, cursor: "pointer",
                }}>{s}</button>
              ))}
              <span style={{ ...S.mono, fontSize: 10, color: "#aaa", letterSpacing: 1, marginLeft: 10 }}>REGION</span>
              <select value={region} onChange={e => setRegion(e.target.value)} style={{
                padding: "3px 8px", borderRadius: 4, border: "1px solid rgba(0,0,0,0.1)",
                background: "#fff", color: "#555", fontSize: 11,
              }}>
                {regions.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {sorted.map(trip => {
                const isExp = exp === trip.id;
                const isDone = done.has(trip.id);
                const acc = REGION_COLORS[trip.region]?.accent || "#888";
                return (
                  <div key={trip.id} style={{
                    background: isDone ? "rgba(39,174,96,0.05)" : "#fff",
                    border: `1px solid ${isDone ? "rgba(39,174,96,0.2)" : "rgba(0,0,0,0.06)"}`,
                    borderRadius: 8, overflow: "hidden", opacity: isDone ? 0.5 : 1,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  }}>
                    <div onClick={() => setExp(isExp ? null : trip.id)} style={{
                      padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <div style={{ width: 4, height: 34, borderRadius: 2, background: acc, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>{trip.name}</span>
                          <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: `${DIFF_COL[trip.difficulty]}12`, color: DIFF_COL[trip.difficulty], ...S.mono }}>{trip.difficulty}</span>
                          <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: "rgba(0,0,0,0.03)", color: "#aaa", ...S.mono }}>P{trip.priority}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: "#999", marginTop: 3 }}>{trip.countries.join(" · ")}</div>
                      </div>
                      <div style={{ display: "flex", gap: 12, flexShrink: 0, alignItems: "center" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#c0392b" }}>{trip.leave}d</div>
                          <div style={{ fontSize: 9, color: "#bbb", ...S.mono }}>LEAVE</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{trip.days}d</div>
                          <div style={{ fontSize: 9, color: "#bbb", ...S.mono }}>TOTAL</div>
                        </div>
                        <div style={{ textAlign: "right", minWidth: 50 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>£{trip.cost.toLocaleString()}</div>
                        </div>
                        <span style={{ color: "#ccc", fontSize: 14, transform: isExp ? "rotate(180deg)" : "", transition: "transform 0.15s" }}>▾</span>
                      </div>
                    </div>

                    {isExp && (
                      <div style={{ padding: "0 14px 14px 28px", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                        <div style={{ paddingTop: 10, display: "grid", gap: 8 }}>
                          <div><div style={S.lbl}>ROUTE</div><div style={{ fontSize: 13, color: "#444", lineHeight: 1.5 }}>{trip.route}</div></div>
                          <div><div style={S.lbl}>NOTES</div><div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{trip.notes}</div></div>
                          {trip.bhTip && trip.bhTip !== "—" && (
                            <div style={{ background: "rgba(233,69,96,0.04)", border: "1px solid rgba(233,69,96,0.1)", borderRadius: 6, padding: "8px 10px" }}>
                              <div style={{ ...S.lbl, color: "#c0392b", marginBottom: 2 }}>💡 BANK HOLIDAY TIP</div>
                              <div style={{ fontSize: 12.5, color: "#555" }}>{trip.bhTip}</div>
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 18 }}>
                            {[
                              ["LEAVE DAYS", `${trip.leave} of 32`],
                              ["TOTAL DAYS", trip.days],
                              ["FREE DAYS", trip.days - trip.leave],
                              ["BEST MONTHS", trip.months],
                              ["£/LEAVE DAY", trip.leave > 0 ? `£${Math.round(trip.cost / trip.leave)}` : "free"],
                            ].map(([l, v], i) => (
                              <div key={i}><div style={S.lbl}>{l}</div><div style={{ fontSize: 13, color: "#444" }}>{v}</div></div>
                            ))}
                          </div>
                          <button onClick={e => { e.stopPropagation(); toggle(trip.id); }} style={{
                            marginTop: 2, padding: "7px 14px", borderRadius: 6,
                            border: `1px solid ${isDone ? "#27ae60" : "rgba(0,0,0,0.1)"}`,
                            background: isDone ? "rgba(39,174,96,0.07)" : "#f5f4f0",
                            color: isDone ? "#27ae60" : "#888",
                            fontSize: 12, cursor: "pointer", width: "fit-content",
                          }}>{isDone ? "✓ Completed" : "Mark Complete"}</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TIMELINE ── */}
        {tab === "timeline" && (
          <div style={{ paddingTop: 18, paddingBottom: 40 }}>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 6, lineHeight: 1.6 }}>
              Year-by-year plan packing trips into 32 leave days. Remember: 5 leave days = 9 days travel. Bank holidays stretch further.
            </div>
            <div style={{ fontSize: 12, color: "#999", marginBottom: 18, padding: "8px 10px", background: "rgba(0,0,0,0.02)", borderRadius: 6 }}>
              🇬🇧 UK bank holidays: New Year · Good Friday + Easter Monday · Early May · Late May · August · Christmas + Boxing Day.
              Each one adjacent to a weekend can save 1 leave day. Easter alone = 10 days for 4 leave.
            </div>
            {yearPlan.map((year, yi) => (
              <div key={yi} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ ...S.mono, fontSize: 11, color: "#c0392b", background: "rgba(192,57,43,0.06)", padding: "3px 9px", borderRadius: 4, letterSpacing: 1 }}>YEAR {year.year}</div>
                  <div style={{ fontSize: 11, color: "#777" }}>
                    <strong style={{ color: "#c0392b" }}>{year.leave} leave</strong>
                    <span style={{ color: "#aaa" }}> / 32</span>
                    <span style={{ marginLeft: 8 }}>{year.days} total days</span>
                    <span style={{ marginLeft: 8, color: "#aaa" }}>£{year.cost.toLocaleString()}</span>
                  </div>
                  <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.05)" }} />
                </div>
                {/* Leave usage bar */}
                <div style={{ height: 4, background: "rgba(0,0,0,0.04)", borderRadius: 2, marginBottom: 6, marginLeft: 6, marginRight: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${year.leave / 32 * 100}%`, background: year.leave > 30 ? "#c0392b" : year.leave > 25 ? "#e67e22" : "#27ae60", borderRadius: 2 }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, paddingLeft: 6 }}>
                  {year.trips.map(t => (
                    <div key={t.id} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                      background: "#fff", borderRadius: 5, borderLeft: `3px solid ${REGION_COLORS[t.region]?.accent || "#888"}`,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                    }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 12.5, color: "#2d2d2d" }}>{t.name}</span>
                        <span style={{ fontSize: 10.5, color: "#bbb", marginLeft: 6 }}>{t.countries.length} ctry</span>
                      </div>
                      <span style={{ fontSize: 11, color: "#c0392b", fontWeight: 600, ...S.mono }}>{t.leave}d leave</span>
                      <span style={{ fontSize: 11, color: "#aaa", ...S.mono }}>{t.days}d total</span>
                      <span style={{ fontSize: 11, color: "#aaa", ...S.mono }}>£{t.cost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 20, padding: 14, background: "rgba(192,57,43,0.04)", border: "1px solid rgba(192,57,43,0.1)", borderRadius: 8 }}>
              <div style={{ ...S.mono, fontSize: 10, color: "#c0392b", letterSpacing: 1.5, marginBottom: 5 }}>PROJECTED COMPLETION</div>
              <div style={{ fontSize: 13.5, color: "#2d2d2d" }}>~{stats.yr} years using {stats.tl} leave days → all 195 by ~{2026 + stats.yr}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
                {stats.td} total travel days but only {stats.tl} cost leave — {stats.td - stats.tl} days are free weekends/BHs. Conflict zones add 3–5 year buffer. Bank holiday arbitrage could shave off another year.
              </div>
            </div>
          </div>
        )}

        {/* ── BUDGET ── */}
        {tab === "budget" && (
          <div style={{ paddingTop: 18, paddingBottom: 40 }}>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 18, lineHeight: 1.6 }}>
              Per person in GBP. Flights from London, budget-to-mid accommodation, local food, visas, transport. Excludes insurance, jabs, gear.
            </div>

            <div style={{ marginBottom: 22 }}>
              <div style={S.lbl}>COST BY REGION</div>
              {Object.entries(
                ACTIVE_TRIPS.reduce((a, t) => {
                  if (!a[t.region]) a[t.region] = { cost: 0, days: 0, leave: 0, countries: 0 };
                  a[t.region].cost += t.cost; a[t.region].days += t.days; a[t.region].leave += t.leave; a[t.region].countries += t.countries.length;
                  return a;
                }, {})
              ).sort((a, b) => b[1].cost - a[1].cost).map(([r, d]) => (
                <div key={r} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 12.5, color: "#333" }}>{r}</span>
                    <span style={{ fontSize: 11, color: "#999", ...S.mono }}>£{d.cost.toLocaleString()} · {d.leave}d leave · {d.countries} ctry</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(0,0,0,0.04)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${d.cost / stats.tco * 100}%`, background: REGION_COLORS[r]?.accent || "#888", borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ ...S.lbl, marginBottom: 10 }}>VALUE: £ PER LEAVE DAY</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 22 }}>
              {[
                { l: "Great (< £250/leave day)", f: t => t.leave > 0 && t.cost/t.leave < 250, c: "#27ae60" },
                { l: "Good (£250–500)", f: t => t.leave > 0 && t.cost/t.leave >= 250 && t.cost/t.leave < 500, c: "#e67e22" },
                { l: "Pricey (£500–800)", f: t => t.leave > 0 && t.cost/t.leave >= 500 && t.cost/t.leave < 800, c: "#d35400" },
                { l: "Expensive (£800+)", f: t => t.leave > 0 && t.cost/t.leave >= 800, c: "#c0392b" },
              ].map((tier, i) => {
                const trips = ACTIVE_TRIPS.filter(tier.f);
                return (
                  <div key={i} style={{ padding: 12, background: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 8 }}>
                    <div style={{ fontSize: 11.5, color: tier.c, fontWeight: 600, marginBottom: 3 }}>{tier.l}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>{trips.length} trips</div>
                    <div style={{ fontSize: 10.5, color: "#aaa" }}>{trips.reduce((s, t) => s + t.countries.length, 0)} countries</div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: 18, background: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 8 }}>
              <div style={{ ...S.mono, fontSize: 10, color: "#c0392b", letterSpacing: 2, marginBottom: 8 }}>GRAND TOTAL</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  [`£${(stats.tco/1000).toFixed(0)}k`, "Total"],
                  [`£${(stats.tco / Math.max(stats.yr, 1) / 1000).toFixed(1)}k`, "Per year"],
                  [`£${Math.round(stats.tco / Math.max(stats.tc, 1))}`, "Per country"],
                  [`£${Math.round(stats.tco / Math.max(stats.tl, 1))}`, "Per leave day"],
                ].map(([v, l], i) => (
                  <div key={i}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#1a1a2e" }}>{v}</div>
                    <div style={{ fontSize: 10.5, color: "#aaa" }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 10, lineHeight: 1.6 }}>
                Pacific islands (~£35k) are the biggest block. Priority 1 trips (years 1–4) use 30–32 leave days/year and average ~£6k/year covering 40+ countries. Ethiopia stopover costs 0 leave days. Bank holiday arbitrage on shorter trips (Andorra, San Marino, Liechtenstein, Qatar/Bahrain, Lesotho/Eswatini) can save 5–8 leave days per year.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
