# FloodSAR Rapid Reports — startup pitch (1‑pager)

## Problem
Flood events require rapid, objective and auditable maps of flood extent. Optical imagery is often blocked by clouds exactly when floods happen. Insurers and local authorities need fast estimates to prioritize response and claims triage.

## Solution
**FloodSAR Rapid Reports**: a rapid mapping pipeline that produces flood extent maps and flooded area estimates from **Sentinel‑1 SAR** within hours after an event. Outputs are GIS-ready and can be compared against official rapid mapping products (e.g., Copernicus EMS).

## Target customers
- **Insurance companies**: rapid claims triage, portfolio exposure, loss assessment support
- **Local authorities / civil protection**: situational awareness and response prioritization
- **Utilities & infrastructure operators**: identify affected assets and access constraints

## Value proposition
- Works through clouds (SAR)
- Automated processing & repeatable parameters
- Clear deliverables: pre/post imagery, flood extent mask, flooded area statistics
- Fast deployment using Google Earth Engine

## Business model
- B2B subscription (monthly/annual) for dashboards + API access
- Pay‑per‑event rapid report
- Integration services for enterprise GIS / claims systems

## Differentiation
- Rapid + cloud‑robust SAR approach
- Auditability: parameters and processing steps are documented
- Validation against official EMS products

## Roadmap
- Import official EMS AOIs and automate validation (IoU/overlap metrics)
- Add Sentinel‑2 mapping when cloud‑free (multi‑sensor comparison)
- Add exposure layers (buildings, roads) and automatic impact stats
- Operationalization: alerting, scheduled runs, export packages (GeoTIFF/GeoJSON/CSV)

## Expansion market: ESG & corporate climate risk
Beyond rapid response, the same pipeline supports **climate risk reporting** for banks, investment funds and large corporates:
- flood exposure screening for portfolios (buildings, plants, land)
- historical flood recurrence analysis using archived Sentinel‑1 data
- automated, auditable reports supporting ESG / climate disclosure requirements

This creates a recurring‑revenue product line on top of event‑driven rapid mapping. 