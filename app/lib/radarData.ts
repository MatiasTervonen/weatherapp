import { parseStringPromise } from "xml2js";

interface RadarData {
  time: string;
  url: string;
  bbox: [number, number, number, number];
  srs: string;
  pos: [number, number]; // Position of the radar
  vectorX: [number, number];
  vectorY: [number, number];
  gain: number;
  offset: number;
}

// Function to fetch radar data
export async function fetchRadarData(): Promise<RadarData[]> {
  console.log("📡 Fetching radar data...");

  try {
    const url =
      "https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=GetFeature&storedquery_id=fmi::radar::composite::rr1h";

    const response = await fetch(url, { next: { tags: ["weather-map"] } });
    const xmlText = await response.text();

    // Convert XML to JSON
    const jsonData = await parseStringPromise(xmlText, {
      explicitArray: false,
    });

    const features = jsonData["wfs:FeatureCollection"]["wfs:member"];
    const radarData: RadarData[] = [];

    if (Array.isArray(features)) {
      for (const feature of features) {
        const property = feature["omso:GridSeriesObservation"];

        const time =
          property["om:phenomenonTime"]["gml:TimeInstant"]["gml:timePosition"];

        //   Gain and offset values

        const parameters = property["om:parameter"];

        let gain = 1;
        let offset = 0;

        if (Array.isArray(parameters)) {
          parameters.forEach((param) => {
            const observedProperty =
              param["om:NamedValue"]["om:name"]["$"]["xlink:href"];
            const value = parseFloat(
              param["om:NamedValue"]["om:value"]["gml:Measure"]["_"]
            );

            if (observedProperty.includes("Gain")) {
              gain = value;
            } else if (observedProperty.includes("Offset")) {
              offset = value;
            }
          });
        }

        // Position of Radar

        const posString =
          property["om:result"]["gmlcov:RectifiedGridCoverage"][
            "gml:domainSet"
          ]["gml:RectifiedGrid"]["gml:origin"]["gml:Point"]["gml:pos"];

        const pos = posString.trim().split(" ").map(parseFloat) as [
          number,
          number
        ];

        // Offset vectors

        const rectifiedGrid =
          property["om:result"]["gmlcov:RectifiedGridCoverage"][
            "gml:domainSet"
          ]["gml:RectifiedGrid"];

        // Extract offset vectors (should be an array of two elements)

        // Default values
        let vectorX: [number, number] = [0, 0];
        let vectorY: [number, number] = [0, 0];

        if (rectifiedGrid && rectifiedGrid["gml:offsetVector"]) {
          const offsetVectors = rectifiedGrid["gml:offsetVector"];

          if (Array.isArray(offsetVectors) && offsetVectors.length === 2) {
            vectorX = offsetVectors[0].trim().split(" ").map(parseFloat) as [
              number,
              number
            ];
            vectorY = offsetVectors[1].trim().split(" ").map(parseFloat) as [
              number,
              number
            ];
          }
        }
        const imageUrl =
          property["om:result"]["gmlcov:RectifiedGridCoverage"]["gml:rangeSet"][
            "gml:File"
          ]["gml:fileReference"];

        const bboxString =
          property["om:featureOfInterest"]["sams:SF_SpatialSamplingFeature"][
            "sams:shape"
          ]["gml:Polygon"]["gml:exterior"]["gml:LinearRing"]["gml:coordinates"];
        const bboxValues = bboxString.trim().split(" ").map(parseFloat);

        //  Keep only the first 4 values (minX, minY, maxX, maxY)
        const bboxTrimmed = [
          Math.min(bboxValues[0], bboxValues[2], bboxValues[4], bboxValues[6]), // minX
          Math.min(bboxValues[1], bboxValues[3], bboxValues[5], bboxValues[7]), // minY
          Math.max(bboxValues[0], bboxValues[2], bboxValues[4], bboxValues[6]), // maxX
          Math.max(bboxValues[1], bboxValues[3], bboxValues[5], bboxValues[7]), // maxY
        ];

        radarData.push({
          time: new Date(time).toISOString(),
          url: imageUrl,
          bbox: bboxTrimmed as [number, number, number, number],
          srs: "EPSG:3067",
          pos: pos as [number, number],
          vectorX: vectorX as [number, number],
          vectorY: vectorY as [number, number],
          gain,
          offset,
        });
      }
    }

    return radarData;
  } catch (error) {
    console.error("Failed to fetch radar metadata", error);
    return [];
  }
}
