Je zit bij stap 2: "Ask first". Bouwen is nu nog niet de bedoeling. Eerst praat je met de vier dorpelingen om uit te zoeken wat ze echt nodig hebben.

Wat je nu doet:

Klik op elke dorpeling (Maren, Tobin, Rowan, Ilse) en open hun chat. Je kunt ook naar beneden scrollen naar hun kaarten ("Maren's Morning Round", "Tobin's Week Ahead", …).
Stel gerichte vragen. Je hebt ongeveer 15 vragen per dorpeling per team, en bij Maren heb je er al 1 gebruikt. Een vage vraag levert een vaag antwoord op, dus wees concreet:
Wanneer en hoe vaak gebruik je dit? Bijvoorbeeld elke ochtend, één keer per week of op maandag tijdens de raadsvergadering.
Welke beslissing moet je kunnen nemen met de info?
Wat moet je als eerste zien, en wat is dringend en wat niet?
Hoe doe je het nu, en wat gaat er mis?
Welke drempels of grenzen gelden er? Bijvoorbeeld wanneer een voorraad "te laag" is of een leiding "kritiek".
Noteer de antwoorden. Die heb je nodig in stap 3 (bouwen) en stap 4, waar je in 5 tot 10 zinnen moet uitleggen wat je voor ze gemaakt hebt.

Waar elke dorpeling waarschijnlijk over gaat (afgaand op de data in de base app):

Maren Holt (waterbeheerder): waterleidingen en sensoren, haar ochtendronde
Tobin Reyes (bakker): voedselvoorraad, planning voor de komende week
Rowan Ashby (voorzitter dorpsraad): herstellingen en prioriteiten voor de vergadering van maandag
Ilse Vermeer (bibliothecaris en onderzoeker): een "ledger", waarschijnlijk ongewone dingen in de data opsporen

Tip: de beoordeling is goed gevraagd 2 · logisch 4 · creatief 4. Goede vragen tellen dus echt mee. Verspil ze niet aan dingen die je zelf in de data kunt nakijken, maar vraag naar wat alleen zij weten: hun werkdag, hun prioriteiten en hun frustraties.

Wil je dat ik per dorpeling een lijstje scherpe vragen opstel op basis van de data en de briefing in je project?

Hier zijn de vragen aan de waterkeeper:
← Back to challenges
💧 Maren's Morning Round
💧 Maren's Morning Round
Water · talk to Maren Holt, the water keeper

"Six pipes, one crew, and I'm always too late. When something breaks, I don't know which pipe is worst or who's sitting without water. Help me know where to go first." — Maren

🗣️ How this works
Talk to Maren in the chat on this page. Maren knows what she needs. This brief doesn't.
Your questions are limited (the counter is next to the chat). Think before you ask: a vague question gets a vague answer.
Build your solution in the Oakhaven base app. What it does and how it looks is up to you.
Hand in below, in 5 to 10 sentences: what you built, for which need, which choices you made and what you left out on purpose.
Done? Call a coach. As soon as you handed in, call a coach and show it in about two minutes: what does the villager need, and how does your app help? The coach judges what your app does for the village, not your code.
One app or four? Your call: one app for the whole village, or one per villager. Every app you add under src/ gets its own launchpad tile.
Plan your day: ask all four villagers a few questions before you build, then pick who you help first.
⚖️ How the jury scores (10 points)
Points
Asked well: your chat shows you found out what Maren really needs    2
Logical: every choice has a reason you can explain    4
Creative: something we did not see coming    4
💡 Your own AI assistant can help you build. It cannot know what the villagers need: only they can tell you.

