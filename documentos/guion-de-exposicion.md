# Presentation script (Tuesday, November 17)

Time: a short slot. Follow the same three steps as the project card.

## 1. The problem (about 30 seconds)

- Who suffers it: living people who get scared, feel a sudden chill, or lose their shadow.
- Why it matters: ghosts have no channel to receive complaints, so the complaints get lost.

## 2. The solution (about 1 minute)

- What it does: the claimant files a complaint, and the office returns a file number, a priority and a deadline.
- The improbable ingredient: the official receipt, signed by The Ghost.
- One sentence on what is different: claims can be anonymous and can be filed against a specific person.

## 3. The live demo (about 2 minutes)

1. Show the empty form and the board.
2. File a claim with your name and a reason, for example "Stolen shadow".
3. Show the receipt: file number, priority 1, deadline 1 day.
4. File an anonymous claim against "The Neighbour in 3B" and show that the name does not appear on the board.
5. Press **+ 8 aleatorios** to show the live board filling up.

## Questions to answer from memory

1. **What does each important part of the code do?**
   - `ReclamosService`: assigns the file number, the priority and the deadline, and keeps the board in memory.
   - `CrearReclamoDto`: validates the input before it reaches the service.
   - `page.tsx`: the form, the receipt and the live board, which refreshes every few seconds.
   - `next.config.ts`: forwards `/api` requests from the web to the API.

2. **How do you run and test it?**
   - `pnpm install`, then `pnpm dev`. Open `http://localhost:3001`.
   - Test one claim of each reason and check the priority and the deadline.

3. **Which decisions were yours, and which did the AI suggest?**
   - Mine: the reasons, their priorities, the anonymous option, the choice of an in-memory board, and the three-step flow.
   - From the AI: the layout details, the visual effects, and some code structure.
   - Be ready to explain what each part does without reading it.
