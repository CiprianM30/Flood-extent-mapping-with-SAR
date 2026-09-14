// =========================================================================
// FLOOD EXTENT MAPPING WITH SENTINEL-1 SAR - FIXED THRESHOLD
// =========================================================================

// 1. General settings
var preStart = '2024-09-01';
var preEnd   = '2024-09-13';
var postStart = '2024-09-14';
var postEnd   = '2024-09-25';

var floodThreshold = -2.75;

// 2. Sentinel-1 image selection
var s1 = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(geometry)
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.eq('instrumentMode', 'IW'));

var preImage = s1
  .filterDate(preStart, preEnd)
  .select('VV')
  .median()
  .clip(geometry);

var postImage = s1
  .filterDate(postStart, postEnd)
  .select('VV')
  .median()
  .clip(geometry);

Map.centerObject(geometry, 11);
Map.addLayer(geometry, {color: 'yellow'}, 'Area of Interest', false);
Map.addLayer(preImage, {min: -25, max: 0}, 'Sentinel-1 PRE');
Map.addLayer(postImage, {min: -25, max: 0}, 'Sentinel-1 POST');

// 3. Change detection
var difference = postImage.subtract(preImage);
var rawFlood = difference.lt(floodThreshold);

// 4. Permanent water and slope masks
var jrcWater = ee.Image('JRC/GSW1_4/GlobalSurfaceWater')
  .select('occurrence');

var permanentWater = jrcWater.gt(80);

var elevation = ee.Image('USGS/SRTMGL1_003');
var slope = ee.Terrain.slope(elevation);
var steepSlopes = slope.gt(5);

var finalFlood = rawFlood
  .where(permanentWater, 0)
  .where(steepSlopes, 0)
  .selfMask();

Map.addLayer(
  permanentWater.selfMask().clip(geometry),
  {palette: ['blue']},
  'Permanent water',
  false
);

Map.addLayer(
  finalFlood,
  {palette: ['red']},
  'Flood extent - fixed threshold'
);

// 5. Flooded area in hectares
var areaImage = finalFlood.multiply(ee.Image.pixelArea());

var stats = areaImage.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: geometry,
  scale: 10,
  maxPixels: 1e9
});

var floodAreaHa = ee.Number(stats.get('VV')).divide(10000);

print('Flooded area (ha) - fixed threshold:', floodAreaHa); 