💧
Maren Holt
Water keeper
In the village — ready to talk
13 of 15 questions left
💧
Morning. Maren Holt, water keeper. I've got six pipes, one crew and never enough time. Ask away, but make it count — I'm due at the spring in ten minutes.
The properties of each waterpipe is nominal flow, current flow, pressure and timestamps regarding the maintenance. Which one is important for you and what information do you need ?
💧
All of them matter, but together. I look at how much water flows now compared to what the pipe normally carries, and at the pressure. And I need to know how old that reading is, because if it's stale I don't trust it. Ask me your second question separately and I'll tell you more.
Do you want the information passed to you or do you want decisions to be made based on the information automatically ?
💧
Each morning I just want a short answer: where do I go first, then where, and why that one first. I don't have time to puzzle over numbers standing in a wet field. How you work that out is up to you, you're the experts.
Ask Maren one question…

Ask
Enter to send · Shift+Enter for a new line · vague questions get vague answers
0 / 600
Your solution
🔒 Only your team and the jury can read this. Saving again replaces your previous version.
What did you build, and for which need? Which choices did you make, and what did you leave out on purpose? (5 to 10 sentences)

0 / 100,000
Hand in my solution
Teams that handed in a solution
No team has handed in a solution yet.

Goed begonnen. Je weet nu twee dingen:

Ze kijkt naar flow tegenover nominale flow + druk + hoe oud de meting is.
Ze wil een korte gerangschikte lijst: eerst hier, dan daar, en waarom. Geen dashboard vol cijfers.

Wat je nog niet weet, is hoe ze die rangschikking zelf maakt. Dat is het hart van je app. Ik heb de data even bekeken, en dit valt op:

Pipe	Flow / nominaal	Druk	Voedt
NORTH-BRANCH-02	20/65 (31%)	22	North Residential (huizen)
SECONDARY-LOOP	12/40 (30%)	20	terug naar de bron (geen landmark)
SOUTH-BRANCH	40/60 (67%)	38	South Meadow Farms
BAKERY-BRANCH	pipe zegt 47/50, sensor zegt 140	47	The Bakery
PRIMARY-MAIN / NORTH-BRANCH-01	~95%	58 / 52	alles stroomafwaarts

Verder: alle sensoren hebben hun laatste meting op 16/11. Er zit ook een herstelling in de data met een datum in de toekomst (30/12), aangemaakt door "system", net als de rare sensorwaarde van de bakkerij. Dat ruikt naar iets voor Ilse (de onderzoeker), maar het is ook relevant voor Maren: "kan ik deze meting vertrouwen?"

Vragen die ik nu zou stellen (één per keer, je hebt er nog 13):

"When is a pipe in trouble for you? At what percentage of normal flow, or what pressure, do you start worrying, and when is it an emergency?" → geeft je de drempels
"Two pipes are equally bad: how do you choose? Does it matter who sits behind it (homes, bakery, farm, mill), and does a pipe that feeds other pipes count heavier?" → geeft je de prioriteitsregel
"How old can a reading be before you stop trusting it, and what should the app tell you then?" → hoe je omgaat met verouderde data
"What does it mean to you when a sensor shows more flow than the pipe can carry, or disagrees with the pipe's own value?" → foute of verdachte data
"Does the time since the last maintenance change your order? How long is too long?"
"What is the secondary loop for? If it's low, does anyone go without water?"
"Your crew can handle how many pipes in one morning, and does walking distance from the spring matter for the order?" → misschien een route op de kaart (creatieve punten)
"Where do you read this answer: on your phone in the field, or before you leave the house?" → bepaalt de vorm van de UI

Zo hou je nog ongeveer 5 vragen achter de hand voor de verrassingen in haar antwoorden. Vergeet ook niet dat je eerst de andere drie dorpelingen kort moet bevragen voor je gaat bouwen.

Vraag: When is a pipe in trouble for you? At what percentage of normal flow, or what pressure, do you start worrying, and when is it an emergency?
💧
I start worrying when the flow drops below 80 percent of what the pipe normally carries, or the pressure goes under 40 PSI. Then I plan a visit this week. It's an emergency when the flow is below half of normal, or the pressure is under 25 PSI, and then I drop everything. Mind you, it has to be *below*: exactly 80 percent or exactly 40 PSI is still fine.

