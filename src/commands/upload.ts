import { BlobServiceClient } from "@azure/storage-blob";
import { basename } from "path";
import { CommandBuilder } from "yargs";

export const command = "upload";

export const desc = "Uploads a file to the storage account";

type Options = {
  file: string;
  container: string;
  account: string;
  token: string;
};

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .option("file", {
      alias: "f",
      describe: "The file to upload",
      type: "string",
      demandOption: true,
    })
    .option("container", {
      alias: "c",
      describe: "The container to upload to",
      type: "string",
      demandOption: true,
    })
    .option("account", {
      alias: "a",
      describe: "The storage account to upload to",
      type: "string",
      demandOption: true,
    })
    .option("token", {
      alias: "t",
      describe: "The token to use for authentication",
      type: "string",
      demandOption: true,
    });

export const handler = async (argv: Options) => {
  const { file, container, account, token } = argv;
  const blobService = new BlobServiceClient(getBlobServiceUrl(account, token));
  const containerClient = blobService.getContainerClient(container);

  const filename = basename(file);
  const blobClient = containerClient.getBlockBlobClient(filename);

  await blobClient.uploadFile(file);
};

function getBlobServiceUrl(accountName: string, token: string): string {
  return `https://${accountName}.blob.core.windows.net/?${token}`;
}
