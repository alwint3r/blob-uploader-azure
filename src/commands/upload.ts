import { BlobServiceClient } from "@azure/storage-blob";
import { parse } from "dotenv";
import { readFile, stat } from "fs/promises";
import { homedir } from "os";
import { basename, join } from "path";
import { CommandBuilder } from "yargs";

export const command = "upload";

export const desc = "Uploads a file to the storage account";

type Options = {
  file: string;
  container: string;
  account: string;
  token?: string;
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
      demandOption: false,
    });

export const handler = async (argv: Options) => {
  const { file, container, account, token } = argv;
  const usedToken = token || (await resolveToken());
  const blobService = new BlobServiceClient(
    getBlobServiceUrl(account, usedToken)
  );
  const containerClient = blobService.getContainerClient(container);

  const filename = basename(file);
  const blobClient = containerClient.getBlockBlobClient(filename);

  await blobClient.uploadFile(file);
};

function getBlobServiceUrl(accountName: string, token: string): string {
  return `https://${accountName}.blob.core.windows.net/?${token}`;
}

async function resolveToken(): Promise<string> {
  const defaultPath = join(homedir(), ".blob-uploader-azure.env");
  if (await stat(defaultPath)) {
    const { TOKEN: token } = parse(await readFile(defaultPath));
    return token;
  }

  throw new Error("No token provided");
}