Daarmee heb je de drempels. Toegepast op de data van nu:

Pipe	Flow %	Druk	Status
NORTH-BRANCH-02	30,8%	22	🔴 Noodgeval (flow én druk)
SECONDARY-LOOP	30,0%	20	🔴 Noodgeval (flow én druk)
SOUTH-BRANCH	66,7%	38	🟠 Bezoek deze week (flow én druk)
BAKERY-BRANCH	94% (pipe) / 280% (sensor)	47	🟢 OK? Of verdacht ⚠️
NORTH-BRANCH-01	95%	52	🟢 OK
PRIMARY-MAIN	94,7%	58	🟢 OK

Twee dingen om mee te nemen in je code:

Gebruik strikt kleiner dan (<), niet <=. Ze benadrukt dat zelf, dus de jury test dat waarschijnlijk.
Een pipe is al in een categorie als flow óf druk de grens overschrijdt.

Je zit nu meteen met twee noodgevallen die allebei ongeveer even slecht zijn. Daarom is de tiebreak-vraag de volgende:

"Two pipes are in emergency at the same time. How do you choose which one first? Does it matter who sits behind it (homes, bakery, farm, mill), and does a pipe that feeds other pipes count heavier?"

Daarna stel ik de vraag over de verouderde metingen (sensors zijn van 16/11) en die over de sensor van de bakkerij die 140 L/min toont op een pipe van 50.

Vergeet niet, er zijn max 15 vragen en we hebben er al 5 gevraagd:
Nieuwe vraag: 
Two pipes are in emergency at the same time. How do you choose which one first? Does it matter who sits behind it (homes, bakery, farm, mill), and does a pipe that feeds other pipes count heavier?
💧
If both pipes are on the same line and one feeds the other, I fix the upstream one first, because it hits more people. Everyone after a broken pipe is in trouble too. Ask me separately about who sits behind the pipes when they're not on the same line.

Klopt. Als je er 5 gebruikt hebt, blijven er 10 over. Ik hou het vanaf nu zuinig.

Wat dit antwoord oplevert: het netwerk is een boom. Spring → PRIMARY-MAIN → Market → (NORTH-BRANCH-01 → Mill → NORTH-BRANCH-02 / SECONDARY-LOOP), BAKERY-BRANCH, SOUTH-BRANCH. Een upstream pipe "erft" iedereen stroomafwaarts. Dat kun je berekenen uit startPoint/endPoint, dus daarvoor heb je geen extra vraag nodig.

Let op: onze twee noodgevallen (NORTH-BRANCH-02 en SECONDARY-LOOP) vertrekken allebei uit de Mill. Ze liggen dus niet op dezelfde lijn, en dan is precies haar volgende antwoord nodig. Ze vraagt er zelf om:

"When two pipes are not on the same line, who comes first: the homes, the bakery, the farm or the mill? And what about a pipe that doesn't feed anyone directly, like the secondary loop?"

Ze knipt samengestelde vragen soms in twee. Het tweede deel hangt hier wel direct mee samen, dus het is het proberen waard.

Plan voor de overige 9 vragen:

Hoe oud mag een meting zijn voor ze ze niet meer vertrouwt? (alle sensoren dateren van 16/11)
Wat als de sensor en de pipe elkaar tegenspreken, of de sensor meer toont dan mogelijk is? (bakkerij: 140 op 50)
Telt achterstallig onderhoud mee, en hoe lang is te lang?
Hoe en waar leest ze het antwoord? (gsm in het veld?)
tot 9: reserve voor verrassingen. Bijvoorbeeld als ze opnieuw "ask me separately" zegt, of iets onverwachts vertelt dat je wil uitdiepen.

Geef de vragen aub

