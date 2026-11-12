# Project card: The Ghost's Claims Office

| Field | What it is |
|---|---|
| **Name** | The Ghost's Claims Office (*La Oficina de Reclamos del Fantasma*) |
| **Pavilion** | Invented Worlds (Pavilion 3) |
| **Who** | Living people who got scared, feel a suspicious chill, or lost their shadow |
| **Problem** | Ghosts have no channel to receive complaints from the living, so complaints get lost |
| **Input** | Claimant name (not required if anonymous), reason, short description, and optionally who the claim is against |
| **Process** | Assigns a file number (FANT-0001, FANT-0002, ...), takes the priority and deadline from the reason, and stores the claim |
| **Output** | An official receipt on screen, and a live board of submitted claims |
| **Improbable ingredient** | Official receipt (*comprobante oficial*) |

## Priority by reason

| Reason | Priority | Deadline |
|---|---|---|
| Fright | 1 | 1 day |
| Stolen shadow | 1 | 1 day |
| Suspicious chill | 2 | 3 days |
| Midnight noise | 3 | 7 days |

## Minimum prototype check

- [x] Receives data: name (or anonymous), reason, description.
- [x] Processes it: file number, priority and deadline.
- [x] Shows a visible result that changes with the input.
- [x] Includes the improbable ingredient: the official receipt.
- [ ] Anyone can use it in one minute, with no explanation (test it on a classmate before Tuesday).
