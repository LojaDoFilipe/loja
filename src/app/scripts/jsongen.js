const fs = require('fs');
const path = require('path');

// --- Configuration ---
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node generate-product-json.js <inputDir>');
  process.exit(1);
}

const inputDir = path.resolve(args[0]);
const brand = path.basename(inputDir);  // Extract the brand from the folder name

// Allowed image extensions.
const allowedExtensions = ['.jpg', '.jpeg', '.png', 'gif', '.svg', '.webp'];

// --- Utility Functions ---
function extractSize(imageName) {
  // Extract size based on known patterns
  const sizeRegex = /(2\.5|3\.0|s|m)/;
  const match = imageName.match(sizeRegex);
  return match ? match[0] : 'unknown';
}

function createProductObject(imageName) {
  const id = path.basename(imageName, path.extname(imageName));  // Remove extension for ID
  const name = id.replace(/_/g, ' ');  // Replace underscores with spaces
  const size = extractSize(id);  // Extract size from image name
  const price = 0;  // All prices are 0 as per your request
  const imageUrl = `C:/Users/dfili/Desktop/LojaFilipeSite/LojaDoFilipe/src/assets/images/watermarked/dtd/${imageName}`;
  
  return {
    id,
    name,
    size,
    price,
    imageUrl,
    brand
  };
}

// --- Main Function ---
async function generateProductJson() {
  try {
    // Read all files in the input directory
    const files = fs.readdirSync(inputDir);

    // Filter out non-image files and process each image
    const productList = files
      .filter(file => allowedExtensions.includes(path.extname(file).toLowerCase()))
      .map(file => createProductObject(file));

    // Output file path for the JSON
    const outputFilePath = path.join(inputDir, 'products.json');

    // Write the product list to a JSON file
    fs.writeFileSync(outputFilePath, JSON.stringify(productList, null, 2));

    console.log(`> Product list generated at: ${outputFilePath}`);
    console.log(`> Found ${productList.length} products.`);
  } catch (error) {
    console.error('> Error generating product list:', error);
  }
}

// Call the function to generate the product JSON
generateProductJson();
