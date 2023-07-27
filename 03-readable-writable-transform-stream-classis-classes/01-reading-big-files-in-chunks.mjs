//for i in `seq 1 20`; do node -e "process.stdout.write('hello world'.repeat(1e7))" >> big.file; done

// Importando módulos do Node.js para trabalhar com arquivos
import { promises, createReadStream, statSync } from "node:fs";

// Definindo o nome do arquivo a ser lido
const filename = "./big.file";

// Lendo o arquivo de uma vez (modo assíncrono)
try {
  const file = await promises.readFile(filename);
  console.log("fileSize", file.byteLength / 1e6, "MB"); // Exibe o tamanho do arquivo em MB
  console.log("fileBuffer", file); // Mostra o conteúdo do arquivo em formato de buffer
} catch (error) {
  console.log("error: max size reached", error.message);
}

// Obtendo o tamanho do arquivo de outra forma (modo síncrono)
const { size } = statSync(filename);
console.log("fileSize", size / 1e6, "MB"); // Exibe o tamanho do arquivo em MB

// Inicializando uma variável para acompanhar quantos bytes foram consumidos do arquivo
let chunkComsumed = 0;

// Criando um fluxo de leitura para ler o arquivo por partes (streaming)
const stream = createReadStream(filename)
  // Evento acionado quando o fluxo de leitura começa a ler os dados do arquivo
  .once("data", (msg) => {
    console.log("on data length", msg.toString()); // Exibe o tamanho da primeira parte dos dados lidos
  })

  // Evento acionado quando há dados disponíveis para serem lidos do fluxo
  .once("readable", () => {
    // Lendo 11 bytes da primeira parte dos dados e mostrando esses pedaços
    console.log("read 11 chunk bytes", stream.read(11).toString());
    // Lendo 5 bytes da segunda parte dos dados e mostrando esses pedaços
    console.log("read 5 chunk bytes", stream.read(5).toString());

    // Contando a quantidade de bytes consumidos até o momento
    chunkComsumed += 11 + 5;
  })

  // Evento acionado quando há mais dados disponíveis para serem lidos do fluxo
  .on("readable", () => {
    let chunk;
    // Enquanto houver dados disponíveis no fluxo, continua lendo e consumindo esses dados
    while (null !== (chunk = stream.read())) {
      chunkComsumed += chunk.length;
    }
  })

  // Evento acionado quando todo o arquivo foi lido e o fluxo de leitura chegou ao fim
  .on("end", () => {
    // Exibe o tamanho total do arquivo lido em gigabytes (GB)
    console.log(`Read ${chunkComsumed / 1e9} bytes`);
  });
