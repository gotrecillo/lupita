import vision from "@google-cloud/vision";
import path from "path";
import gm from "gm";


const googleProcess = async () => {
  const client = new vision.ImageAnnotatorClient();
  const documentPath = path.join(process.cwd(), 'resources/factura.png')
  const [result] = await client.textDetection(documentPath);
  const image = gm(documentPath).stroke("#000000", 1);

  result.textAnnotations.forEach(r => image
      .drawLine(r.boundingPoly.vertices[0].x, r.boundingPoly.vertices[0].y, r.boundingPoly.vertices[1].x, r.boundingPoly.vertices[1].y)
      .drawLine(r.boundingPoly.vertices[1].x, r.boundingPoly.vertices[1].y, r.boundingPoly.vertices[2].x, r.boundingPoly.vertices[2].y)
      .drawLine(r.boundingPoly.vertices[2].x, r.boundingPoly.vertices[2].y, r.boundingPoly.vertices[3].x, r.boundingPoly.vertices[3].y)
      .drawLine(r.boundingPoly.vertices[3].x, r.boundingPoly.vertices[3].y, r.boundingPoly.vertices[0].x, r.boundingPoly.vertices[0].y)
  );


  image.write('dibus.png', () => {});
}


