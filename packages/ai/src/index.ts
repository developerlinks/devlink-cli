import { OpenAI } from 'langchain/llms/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { VectorStoreToolkit, createVectorStoreAgent, VectorStoreInfo } from 'langchain/agents';

export const explainCode = async directoryPath => {
  const loader = new DirectoryLoader(directoryPath, {
    '.ts': path => new TextLoader(path),
  });
  const openAIApiKey = process.env.OPENAI_API_KEY;

  const model = new OpenAI({ temperature: 0, openAIApiKey });
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey,
  });
  const documents = await loader.load();
  const typescriptCode = documents.map(doc => doc.pageContent);
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments(typescriptCode);

  const vectorStore = await HNSWLib.fromDocuments(docs, embeddings);
  const vectorStoreInfo: VectorStoreInfo = {
    name: 'code',
    description: 'code',
    vectorStore,
  };
  const toolkit = new VectorStoreToolkit(vectorStoreInfo, model);
  const agent = createVectorStoreAgent(model, toolkit);

  const input = 'Summarize the meaning in chinese';
  console.log(`Executing: ${input}`);
  const result = await agent.call({ input });
  console.log(`Got output ${result.output}`);
};
