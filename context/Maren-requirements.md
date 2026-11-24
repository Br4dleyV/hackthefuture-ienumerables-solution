# Maren Holt — Morning Round

Source: Maren’s HTF villager chat, as shared by the team. Maren has six pipes and one crew. She wants a short, ordered route: where to go first, where to go next, and why. She delegated how the app calculates the route.

## Pipe status

Evaluate reading quality first, then severity. Compare current flow with the pipe’s nominal flow and use pressure in PSI. Either measurement can trigger a status.

| Status | Rule | Maren’s action |
| --- | --- | --- |
| Unknown | Reading is more than 15 minutes old when she looks, or a required number is missing | Show “I don’t know,” not a reassuring green status; go and check |
| Emergency | Flow is below 50% of nominal **or** pressure is below 25 PSI | Drop everything |
| Visit this week | Not an emergency, but flow is below 80% of nominal **or** pressure is below 40 PSI | Plan a visit this week |
| Fine | Reading is trustworthy and neither threshold is crossed | No visit indicated by these rules |

Thresholds are strict. Exactly 15 minutes old is not stale by age alone. Exactly 80% flow or 40 PSI does not trigger a visit on that metric; exactly 50% flow or 25 PSI does not trigger an emergency on that metric. The other metric can still trigger a higher severity.

## Visit order

1. **Emergencies first**, regardless of who is affected. Maren would visit a farm emergency before a residential pipe that only needs a visit this week.
2. **Unknown pipes next**, because someone needs to inspect them.
3. **Visit-this-week pipes after that.**

When two emergencies are on the same line and one pipe feeds the other, fix the **upstream pipe first**. Include the people and places downstream when explaining who is affected. For pipes on different lines, Maren’s stated impact order is **North Residential Area** (about 140 families), then **The Bakery** (bread for the village), then **South Meadow Farms** (the animals can manage half a day on the troughs). The mill and secondary/backup loop were not assigned a rank. Time since maintenance does **not** determine visit order; Maren gave no overdue-maintenance threshold.

## How Maren uses it

- **06:00, on her phone:** She reads it while walking the pipes with wet gloves. Make the route and reasons large, simple, and readable at a glance.
- **Evening, on her laptop:** Detailed readings and explanations are fine.

## Open questions

- **Backup loop and mill:** Where do they rank relative to homes, bakery and farm when the pipes have the same urgency and are on different lines?
- **Crew capacity:** How many sites can her one crew inspect or repair in a morning? No limit was given.
- **Conflicting or implausible readings:** Maren does not know which source to trust when a sensor and pipe disagree, or when a sensor reports more than the pipe can carry. Ask Ilse; Maren gave no source-precedence rule.
- **Remaining ties:** Maren did not specify how to break ties between equally urgent pipes with the same impact, or whether to apply the same upstream and impact rules within the unknown and visit-this-week groups.
