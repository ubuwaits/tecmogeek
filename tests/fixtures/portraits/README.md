# Portrait references

The TSV records the website's team slug, zero-based 32px sheet cell, displayed position, player name and original NES face ID. Names were joined to the game's named roster entries before looking up face IDs in the corresponding team's ability table. The site's skill-position labels sometimes differ from the game's raw slots. [Pinned roster and face-ID source](https://github.com/bruddog/Tecmo_Super_Bowl_NES_Disassembly/blob/f3bae0e1913ba532a5ace158d86d905ecf787008/Bank1_2_team_data.asm)

`faces.json` contains one SHA-256 per face ID over the 32×32 opaque RGB pixels in row-major order. These references use the site's palette. Repeated face IDs were cross-checked across the sheets. Unique IDs use the audited sheet cell as their regression baseline. For Indianapolis, Jack Trudeau's face 03 matches Seattle's cell 8, leaving cell 0 for Jeff George's unique face 04.

The six reversed QB roster pairs use cell 0 for QB1 and cell 1 for QB2. Eleven of their twelve cells have pixel-identical references elsewhere. The audit also found that Raiders cell 6 (Mervyn Fernandez, face 86) contained face A6. The repaired pixels match Jets cell 6 (Al Toon) and the other players assigned face 86.
