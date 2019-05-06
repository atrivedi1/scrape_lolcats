//3rd party requirements
const cheerio = require('cheerio');
const rp = require('request-promise');
const download = require('image-downloader')

const imageUrls = [];

//wrapper func called on file load
async function saveAllCatImages() {
  await grabImageUrlsByPage(1, 10);
  await downLoadAndSaveImages();
  return;
}

//helper func to populate imageUrls
function grabImageUrlsByPage(page, numPages) {
    let options = {
      uri: `http://www.lolcats.com/page-${page}.html`,
      transform: function (body) {
          return cheerio.load(body);
      }
    }

    return rp(options)
      .then(function ($) {
        if(page <= numPages) {
          let images = $('.lolcat');

          for(let i = 0; i < images.length; i++) {
            let imageSrc = images[i].attribs.src
            imageUrls.push(imageSrc)
          }

          return grabImageUrlsByPage(page + 1, numPages)
        }

        return $;
      })
      .catch(function (err) {
        throw new Error(`failed to fetch image data due to: ${err}`)
      })
    }  


//helper funct to download + save images
function downLoadAndSaveImages() {
  for(let i = 0; i < imageUrls.length; i++) {
    let currImageUrl = imageUrls[i];
    
    options = {
      url: `http://www.lolcats.com/${currImageUrl}`,
      dest: __dirname + `/../public/downloads/`       
    }
    
    download.image(options)
      .then(({ filename, image }) => {
        console.log('File saved to', filename)
        return;
      })
      .catch((err) => {
        throw new Error(`failed to save image data due to: ${err}`)
      })
  }
}

//save cat images
saveAllCatImages();
