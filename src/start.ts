import { Container } from "./service/Container";

const container = new Container();

container
  .getKoaService()
  .start();
