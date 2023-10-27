import fs from "fs";
import { Maybe } from "graphql/jsutils/Maybe";
import https from "https";

import { IMAGE_SERVER_URL } from "../const";

const port = process.env.PORT ?? "4001";

export class ImageApi {
  async getImageUrl(
    width?: string,
    height?: Maybe<string>,
    options?: Maybe<string>
  ) {
    const imageName = `public/${width}${height}${options}.svg`;
    const file = fs.createWriteStream(imageName);
    let url = `${IMAGE_SERVER_URL}${width}/${options}`;

    if (height) {
      url = `${IMAGE_SERVER_URL}${width}/${height}/${options}`;
    }

    const writeFilePromise = new Promise((resolve, reject) => {
      https
        .get(url, (response) => {
          response.pipe(file);
          file.on("finish", () => {
            file.close();
            console.log(`Image written with name ${imageName}`);
            resolve(imageName);
          });
        })
        .on("error", (err) => {
          fs.unlink(imageName, () => {
            console.log(`Closed stream since error happened`);
          });
          reject({
            message: `Error downloading image: ${err.message}`,
          });
        });
    });
    try {
      await writeFilePromise;

      return `http://localhost:${port}/${imageName}`;;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
