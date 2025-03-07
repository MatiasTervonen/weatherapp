// import { NextResponse } from "next/server"; // handels the Api call
// import { parseStringPromise } from "xml2js"; // parses XML data to JSON format

// interface RadarData {
//   time: string;
//   url: string;
//   bbox: [number, number, number, number];
//   srs: string;
// }

// async function fetchRadarData(): Promise<RadarData[]> {
//   try {
//     const url =
//       "https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=GetFeature&storedquery_id=fmi::radar::composite::rr";

//     const response = await fetch(url);
//     const xmlText = await response.text();

//     // Convert XML to JSON
//     const jsonData = await parseStringPromise(xmlText, {
//       explicitArray: false,
//     });

//     console.log(jsonData);

//     // extracting the weather Data from JSON Data.

//     const features = jsonData["wfs:FeatureCollection"]["wfs:member"];
//     const radarData: RadarData[] = [];

//     if (Array.isArray(features)) {
//       features.forEach((feature) => {
//         const property = feature["omso:GridSeriesObservation"];

//         const time =
//           property["om:phenomenonTime"]["gml:TimeInstant"]["gml:timePosition"];

//         const imageUrl =
//           property["om:result"]["gmlcov:RectifiedGridCoverage"]["gml:rangeSet"][
//             "gml:File"
//           ]["gml:fileReference"];

//         const bboxString =
//           property["om:featureOfInterest"]["sams:SF_SpatialSamplingFeature"][
//             "sams:shape"
//           ]["gml:Polygon"]["gml:exterior"]["gml:LinearRing"]["gml:coordinates"];
//         const bboxValues = bboxString.trim().split(" ").map(parseFloat);

//         if (bboxValues.length < 8) {
//           console.error("Invalid bounding box format", bboxValues);
//           return;
//         }

//         // Convert bbox to [minX, minY, maxX, maxY]
//         const bbox: [number, number, number, number] = [
//           bboxValues[0],
//           bboxValues[1], // minX, minY
//           bboxValues[4],
//           bboxValues[5], // maxX, maxY
//         ];

//         const srs =
//           property["om:featureOfInterest"]["sams:SF_SpatialSamplingFeature"][
//             "sams:shape"
//           ]["gml:Polygon"]["$"]["srsName"];

//         radarData.push({
//           time: new Date(time).toISOString(),
//           url: imageUrl,
//           bbox: bbox,
//           srs: srs,
//         });
//       });
//     }

//     console.log(radarData);

//     return radarData;
//   } catch (error) {
//     console.error("Failed to fetch radar data", error);
//     return [];
//   }
// }

// export async function GET(
//   reg: Request
// ): Promise<NextResponse<RadarData[] | { error: string }>> {
//   try {
//     const radarData: RadarData[] = await fetchRadarData();

//     if (radarData.length === 0) {
//       return NextResponse.json(
//         { error: "Failed to fetch radar data" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(radarData, {
//       headers: {
//         "Cache-Control": "s-maxage=300, stale-while-revalidate",
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching radar data:", error);
//     return NextResponse.json(
//       { error: "Failed to process radar data" },
//       { status: 500 }
//     );
//   }
// }
