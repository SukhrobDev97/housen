/**

 // POSTMAN
 imageUploader
 operations: { "query": "mutation ImageUploader($file: Upload!, $target: String!) { imageUploader(file: $file, target: $target) }", "variables": { "file": null, "target": "member" }}
 map: { "0": ["variables.file"] }
 0: File

 imagesUploader
 operations: { "query": "mutation ImagesUploader($files: [Upload!]!, $target: String!) { imagesUploader(files: $files, target: $target) }", "variables": { "files": [null, null, null, null], "target": "property" }}
 map: { "0": ["variables.files.0"], "1": ["variables.files.1"], "2": ["variables.files.2"], "3": ["variables.files.3"], "4": ["variables.files.4"] }
 0: File
 1: File
 2: File
 3: File
 4: File

 **/