Hier zijn ze, klaar om te plakken. Stel ze één per keer en in deze volgorde:

Vraag 6: wie komt eerst

When two pipes are not on the same line, who comes first: the homes, the bakery, the farm or the mill? And what about a pipe that doesn't feed anyone directly, like the secondary loop?

Vraag 7: verouderde metingen

How old can a reading be before you stop trusting it? And when it's too old, should that pipe go higher or lower on your list, or should the app just warn you?

Vraag 8: tegenstrijdige of onmogelijke data

What should I do when a sensor and the pipe disagree, or a sensor shows more flow than the pipe can carry? Which number do you trust?

Vraag 9: onderhoud

Does a long time since the last maintenance change your order? How long is too long for a pipe?

Vraag 10: gebruik in het veld

Where and how do you read your morning answer: on your phone at the spring, on paper, or somewhere else? And how many pipes can your crew handle in one morning?

Daarna heb je nog 5 vragen in reserve. Gebruik die alleen als een antwoord een nieuwe regel of een "ask me separately" oplevert. Plak haar antwoorden hier, dan zet ik ze om in de rangschikkingslogica.

Morning. Maren Holt, water keeper. I've got six pipes, one crew and never enough time. Ask away, but make it count — I'm due at the spring in ten minutes. The properties of each waterpipe is nominal flow, current flow, pressure and timestamps regarding the maintenance. Which one is important for yo

PASTED

Dit is de volledige chat nu:

Je zit nu op 10 van 15, dus er blijven 5 over. Hier is wat je al hebt, en welke vragen nog ontbreken.

Maren's regels tot nu toe
Status per pipe (strikt kleiner dan):
🔴 Noodgeval: flow < 50% van nominaal of druk < 25 PSI → alles laten vallen
🟠 Zorg: flow < 80% of druk < 40 PSI → bezoek deze week
🟢 OK: anders
Verouderd = "Ik weet het niet": is de meting ouder dan 15 minuten op het moment dat ze kijkt, of ontbreekt er een getal, dan toon je geen groen maar ❔ "onbekend".
Belangrijk: demo-freshness.ts stempelt de sensoren elke 20 seconden met de huidige tijd. Je moet dus de sensor lastReading live vergelijken met "nu", niet met een vaste datum. De jury zet waarschijnlijk een sensor stil om te testen of "ik weet het niet" verschijnt.
Op dezelfde lijn → eerst de upstream pipe. Dat bereken je uit de boom (startPoint/endPoint).
Op verschillende lijnen → mensen eerst: North Residential (140 gezinnen) > Bakery > South Meadow Farms.
Onderhoudsdatum telt niet mee voor de volgorde. Een bewuste keuze, die je zo kunt vermelden in je inzending.
Tegenstrijdige data (bakkerijsensor 140 vs. pipe 47): Maren weet het niet en verwijst naar Ilse. Toon het voorlopig als ⚠️ "cijfers kloppen niet", en vraag het aan Ilse.
UI: gsm, om 6 uur 's ochtends, natte handschoenen → groot, simpel, in één oogopslag te lezen. 's Avonds op de laptop mogen er details bij → twee weergaven.
Volgorde vandaag (volgens deze regels)
🔴 NORTH-BRANCH-02: flow 31%, 22 PSI, 140 gezinnen zonder water
🔴 SECONDARY-LOOP: flow 30%, 20 PSI, voedt niemand rechtstreeks (plaats nog te bevestigen)
🟠 SOUTH-BRANCH: flow 67%, 38 PSI, boerderij
⚠️ BAKERY-BRANCH: cijfers spreken elkaar tegen
🟢 PRIMARY-MAIN, NORTH-BRANCH-01
De laatste vragen (4 + 1 reserve)

Dit zijn precies de drie keren dat ze "ask me separately" zei, plus één ontbrekende regel:

Vraag 11:

Where does the backup loop go on your list when it's in trouble, compared to the pipes that feed homes, the bakery or the farm?

