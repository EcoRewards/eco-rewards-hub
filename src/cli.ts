import { CliContainer } from "./cli/CliContainer";

const container = new CliContainer();

const [,, command, ...args] = process.argv;

container
  .get(command)
  .then(c => c.run(...args))
  .catch(e => console.error(e))
  .finally(() => container.shutdown());
