/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This application demonstrates how to perform basic operations on files with
 * the Google Cloud Storage API.
 *
 * For more information, see the README.md under /storage and the documentation
 * at https://cloud.google.com/storage/docs.
 */

'use strict';


const {Storage} = require('@google-cloud/storage');
const storage = new Storage({ projectId: 'iot2analytics-2018' });
const bucketName = 'member_fitness_tracker_storage';

async function uploadFile(filename) {
	await storage.bucket(bucketName).upload(filename, {
		contentType: 'application/json'
	});
console.log(`${filename} uploaded to ${bucketName}.`);

}

function getPrivateUrl(filename) {
	  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}

async function listFiles() {
	const [files] = await storage.bucket(bucketName).getFiles();
	
	  console.log('Files:');
	  files.forEach(file => {
	    console.log(file.name);
	    //console.log(file.metadata);
	  });
	  
	  return files;
	}

async function downloadFile(srcFilename, destFilename) {

  const options = {
    // The path to which the file should be downloaded, e.g. "./file.txt"
    destination: destFilename,
  };

  // Downloads the file
  await storage
    .bucket(bucketName)
    .file(srcFilename)
    .download(options);

  console.log(
    `gs://${bucketName}/${srcFilename} downloaded to ${destFilename}.`
  );
  // [END storage_download_file]
}

async function deleteFile(filename) {
  // Deletes the file from the bucket
  await storage
    .bucket(bucketName)
    .file(filename)
    .delete();

  console.log(`gs://${bucketName}/${filename} deleted.`);
  // [END storage_delete_file]
}

async function getMetadata(filename) {
  // Gets the metadata for the file
  const [metadata] = await storage
    .bucket(bucketName)
    .file(filename)
    .getMetadata();

  console.log(`File: ${metadata.name}`);
  console.log(`Bucket: ${metadata.bucket}`);
  console.log(`Storage class: ${metadata.storageClass}`);
  console.log(`Self link: ${metadata.selfLink}`);
  console.log(`ID: ${metadata.id}`);
  console.log(`Size: ${metadata.size}`);
  console.log(`Updated: ${metadata.updated}`);
  console.log(`Generation: ${metadata.generation}`);
  console.log(`Metageneration: ${metadata.metageneration}`);
  console.log(`Etag: ${metadata.etag}`);
  console.log(`Owner: ${metadata.owner}`);
  console.log(`Component count: ${metadata.component_count}`);
  console.log(`Crc32c: ${metadata.crc32c}`);
  console.log(`md5Hash: ${metadata.md5Hash}`);
  console.log(`Cache-control: ${metadata.cacheControl}`);
  console.log(`Content-type: ${metadata.contentType}`);
  console.log(`Content-disposition: ${metadata.contentDisposition}`);
  console.log(`Content-encoding: ${metadata.contentEncoding}`);
  console.log(`Content-language: ${metadata.contentLanguage}`);
  console.log(`Media link: ${metadata.mediaLink}`);
  console.log(`KMS Key Name: ${metadata.kmsKeyName}`);
  console.log(`Temporary Hold: ${metadata.temporaryHold}`);
  console.log(`Event-based hold: ${metadata.eventBasedHold}`);
  console.log(`Effective Expiration Time: ${metadata.effectiveExpirationTime}`);
  console.log(`Metadata: ${metadata.metadata}`);
  // [END storage_get_metadata]
}



module.exports = {
	uploadFile,
	getPrivateUrl,
	listFiles,
	getMetadata,
	deleteFile,
};