Vraag 12:

Where does a pipe with a reading that's too old or missing go on your list: on top, at the bottom, or somewhere in between?

Vraag 13: de belangrijkste ontbrekende regel

What weighs heavier: how bad a pipe is, or who sits behind it? For example, the farm pipe is an emergency but the homes pipe is only worrying — which do you visit first?

Vraag 14:

How many pipes can your crew handle in one morning, and should the app show only those or the full list?

Vraag 15: reserve. Bewaar die voor het geval een antwoord iets nieuws oplevert.

Ga daarna naar Ilse met de vraag over de rare cijfers. In de data zit ook een verdachte herstelling met een datum in de toekomst, aangemaakt door "system", en een base64-"key" in de repairs-tabel. Daar wil zij zeker van horen.

Gaan we niet best eerst naar de volgende?:
🍞 Tobin's Week Ahead
🍞 Tobin's Week Ahead
Food · talk to Tobin Reyes, the baker

"I can see what's in the pantry today. But whether I can still bake bread next week? No idea. I want to know before it goes wrong, not after." — Tobin

🗣️ How this works
Talk to Tobin in the chat on this page. Tobin knows what he needs. This brief doesn't.
Your questions are limited (the counter is next to the chat). Think before you ask: a vague question gets a vague answer.
Build your solution in the Oakhaven base app. What it does and how it looks is up to you.
Hand in below, in 5 to 10 sentences: what you built, for which need, which choices you made and what you left out on purpose.
Done? Call a coach. As soon as you handed in, call a coach and show it in about two minutes: what does the villager need, and how does your app help? The coach judges what your app does for the village, not your code.
One app or four? Your call: one app for the whole village, or one per villager. Every app you add under src/ gets its own launchpad tile.
Plan your day: ask all four villagers a few questions before you build, then pick who you help first.
⚖️ How the jury scores (10 points)
Points
Asked well: your chat shows you found out what Tobin really needs    2
Logical: every choice has a reason you can explain    4
Creative: something we did not see coming    4
💡 Your own AI assistant can help you build. It cannot know what the villagers need: only they can tell you.

🍞
Tobin Reyes
Baker
In the village — ready to talk
14 of 15 questions left
🍞
Ah, visitors! Tobin, the baker. Mind the flour. The ovens are hot and so is my head: I can see what's in the pantry today, but I've no idea if I can still bake next week. What do you want to know?
In the data we see current quantity of food, minimum level and consumption per day. Are these all important and do you want the information itself or us to make the desicions for you?
🍞
Oh yes, all three matter to me! What I really want to know per product is how many days until it's gone at this pace. And whether it's below my minimum, which makes me nervous, or below half of it, which is pure panic. Your second question about who makes the decisions is a good one, but ask it separately, my hands are full of dough right now.
Ask Tobin one question…

Ask
Enter to send · Shift+Enter for a new line · vague questions get vague answers
0 / 600
Your solution
🔒 Only your team and the jury can read this. Saving again replaces your previous version.
What did you build, and for which need? Which choices did you make, and what did you leave out on purpose? (5 to 10 sentences)

0 / 100,000
Hand in my solution
Teams that handed in a solution
No team has handed in a solution yet.

Ja, goed idee. De briefing zegt het ook: "ask all four villagers a few questions before you build". Maren's laatste 5 vragen houden we achter de hand. Die zijn nuttiger als je weet hoe de rest van het dorp in elkaar zit.

Wat Tobin's antwoord oplevert, toegepast op de data

Per product: dagen tot het op is (hoeveelheid / verbruik) en status (onder minimum = nerveus, onder de helft van minimum = paniek):

