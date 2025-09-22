const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createCanvas } = require('canvas');

// --- Configuration ---
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node generate-image-list.js <inputDir> <outputDir>');
  process.exit(1);
}
const imagesDirectory = path.resolve(args[0]);
const outputDirectory = path.resolve(args[1]);

// The base path for the 'src' attribute in the JSON file.
const publicBasePath = '/assets/images/';
const allowedExtensions = ['.jpg', '.jpeg', '.png', 'gif', '.svg', '.webp'];

async function generateImageList() {
  try {
    const files = fs.readdirSync(imagesDirectory);

    for (const file of files) {
      const extension = path.extname(file).toLowerCase();
      if (!allowedExtensions.includes(extension)) continue;

      const inputPath = path.join(imagesDirectory, file);
      const outputPath = path.join(outputDirectory, file);

      const imageMetadata = await sharp(inputPath).metadata();
      const imageWidth = imageMetadata.width;
      const imageHeight = imageMetadata.height;

      // Create the watermark canvas
      const watermarkText = 'Loja do Filipe';
      const canvas = createCanvas(imageWidth, imageHeight);
      const ctx = canvas.getContext('2d');
      ctx.font = 'bold 150px Arial'; // Increase the font size
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // Semi-transparent white
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Rotate the context for diagonal text
      ctx.save();
      ctx.translate(imageWidth / 2, imageHeight / 2); // Start from the center of the image
      ctx.rotate(-Math.PI / 4); // Rotate by 45 degrees for diagonal
      ctx.fillText(watermarkText, 0, 0); // Draw the watermark text
      ctx.restore();

      // Convert canvas to buffer
      const watermarkBuffer = canvas.toBuffer();

      // Composite the watermark onto the image
      await sharp(inputPath)
        .composite([{ input: watermarkBuffer, gravity: 'center' }])
        .toFile(outputPath);
    }

    console.log(`Watermarked images saved to ${outputDirectory}`);
  } catch (error) {
    console.error('Error processing images:', error);
  }
}

generateImageList();