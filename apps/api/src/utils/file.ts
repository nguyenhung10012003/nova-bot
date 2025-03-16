import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { v7 as uuidv7 } from 'uuid';
import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: false, // Disable SSL verification
});


/**
 * Downloads a file from a given URL and saves it to the specified directory with an optional custom name.
 * If no name is provided, a random name will be generated using UUID v7.
 *
 * @param {string} url - The URL of the file to download.
 * @param {Object} options - The options for saving the file.
 * @param {string} options.dirPath - The directory path where the downloaded file will be saved.
 * @param {string} [options.name] - The custom name for the downloaded file (optional).
 * @returns {Promise<string>} A promise that resolves with the name of the downloaded file.
 * @throws {Error} Throws an error if the download fails or the response is not OK.
 *
 * @example
 * // Example usage:
 * const fileUrl = 'https://example.com/path/to/your/file.pdf';
 *
 * // With custom name
 * downloadFileFromUrl(fileUrl, { dirPath: './downloads', name: 'my-file.pdf' })
 *   .then((filePath) => {
 *     console.log('File downloaded successfully to:', filePath);
 *   })
 *   .catch((error) => {
 *     console.error('Download failed:', error);
 *   });
 *
 * // Without custom name (auto-generated name)
 * downloadFileFromUrl(fileUrl, { dirPath: './downloads' })
 *   .then((filePath) => {
 *     console.log('File downloaded successfully to:', filePath);
 *   })
 *   .catch((error) => {
 *     console.error('Download failed:', error);
 *   });
 */
export async function downloadFileFromUrl(
  url: string,
  { dirPath, name }: { dirPath: string; name?: string },
): Promise<string> {
  try {
    // Fetch the file from the URL
    const response = await fetch(url, {agent});

    // Check if the response is OK
    if (!response.ok) {
      throw new Error(`Failed to fetch file ${url}: ${response.statusText}`);
    }

    // Generate a random name using UUID v7 if no name is provided
    const fileExtension = path.extname(url);
    const fileName = name || `${uuidv7()}${fileExtension}`;
    const outputPath = path.join(dirPath, fileName);

    // Ensure the directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Create a writable stream to save the file
    const fileStream = fs.createWriteStream(outputPath);

    // Pipe the response body to the file stream
    response.body.pipe(fileStream);

    // Return a promise that resolves when the file is fully written
    return new Promise((resolve, reject) => {
      fileStream.on('finish', () => {
        resolve(outputPath);
      });

      fileStream.on('error', (error) => {
        fs.unlink(outputPath, () => {}); // Delete the file if there's an error
        reject(error);
      });
    });
  } catch (error) {
    throw error;
  }
}

export function createMinimatchPattern(extensions: string[]) {
  return `*.{${extensions.join(',')}}`;
}