Product	Voorraad / min	Dagen tot op	Status
Eggs	5 / 12	3,3	🔴 Paniek (< 6)
Flour	40 / 45	6,7	🟠 Nerveus
Butter	−3 / 12	?	⚠️ Onmogelijk getal (aangepast door "system", om 03:13, hetzelfde tijdstip als de rare bakkerijsensor) → Ilse
Milk	180 / 120	3,0	🟢 boven minimum, maar over 3 dagen op!
Bread	35 / 20	7,0	🟢
Apples, Grain, Potatoes, Cheese, Salt		10–75	🟢

Melk is het interessante geval. Volgens zijn minimumregel is het "OK", maar het is als eerste op. Dat moet je hem vragen.

Vragen voor Tobin (stel er 6, hou ~7 in reserve)

Vraag 2: de vraag die hij zelf apart wilde

Do you want the app to tell you what to do, like what to order or what not to bake, or just warn you which products are in trouble?

Vraag 3: de kern van "can I still bake bread next week"

Which products do you need to bake bread, and does running out of one of them stop the baking completely?

Vraag 4: de tijdshorizon

How far ahead do you need to know? From how many days left do you want a warning, and is "next week" seven days for you?

Vraag 5: het melk-dilemma

What worries you more: a product below your minimum, or a product that will be gone soonest? Milk is above minimum but gone in three days, eggs are below minimum. Which comes first?

Vraag 6: bevoorrading

How do you get new stock: who delivers, how long does it take after you order, and should the app count on deliveries that are on the way?

Vraag 7: gebruik

When and where do you look at this: in the morning before baking, once a week, on your phone or on a screen in the bakery?

Over de boter van −3 hoef je Tobin niets te vragen. Dat gaat naar Ilse, samen met de bakkerijsensor en de herstelling met de datum in de toekomst. Ze zijn allemaal op hetzelfde moment aangepast door "system". Let ook op: Tobin past zelf vaak waterpipes aan in de data (modifiedBy: tobin.reyes). Waarschijnlijk onschuldig, maar Ilse vindt het misschien interessant.

Plak zijn antwoorden hier, dan doen we daarna Rowan en Ilse.

Ik heb de vragen aan tobin nog niet gevraagd. geef me alle context die ik kan prompten om nu met de info van de waterkeeper al te starten in claude code in het project

Ik heb een prompt voor Claude Code geschreven in maren-prompt.md. Plak de volledige inhoud in Claude Code, in de root van HTF2026-Flexso. Ik heb hem afgestemd op de AGENTS.md van jullie project en op de echte data.

Wat erin staat:

Maren's regels, letterlijk zoals zij ze gaf. Dat zijn de drempels met strikt kleiner dan, de 15 minuten voor "I don't know", eerst upstream, eerst mensen (Residential > Bakery > Farm), onderhoud telt niet mee, en rare cijfers markeren en doorverwijzen naar Ilse.
De vier open vragen als aparte instellingen in één config-bestand, met een tijdelijke standaardwaarde. Claude Code beslist ze dus niet zelf: als Maren later antwoordt, pas je telkens één regel aan. AGENTS.md verbiedt trouwens ook dat de AI zelf regels verzint.
Twee weergaven. 's Ochtends een gsm-lijst "1 → 2 → 3" met een waarom-zin per pipe. 's Avonds een detailweergave op de laptop.
Technische aanpak. Een aparte app src/water-round/ met een eigen tegel in de launchpad. De rangschikking zit in de backend als losse functie die je kunt testen, met checks voor de grensgevallen.
De verwachte uitkomst met de data van nu, zodat je kunt nakijken of de app klopt.
Fase 2 (creatief): de route ingekleurd op de dorpskaart via mapPath.

Ondertussen kan iemand van je team de vragen aan Tobin, Rowan en Ilse stellen terwijl Claude Code bouwt. Zo verlies je geen tijd.

Maren prompt
Document

maren-prompt.md:
Opdracht: "Maren's Morning Round" — een app voor de waterbeheerder

