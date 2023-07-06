import { AzureOpenAIInput, OpenAI, OpenAIInput } from 'langchain/llms/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { VectorStoreToolkit, createVectorStoreAgent, VectorStoreInfo } from 'langchain/agents';
import { Document } from 'langchain/dist/document';
import { BaseLLMParams } from 'langchain/dist/llms/base';

type LoaderObject = { [key: string]: (path: string) => TextLoader };

/**
 * Create the file loaders object.
 * @param {string[]} fileTypeArray - Array of file types.
 * @returns {LoaderObject} - The file loaders object.
 */
const createFileLoaders = (fileTypeArray: string[]): LoaderObject => {
  return fileTypeArray.reduce((prev: LoaderObject, fileType: string): LoaderObject => {
    return {
      ...prev,
      ['.' + fileType]: (path: string) => new TextLoader(path),
    };
  }, {});
};

/**
 * Load documents from a directory.
 * @param {DirectoryLoader} loader - The DirectoryLoader instance.
 * @returns {Promise<Document[]>} - The loaded documents.
 * @throws {Error} - If an error occurred while loading documents.
 */
const loadDocuments = async (loader: DirectoryLoader) => {
  try {
    return await loader.load();
  } catch (error) {
    throw new Error(`Failed to load documents: ${error}`);
  }
};

/**
 * Embed documents using OpenAIEmbeddings.
 * @param {Document[]} documents - The documents to embed.
 * @param {OpenAIEmbeddings} embeddings - The OpenAIEmbeddings instance.
 * @returns {Promise<VectorStore>} - The VectorStore instance.
 * @throws {Error} - If an error occurred while embedding documents.
 */
const embedDocuments = async (documents: Document[], embeddings: OpenAIEmbeddings) => {
  try {
    return await HNSWLib.fromDocuments(documents, embeddings);
  } catch (error) {
    throw new Error(`Failed to embed documents: ${error}`);
  }
};

interface ExplainCodeOptions {
  directoryPath: string;
  fileTypeArray: string[];
  llmConfig: llmConfig;
}

/**
 * @example
 * const config: llmConfig = {
 *   azureOpenAIApiVersion: '2022-12-01',
 *   azureOpenAIApiKey: 'x',
 *   azureOpenAIApiInstanceName: 'x',
 *   azureOpenAIApiDeploymentName: 'x',
 *   azureOpenAIApiEmbeddingsDeploymentName: 'x',
 * };
 */
export type llmConfig = Partial<OpenAIInput> & Partial<AzureOpenAIInput> & BaseLLMParams;

export const embeddingCode = async ({
  directoryPath,
  fileTypeArray,
  llmConfig,
}: ExplainCodeOptions) => {
  try {
    const fileLoaders = createFileLoaders(fileTypeArray);
    const loader = new DirectoryLoader(directoryPath, fileLoaders);
    const model = new OpenAI(llmConfig);
    const embeddings = new OpenAIEmbeddings(llmConfig);
    const documents = await loadDocuments(loader);
    const code = documents.map(doc => doc.pageContent);
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
    const codeDocuments = await textSplitter.createDocuments(code);
    const vectorStore = await embedDocuments(codeDocuments, embeddings);
    const vectorStoreInfo: VectorStoreInfo = { name: 'code', description: 'code', vectorStore };
    const toolkit = new VectorStoreToolkit(vectorStoreInfo, model);
    const agent = createVectorStoreAgent(model, toolkit);

    return { agent };
  } catch (error) {
    console.error(`Error embedding code: ${error}`);
    throw error;
  }
};
