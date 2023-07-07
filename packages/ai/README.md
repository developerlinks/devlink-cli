# `ai`

This npm package, **@devlink/ai**, provides a high-level API to embed code documents using OpenAI's language model.

This package allows you to:

- Load code documents from a directory
- Embed documents using OpenAI embeddings
- Organize embedded documents in a vector store for easy searching and retrieval
- Support azureOpenAI and openai

## Install

Install the package with npm:

```bash
npm install @devlink/ai
```

## Usage

The following is a sample usage of the package:

```typescript
import { embeddingCode, llmConfig } from '@devlink/ai';

const openAIConfig: llmConfig = {
  openAIApiKey: 'your-openai-api-key',
};

const openAIEmbeddingConfig: llmConfig = {
  openAIApiKey: 'your-openai-api-key',
};

const directoryPath = './path/to/your/documents';
const fileTypeArray = ['ts', 'js', 'rs'];

const { agent } = await embeddingCode({
  directoryPath: path,
  fileTypeArray,
  openAIConfig,
  openAIEmbeddingConfig,
});
const input = 'Explain the meaning of these codes step by step.';
const result = await agent.call({ input });
```

## Use in @devlink/cli

![devlink/ai-examples](https://qiniuyun.devlink.wiki/devlink%3Aai-explame.png)

## API

### embeddingCode

The `embeddingCode` function is an asynchronous function that allows you to load, embed, and organize textual documents from a directory.

```typescript
export const embeddingCode = async ({
  directoryPath,
  fileTypeArray,
  openAIConfig,
  openAIEmbeddingConfig,
}: ExplainCodeOptions) => { ... }
```

#### Parameters:

- **directoryPath** (_string_): The path of the directory containing the documents to be loaded.
- **fileTypeArray** (_string[]_): The file types to be loaded.
- **openAIConfig** (_llmConfig_): Configuration object for OpenAI language model.
- **openAIEmbeddingConfig** (_llmConfig_): Configuration object for OpenAI Embedding model.

#### Return:

The function returns a Promise that resolves with an object containing the `agent` for the created vector store.

### llmConfig

The `llmConfig` is an interface that represents the configuration needed for OpenAI language model.

```typescript
export type llmConfig = Partial<OpenAIInput> & Partial<AzureOpenAIInput> & BaseLLMParams;
```

## Examples

The following code can be used as an example:

```typescript
import { embeddingCode, llmConfig } from '@devlink/ai';

const openAIConfig: llmConfig = {
  openAIApiKey: 'your-openai-api-key',
};

const azureOpenAIConfig: llmConfig = {
  azureOpenAIApiVersion: '2022-12-01',
  azureOpenAIApiKey: 'your-azure-openai-api-key',
  azureOpenAIApiInstanceName: 'your-azure-openai-api-instance-name',
  azureOpenAIApiDeploymentName: 'your-azure-openai-api-deployment-name',
  azureOpenAIApiEmbeddingsDeploymentName: 'your-azure-openai-api-embeddings-deployment-name',
};

// const openAIConfig = openaiConfig or azureOpenAIConfig;

const directoryPath = './path/to/your/documents';
const fileTypeArray = ['ts', 'js', 'rs'];

const openAIEmbeddingConfig: llmConfig = {
  openAIApiKey,
};

const directoryPath = './path/to/your/documents';
const fileTypeArray = ['ts', 'js', 'rs'];

const { agent } = await embeddingCode({
  directoryPath: path,
  fileTypeArray,
  openAIConfig,
  openAIEmbeddingConfig,
});
const input = 'Explain the meaning of these codes step by step.';
const result = await agent.call({ input });
```