Lees eerst AGENTS.md en de README (datamodel + kaartgrid). Volg alle conventies daar (TypeScript only, @namespace op elke UI5-klasse, i18n voor alle teksten, OData V4, semantic states, sap_horizon_dark, geen nieuwe npm-packages). Leg mij (nieuw in CAP/UI5) kort uit wat je verandert en waarom. Werk in kleine, werkende stappen. "Klaar" = npm run typecheck, npm run lint:ui5 en cds build zijn clean en het werkt in de launchpad.

Wie is de gebruiker en wat heeft ze nodig (uit het interview — dit zijn HAAR regels, niet verzinnen)

Maren Holt, waterbeheerder. Zes pipes, één ploeg, altijd te laat. Ze wil elke ochtend een kort antwoord: waar ga ik eerst naartoe, dan waarheen, en waarom die eerst. Ze wil geen cijfers puzzelen.

Regel 1 — Status per pipe (STRIKT kleiner dan: exact 80% of exact 40 PSI is nog OK)
flowPercent = currentFlow / nominalFlowRate * 100
🔴 EMERGENCY ("drop everything"): flow < 50% of druk < 25 PSI
🟠 WORRY ("bezoek deze week"): flow < 80% of druk < 40 PSI
🟢 OK: anders
Eén van beide (flow óf druk) volstaat om in een categorie te vallen.
Regel 2 — Verouderd of ontbrekend = "Ik weet het niet"
Als de meting meer dan 15 minuten oud is op het moment dat ze kijkt → status UNKNOWN.
Ontbrekende getallen (geen sensor, null flow/druk/nominaal) → ook UNKNOWN.
Citaat: "I'd rather see 'I don't know' than a nice reassuring green light." → NOOIT groen tonen voor onbekend.
De versheid komt van Sensors.lastReading. srv/lib/demo-freshness.ts zet die elke 20 s op "nu", dus vergelijk live met de huidige tijd (op het moment van lezen), niet met een vaste datum. De app moet ook correct reageren als een sensor stopt met rapporteren (test dit!).
Regel 3 — Op dezelfde lijn: upstream eerst
Als twee pipes in nood op dezelfde lijn liggen (de ene voedt de andere), eerst de upstream pipe: iedereen erachter zit ook zonder water.
Het netwerk is een boom die je afleidt uit startPoint → endPoint (landmarknamen), wortel = Silverbrook Spring: PRIMARY-MAIN (Spring → Market) → { NORTH-BRANCH-01 (Market → Mill) → { NORTH-BRANCH-02 (Mill → North Residential), SECONDARY-LOOP (Mill → Spring, backup loop) }, BAKERY-BRANCH (Market → Bakery), SOUTH-BRANCH (Market → Farms) }. Bereken dit generiek uit de data, niet hardcoded op pipe-ID.
Bereken per pipe welke landmarks stroomafwaarts getroffen zijn (via Landmarks.suppliedBy + de boom).
Regel 4 — Op verschillende lijnen: mensen eerst
North Residential Area (~140 gezinnen)
The Bakery (bakt brood voor het hele dorp)
South Meadow Farms (dieren kunnen een halve dag op de drinkbakken)
Regel 5 — Onderhoudsdatum telt NIET mee voor de volgorde

Haar volgorde komt enkel van hoe slecht de metingen zijn en wie erachter zit. (Mag als detail getoond worden.)

Regel 6 — Tegenstrijdige/onmogelijke data: niet oplossen, wel tonen

Voorbeeld in de data: sensor SENS-004 op BAKERY-BRANCH meldt 140 L/min op een pipe met nominaal 50 (de pipe zelf zegt 47). Maren weet niet welk getal te vertrouwen; Ilse (bibliothecaris) onderzoekt rare cijfers. → Markeer zo'n pipe als "numbers don't add up — check with Ilse" (eigen status/badge, nooit groen). Detecteer generiek: sensorwaarde wijkt duidelijk af van de pipewaarde, flow > nominaal, negatieve waarden. Gebruik voor de status de sensorwaarden (die hebben een timestamp); toon de pipewaarden als vergelijking.

