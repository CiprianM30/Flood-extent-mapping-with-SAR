# Methods & validation (Flood extent mapping with SAR)

## Events / reference products (Copernicus EMS)
- **Poland – Racibórz**: EMSR756  
  https://mapping.emergency.copernicus.eu/activations/EMSR756/stats
- **Romania – Pechea (Galați county)**: EMSR758  
  https://mapping.emergency.copernicus.eu/activations/EMSR758/stats

EMS summary tables used for reference are included in `data/ems/`.

## Data
- Sentinel‑1 GRD (VV, IW) via Google Earth Engine (`COPERNICUS/S1_GRD`)
- Permanent water mask: JRC Global Surface Water occurrence (`JRC/GSW1_4/GlobalSurfaceWater`, occurrence > 80%)
- Terrain slope: SRTM DEM (`USGS/SRTMGL1_003`), slope > 5° excluded

## Approach
Two SAR change‑detection approaches were tested:

### A) Fixed threshold on backscatter change (POST − PRE)
1. Create pre‑event and post‑event VV composites (median).
2. Compute difference: `diff = postVV − preVV`.
3. Flood candidates: `diff < -2.75 dB`.
4. Remove permanent water (JRC occurrence > 80%).
5. Remove steep terrain (slope > 5°).
6. Estimate flooded area (ha) using pixel area.

### B) Otsu automatic threshold on difference
1. Create pre‑event and post‑event VV composites (mean + focal median).
2. Compute difference in dB.
3. Compute Otsu threshold on the difference histogram and classify flood as `diff < T_otsu`.
4. Apply the same JRC + slope filters.
5. Estimate flooded area (ha).

## Results summary
Computed areas are in `results/area_estimates.csv`. EMS reference numbers are in `results/ems_reference_stats.csv`.

## Validation vs Copernicus EMS (qualitative + area comparison)
- **Romania (Pechea, EMSR758)**  
  EMS reports **event extent ~427.4 ha** and **max extent ~918.4 ha** for the AOI.  
  Our fixed-threshold result is **~462.9 ha**, which is close to the EMS event extent.  
  Otsu-on-difference produced a very high estimate (**~8103 ha**) for this AOI; this is reported as a negative result (likely driven by threshold instability / non-flood backscatter changes inside the AOI).

- **Poland (Racibórz, EMSR756)**  
  EMS reports **latest observations ~1773.9 ha** and **max extent ~3727.2 ha** for the AOI.  
  Our fixed and Otsu-on-difference results are **~1077–1076 ha**, lower than EMS.  
  One key limitation is **AOI mismatch**: the project AOIs were drawn manually in GEE and may not match the official EMS AOI polygons, which directly affects area totals.

## Limitations
- Manual AOI geometry vs official EMS AOIs (area mismatch).
- SAR backscatter change is not uniquely flood: soil moisture, vegetation and acquisition geometry may affect results.
- Otsu on difference may be unstable depending on histogram and scene heterogeneity.

## Recommended next steps
- Use official EMS AOI polygons (or export/import exact geometries).
- Apply consistent orbit/pass filtering (ASC/DESC) and relative orbit where possible.
- Prefer Otsu on VV water segmentation (pre/post) when robust water masks are needed.