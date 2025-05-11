import fs from 'fs';
import https from 'https';
import fetch from 'node-fetch';
import path from 'path';
import { v7 as uuidv7 } from 'uuid';

const agent = new https.Agent({
  rejectUnauthorized: false, // Disable SSL verification
});

/**
 * Fetches metadata for a file from a URL
 *
 * @param {string} url - The URL of the file to get metadata for
 * @returns {Promise<{url: string, contentType: string, contentLength: number|string}|null>} File metadata or null if error
 */
export const getFileMetadata = async (url: string) => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      agent,
      // Add timeout to prevent hanging on slow responses
      timeout: 10000,
    });

    if (!response.ok) {
      console.error(`URL: ${url}. HTTP error! Status: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('Content-Type') || 'Unknown';
    const contentLength = response.headers.get('Content-Length') || 'Unknown';

    return {
      url,
      contentType,
      contentLength:
        contentLength !== 'Unknown' ? Number(contentLength) : contentLength,
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
};

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
 */
export async function downloadFileFromUrl(
  url: string,
  { dirPath, name }: { dirPath: string; name?: string },
): Promise<string> {
  try {
    // Fetch the file from the URL with timeout
    const response = await fetch(url, {
      agent,
      timeout: 30000, // 30 second timeout
    });

    // Check if the response is OK
    if (!response.ok) {
      throw new Error(
        `Failed to fetch file ${url}: ${response.statusText} (${response.status})`,
      );
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
      // Set a timeout for the download
      const downloadTimeout = setTimeout(() => {
        fileStream.close();
        fs.unlink(outputPath, () => {}); // Clean up partial file
        reject(new Error(`Download timeout for ${url}`));
      }, 60000); // 60 second timeout for download completion

      fileStream.on('finish', () => {
        clearTimeout(downloadTimeout);
        resolve(outputPath);
      });

      fileStream.on('error', (error) => {
        clearTimeout(downloadTimeout);
        fs.unlink(outputPath, () => {}); // Delete the file if there's an error
        reject(error);
      });

      // Handle response body errors
      response.body.on('error', (error) => {
        clearTimeout(downloadTimeout);
        fileStream.close();
        fs.unlink(outputPath, () => {}); // Clean up partial file
        reject(error);
      });
    });
  } catch (error) {
    console.error(`Error downloading file from ${url}:`, error);
    throw error;
  }
}

export function createMinimatchPattern(extensions: string[]) {
  return `*.{${extensions.join(',')}}`;
}
