import { randomUUID } from "node:crypto";
import { Readable, Writable, Transform } from "node:stream";
import { createWriteStream } from "node:fs";

//a fonte de dados pode vir de um arquivo (desafio), site, banco de dados, etc

const readable = Readable({
  read() {
    // 1.000.000
    for (let i = 0; i < 100; i++) {
      const person = {
        id: randomUUID(),
        name: `Person ${i}`,
      };
      const data = JSON.stringify(person);
      this.push(data);
    }
    this.push(null);
  },
});

const mapFields = Transform({
  transform(chunk, encoding, callback) {
    const data = JSON.parse(chunk);
    const result = `${data.id}, ${data.name.toUpperCase()}\n`;
    callback(null, result);
  },
});

const mapHeaders = Transform({
  transform(chunk, encoding, callback) {
    this.counter = this.counter ?? 0;
    if (this.counter) {
      return callback(null, chunk);
    }
    this.counter += 1;

    callback(
      null,
      "ID -                                     NAME\n".concat(chunk)
    );
  },
});

const pipeline = readable
  .pipe(mapFields)
  .pipe(mapHeaders)
  .pipe(createWriteStream("./output.csv"));

pipeline.on("finish", () => console.log("Pipeline finished"));
