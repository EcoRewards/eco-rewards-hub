import { CliContainer } from "./cli/CliContainer";

const container = new CliContainer();

const [exec, script, command, ...args] = process.argv;

container
  .get(command)
  .then(c => c.run(...args))
  .catch(e => console.error(e))
  .finally(() => container.shutdown());