OPEN VRAGEN — nog niet aan Maren gevraagd. NIET zelf beslissen.

Zet deze als duidelijk benoemde constanten in één config-bestand (bv. srv/lib/morning-round-config.ts) met een comment // OPEN QUESTION — confirm with Maren, zodat we ze in 1 regel kunnen aanpassen:

Waar komt de SECONDARY-LOOP (backup loop) in de volgorde, t.o.v. homes/bakery/farm? (voorlopig: na farm)
Waar komt een pipe met status UNKNOWN in de lijst: bovenaan, onderaan, apart? (voorlopig: aparte sectie "I don't know" onder de urgente)
Wat weegt zwaarder: ernst of wie erachter zit? (bv. farm = EMERGENCY vs. homes = WORRY) (voorlopig: ernst eerst, dan regel 3, dan regel 4)
Hoeveel pipes kan de ploeg op één ochtend aan; enkel die tonen of de hele lijst? (voorlopig: hele lijst)
Hoe ze het gebruikt → twee weergaven
Ochtend (gsm, 6u, in een veld, natte handschoenen): groot, simpel, in één oogopslag. Een genummerde lijst "1 → 2 → 3", per pipe: grote status (icoon + tekst + semantic kleur, nooit kleur alleen), naam van de route, en één zin "waarom", bv. "Flow 31% of normal, 22 PSI — 140 families in North Residential without water." Weinig tikken nodig, grote touch-targets, geen tabellen.
Avond (laptop, thuis): details mogen: flow vs nominaal, druk, leeftijd meting, getroffen landmarks, repairs-historiek, dagen sinds onderhoud.
Auto-refresh (bv. elke 20–30 s) zodat de "verouderd"-check live klopt; toon "last updated".
Technische aanpak (voorstel — pas aan als het beter kan, maar leg uit waarom)
Nieuwe app src/water-round/ (kopie van src/oakhaven-app, eigen id/namespace/mountPath/semanticObject, launchpad-tile "Maren's Morning Round"). Laat de bestaande app ongemoeid.
Logica in de backend, als pure, testbare functie in srv/lib/morning-round.ts (input: pipes + sensors + landmarks + now; output: geordende lijst met status, reden, getroffen landmarks, rang). Geef die vrij via een unbound function op WaterSupplyService (bv. function morningRound() returns many MorningRoundItem;) of via virtual fields op WaterPipes — kies, en leg uit waarom.
De "waarom"-zin: bouw ze uit i18n-teksten met placeholders in de UI, niet als vrije string uit de backend (of geef een reason-code + parameters terug).
Schrijf een paar snelle checks voor de grensgevallen: exact 80% → OK, exact 40 PSI → OK, 49.9% → EMERGENCY, reading 15 min 1 s oud → UNKNOWN, ontbrekende sensor → UNKNOWN.
Verwachte uitkomst met de huidige data (controle)
🔴 NORTH-BRANCH-02 — 31% flow, 22 PSI, North Residential (140 gezinnen)
🔴 SECONDARY-LOOP — 30% flow, 20 PSI, backup loop (plaats = open vraag 1)
🟠 SOUTH-BRANCH — 67% flow, 38 PSI, South Meadow Farms
⚠️ BAKERY-BRANCH — sensor 140 vs pipe 47 L/min → "numbers don't add up"
🟢 PRIMARY-MAIN (95%, 58 PSI), NORTH-BRANCH-01 (95%, 52 PSI)
Fase 2 (pas als fase 1 werkt) — creatief

Toon de route op de dorpskaart (webapp/img/oakhaven-map.jpg, 8×8 grid, WaterPipes.mapPath in gridunits): pipes ingekleurd per status, genummerd in bezoekvolgorde, getroffen gebieden gemarkeerd.