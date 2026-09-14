// =========================================================================
// FLOOD EXTENT MAPPING WITH SENTINEL-1 SAR - OTSU ON DIFFERENCE
// =========================================================================

// 1. Sentinel-1 image selection
var preStart = '2024-09-01';
var preEnd   = '2024-09-13';
var postStart = '2024-09-14';
var postEnd   = '2024-09-25';

var s1 = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(geometry)
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.eq('instrumentMode', 'IW'));

var beforeImg = s1
  .filterDate(preStart, preEnd)
  .select('VV')
  .mean()
  .focal_median(30, 'circle', 'meters');

var afterImg = s1
  .filterDate(postStart, postEnd)
  .select('VV')
  .mean()
  .focal_median(30, 'circle', 'meters');

Map.centerObject(geometry, 10);
Map.addLayer(beforeImg, {min: -25, max: 0}, 'Sentinel-1 PRE (VV)');
Map.addLayer(afterImg, {min: -25, max: 0}, 'Sentinel-1 POST (VV)');

// 2. Difference in dB
var differenceDB = afterImg.subtract(beforeImg);

Map.addLayer(
  differenceDB,
  {min: -10, max: 5},
  'Difference (POST - PRE)'
);

// 3. Automatic Otsu threshold
var minVal = -15.0;
var maxVal = 5.0;

var scaledDiff = differenceDB
  .subtract(minVal)
  .divide(maxVal - minVal)
  .multiply(255)
  .uint8();

function getOtsuThreshold(scaledImage, roi) {
  var histogram = scaledImage.reduceRegion({
    reducer: ee.Reducer.histogram(256, 1),
    geometry: roi,
    scale: 30,
    maxPixels: 1e9
  });

  var counts = ee.Array(
    ee.Dictionary(histogram.get('VV')).get('histogram')
  );

  var means = ee.Array(
    ee.Dictionary(histogram.get('VV')).get('bucketMeans')
  );

  var size = means.length().get([0]);
  var total = counts.reduce(ee.Reducer.sum(), [0]).get([0]);
  var sum = means.multiply(counts).reduce(ee.Reducer.sum(), [0]).get([0]);

  var indices = ee.List.sequence(0, size.subtract(1));

  var bss = indices.map(function(i) {
    i = ee.Number(i);

    var countB = counts
      .slice(0, 0, i.add(1))
      .reduce(ee.Reducer.sum(), [0])
      .get([0]);

    var sumB = means
      .slice(0, 0, i.add(1))
      .multiply(counts.slice(0, 0, i.add(1)))
      .reduce(ee.Reducer.sum(), [0])
      .get([0]);

    var meanB = sumB.divide(countB);
    var countF = total.subtract(countB);
    var meanF = sum.subtract(sumB).divide(countF);

    return countB
      .multiply(countF)
      .multiply(meanB.subtract(meanF).pow(2));
  });

  var maxIndex = ee.List(bss).indexOf(
    ee.List(bss).reduce(ee.Reducer.max())
  );

  return means.get([maxIndex]);
}

var otsuScaled = getOtsuThreshold(scaledDiff, geometry);

var otsuDB = ee.Number(otsuScaled)
  .divide(255)
  .multiply(maxVal - minVal)
  .add(minVal);

print('Otsu threshold (dB):', otsuDB);

var rawFlood = differenceDB.lt(otsuDB);
var floodMask = rawFlood.updateMask(rawFlood);

// 4. Permanent water and slope masks
var jrcWater = ee.Image('JRC/GSW1_4/GlobalSurfaceWater')
  .select('occurrence');

var permanentWater = jrcWater.gt(80);

var floodNoPermanent = floodMask
  .where(permanentWater, 0)
  .updateMask(floodMask.where(permanentWater, 0));

var dem = ee.Image('USGS/SRTMGL1_003');
var slope = ee.Terrain.slope(dem);

var finalFlood = floodNoPermanent.updateMask(slope.lt(5));

Map.addLayer(
  finalFlood,
  {palette: ['red']},
  'Flood extent - Otsu threshold'
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

print('Flooded area (ha) - Otsu threshold:', floodAreaHa); 