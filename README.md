# Ice Expansion: Rime

A content expansion for **Mindustry v160.7** set around cryogenic resources, ice-themed defenses and units, and four custom Serpulo campaign sectors. 

## Content overview

- **Materials:** Cryolite (mineable ore), Cryosteel, and Rime Alloy.
- **Production and logistics:** Cold Forge, Polar Forge, Cryofluid Dissolver, Shock Generator, Titanium Bridge, and Titanium Liquid Bridge; plus the Rime Wall.
- **Custom turrets:** Shiver (1×1 shrapnel), Whiteout (2×2 continuous flame), Hailstorm (4×4 anti-air flak), and Avalanche (3×3 laser).
- **Unit production:** Frost Assembler and the Rime, Glacial, Cryonic, Polar, and Apex reconstructors.
- **Standard unit lines:** 
  - Land: Scimitar → Falchion → Xiphos → Brand → Claymore; 
  - Naval: Flake → Graupel → Penitente → Brinicle → Glacier
  - Air: Wraith → Manticore → Phoenix → Aerico → Valravn.
- **Additional tier-6 units:** Singularity Walker, Constellation Mothership, and Psychroteuthis Supercarrier. Each has unique, powerful abiities. 
- **Campaign sectors:** Glacial Frontier, Permafrost Basin, Cryolite Expanse, and Zero Point, with bundled `.msav` map resources and Serpulo sector presets.
- **Status effects and adjustments:** custom Charge, Shattered, and Time Slow effects, plus a Spiroct override.

## Vanilla turret ammunition extension

`scripts/main.js` uses Mindustry's Rhino `Packages` API and runs ammunition registration on `ModContentLoadEvent`, after modded items have been loaded. It adds **10** item/bullet combinations, while retaining existing vanilla ammunition:

| New resource | Vanilla turrets |
| --- | --- |
| Cryolite | Duo, Scorch, Hail, Ripple |
| Cryosteel | Salvo, Cyclone, Spectre |
| Rime Alloy | Fuse, Foreshadow, Spectre |

## Installation

Import the ZIP using Mindustry's Mods menu and restart the game. The archive contains a single `Ice-Expansion-Rime/` folder with `mod.hjson` at that folder's root.
